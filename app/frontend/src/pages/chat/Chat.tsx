import { useRef, useState, useEffect } from "react";
import { Checkbox, Panel, DefaultButton, TextField, SpinButton, Slider } from "@fluentui/react";
import { SparkleFilled } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import readNDJSONStream from "ndjson-readablestream";
import styles from "./Chat.module.css";

import {
    chatApi,
    configApi,
    RetrievalMode,
    ChatAppResponse,
    ChatAppResponseOrError,
    ChatAppRequest,
    ResponseMessage,
    VectorFieldOptions,
    GPT4VInput
} from "../../api";
import Modal from "react-modal";
import { Answer, AnswerError, AnswerLoading } from "../../components/Answer";
import { QuestionInput } from "../../components/QuestionInput";
import { ExampleList } from "../../components/Example";
import { UserChatMessage } from "../../components/UserChatMessage";
import { AnalysisPanel, AnalysisPanelTabs } from "../../components/AnalysisPanel";
import { SettingsButton } from "../../components/SettingsButton";
import { ClearChatButton } from "../../components/ClearChatButton";
import { UploadFile } from "../../components/UploadFile";
import { useLogin, getToken, isLoggedIn, requireAccessControl } from "../../authConfig";
import { VectorSettings } from "../../components/VectorSettings";
import { useMsal } from "@azure/msal-react";
import { TokenClaimsDisplay } from "../../components/TokenClaimsDisplay";
import { GPT4VSettings } from "../../components/GPT4VSettings";
import { Mic28Filled, Record24Regular } from "@fluentui/react-icons";
import newPauliteiro from "../../assets/new-pauliteiro.mp4";
import { BsVolumeUpFill, BsVolumeMuteFill } from "react-icons/bs";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

const Chat = () => {
    const { t } = useTranslation();
    const [language, setLanguage] = useState<string>("pt");
    const [color, setColor] = useState("#B9A149");
    const [colorHeader, setColorHeader] = useState("#E1D4A7");
    const [menuOpen, setMenuOpen] = useState(false);
    const [languageTitle, setIlanguageTitle] = useState("Guia Prático do Município");

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };
    const [selectedMenuItem, setSelectedMenuItem] = useState("");

    type MenuItem = "geral" | "turismo" | "historia" | "cultura";
    type Language = "en" | "pt" | "es" | "fr";

    const titles: Record<MenuItem, Record<Language, string>> = {
        geral: {
            en: "Guia Prático do Município",
            pt: "Guia Prático do Município",
            es: "Guia Prático do Município",
            fr: "Guia Prático do Município"
        },
        turismo: {
            en: "Guia Prático do Município - Tourism",
            pt: "Guia Prático do Município - Turismo",
            es: "Guia Prático do Município - Turismo",
            fr: "Guia Prático do Município - Tourisme"
        },
        historia: {
            en: "Guia Prático do Município - History and Heritage",
            pt: "Guia Prático do Município - Historia e Patrimonio",
            es: "Guia Prático do Município - Historia y Patrimonio",
            fr: "Guia Prático do Município - Histoire et Patrimoine"
        },
        cultura: {
            en: "Guia Prático do Município - Culture",
            pt: "Guia Prático do Município - Cultura",
            es: "Guia Prático do Município - Cultura",
            fr: "Guia Prático do Município - Culture"
        }
    };
    const handleMenuItemClick = (item: MenuItem) => {
        setSelectedMenuItem(item);
        setShowPopupDisclaimer(false); // Fechar a modal quando o botão for clicado

        const title = titles[item][language as Language];

        switch (item) {
            case "geral":
                setColor("#B9A149");
                setColorHeader("#E1D4A7");
                break;
            case "turismo":
                setColor("#1C5D89");
                setColorHeader("#C5DFEE");
                break;
            case "historia":
                setColor("#7B3F32"); // nova cor semelhante
                setColorHeader("#E8CEC4"); // nova cor semelhante
                break;
            case "cultura":
                setColor("#8A3D2E"); // nova cor semelhante
                setColorHeader("#EAD4CA"); // nova cor semelhante
                break;
            default:
                setColor("#B9A149");
                setColorHeader("#E1D4A7");
        }
        setIlanguageTitle(title);
        setMenuOpen(false);
    };

    const handleLanguageChange = (lang: string) => {
        setLanguage(lang);
    };

    const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
    const [promptTemplate, setPromptTemplate] = useState<string>("");
    const [temperature, setTemperature] = useState<number>(0.3);
    const [minimumRerankerScore, setMinimumRerankerScore] = useState<number>(0);
    const [minimumSearchScore, setMinimumSearchScore] = useState<number>(0);
    const [retrieveCount, setRetrieveCount] = useState<number>(3);
    const [retrievalMode, setRetrievalMode] = useState<RetrievalMode>(RetrievalMode.Hybrid);
    const [useSemanticRanker, setUseSemanticRanker] = useState<boolean>(true);
    const [shouldStream, setShouldStream] = useState<boolean>(true);
    const [useSemanticCaptions, setUseSemanticCaptions] = useState<boolean>(false);
    const [excludeCategory, setExcludeCategory] = useState<string>("");
    const [useSuggestFollowupQuestions, setUseSuggestFollowupQuestions] = useState<boolean>(false);
    const [vectorFieldList, setVectorFieldList] = useState<VectorFieldOptions[]>([VectorFieldOptions.Embedding]);
    const [useOidSecurityFilter, setUseOidSecurityFilter] = useState<boolean>(false);
    const [useGroupsSecurityFilter, setUseGroupsSecurityFilter] = useState<boolean>(false);
    const [gpt4vInput, setGPT4VInput] = useState<GPT4VInput>(GPT4VInput.TextAndImages);
    const [useGPT4V, setUseGPT4V] = useState<boolean>(false);
    const [isSoundOn, setIsSoundOn] = useState(true);

    const lastQuestionRef = useRef<string>("");
    const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    const [error, setError] = useState<unknown>();
    const [showPopup, setShowPopup] = useState(false);

    const [activeCitation, setActiveCitation] = useState<string>();
    const [activeAnalysisPanelTab, setActiveAnalysisPanelTab] = useState<AnalysisPanelTabs | undefined>(undefined);

    const [selectedAnswer, setSelectedAnswer] = useState<number>(0);
    const [answers, setAnswers] = useState<[user: string, response: ChatAppResponse][]>([]);
    const [streamedAnswers, setStreamedAnswers] = useState<[user: string, response: ChatAppResponse][]>([]);
    const [showGPT4VOptions, setShowGPT4VOptions] = useState<boolean>(false);
    const [showSemanticRankerOption, setShowSemanticRankerOption] = useState<boolean>(false);
    const [showVectorOption, setShowVectorOption] = useState<boolean>(false);
    const [showUserUpload, setShowUserUpload] = useState<boolean>(false);
    const [showPopupDisclaimer, setShowPopupDisclaimer] = useState(true);
    const [isActive, setIsActive] = useState(false);

    const handleVoiceInput = () => {
        const speechConfig = sdk.SpeechConfig.fromSubscription("54f08182a9654cca8e01cf697e38b004", "westeurope");
        speechConfig.speechRecognitionLanguage = "pt-PT";
        setIsActive(true);
        const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
        let recognizer: sdk.SpeechRecognizer | undefined;

        recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

        recognizer.recognizeOnceAsync(
            (result: { text: any }) => {
                const recognizedText = result.text;
                console.log("recognized", recognizedText);
                makeApiRequest(recognizedText);

                recognizer?.close();
                setIsActive(false);
                recognizer = undefined;
            },
            (err: string) => {
                console.trace("err - " + err);

                recognizer?.close();
                recognizer = undefined;
            }
        );

        // const player = new sdk.SpeakerAudioDestination();
    };
    const closePopup = () => {
        setShowPopup(false);
    };

    const closePopupDisclaimer = () => {
        setShowPopupDisclaimer(false);
    };

    const getConfig = async () => {
        configApi().then(config => {
            setShowGPT4VOptions(config.showGPT4VOptions);
            setUseSemanticRanker(config.showSemanticRankerOption);
            setShowSemanticRankerOption(config.showSemanticRankerOption);
            setShowVectorOption(config.showVectorOption);
            if (!config.showVectorOption) {
                setRetrievalMode(RetrievalMode.Text);
            }
            setShowUserUpload(config.showUserUpload);
        });
    };

    const handleAsyncRequest = async (question: string, answers: [string, ChatAppResponse][], setAnswers: Function, responseBody: ReadableStream<any>) => {
        let answer: string = "";
        let askResponse: ChatAppResponse = {} as ChatAppResponse;

        const updateState = (newContent: string) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    answer += newContent;
                    const latestResponse: ChatAppResponse = {
                        ...askResponse,
                        choices: [{ ...askResponse.choices[0], message: { content: answer, role: askResponse.choices[0].message.role } }]
                    };
                    setStreamedAnswers([...answers, [question, latestResponse]]);
                    resolve(null);
                }, 33);
            });
        };
        try {
            setIsStreaming(true);
            for await (const event of readNDJSONStream(responseBody)) {
                if (event["choices"] && event["choices"][0]["context"] && event["choices"][0]["context"]["data_points"]) {
                    event["choices"][0]["message"] = event["choices"][0]["delta"];
                    askResponse = event as ChatAppResponse;
                } else if (event["choices"] && event["choices"][0]["delta"]["content"]) {
                    setIsLoading(false);
                    await updateState(event["choices"][0]["delta"]["content"]);
                } else if (event["choices"] && event["choices"][0]["context"]) {
                    // Update context with new keys from latest event
                    askResponse.choices[0].context = { ...askResponse.choices[0].context, ...event["choices"][0]["context"] };
                } else if (event["error"]) {
                    throw Error(event["error"]);
                }
            }
        } finally {
            setIsStreaming(false);
        }
        const fullResponse: ChatAppResponse = {
            ...askResponse,
            choices: [{ ...askResponse.choices[0], message: { content: answer, role: askResponse.choices[0].message.role } }]
        };
        return fullResponse;
    };

    const client = useLogin ? useMsal().instance : undefined;

    const makeApiRequest = async (question: string) => {
        lastQuestionRef.current = question;

        error && setError(undefined);
        setIsLoading(true);
        setActiveCitation(undefined);
        setActiveAnalysisPanelTab(undefined);

        const token = client ? await getToken(client) : undefined;

        try {
            const messages: ResponseMessage[] = answers.flatMap(a => [
                { content: a[0], role: "user" },
                { content: a[1].choices[0].message.content, role: "assistant" }
            ]);

            const request: ChatAppRequest = {
                messages: [...messages, { content: question, role: "user" }],
                stream: shouldStream,
                context: {
                    overrides: {
                        prompt_template: promptTemplate.length === 0 ? undefined : promptTemplate,
                        exclude_category: excludeCategory.length === 0 ? undefined : excludeCategory,
                        top: retrieveCount,
                        temperature: temperature,
                        minimum_reranker_score: minimumRerankerScore,
                        minimum_search_score: minimumSearchScore,
                        retrieval_mode: retrievalMode,
                        semantic_ranker: useSemanticRanker,
                        semantic_captions: useSemanticCaptions,
                        suggest_followup_questions: useSuggestFollowupQuestions,
                        use_oid_security_filter: useOidSecurityFilter,
                        use_groups_security_filter: useGroupsSecurityFilter,
                        vector_fields: vectorFieldList,
                        use_gpt4v: useGPT4V,
                        gpt4v_input: gpt4vInput
                    }
                },
                // ChatAppProtocol: Client must pass on any session state received from the server
                session_state: answers.length ? answers[answers.length - 1][1].choices[0].session_state : null
            };

            const response = await chatApi(request, token);
            if (!response.body) {
                throw Error("No response body");
            }
            if (shouldStream) {
                const parsedResponse: ChatAppResponse = await handleAsyncRequest(question, answers, setAnswers, response.body);
                setAnswers([...answers, [question, parsedResponse]]);
            } else {
                const parsedResponse: ChatAppResponseOrError = await response.json();
                if (response.status > 299 || !response.ok) {
                    throw Error(parsedResponse.error || "Unknown error");
                }
                setAnswers([...answers, [question, parsedResponse as ChatAppResponse]]);
            }
        } catch (e) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        lastQuestionRef.current = "";
        error && setError(undefined);
        setActiveCitation(undefined);
        setActiveAnalysisPanelTab(undefined);
        setAnswers([]);
        setStreamedAnswers([]);
        setIsLoading(false);
        setIsStreaming(false);
    };

    useEffect(() => chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" }), [isLoading]);
    useEffect(() => chatMessageStreamEnd.current?.scrollIntoView({ behavior: "auto" }), [streamedAnswers]);
    useEffect(() => {
        getConfig();
    }, []);

    const onPromptTemplateChange = (_ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setPromptTemplate(newValue || "");
    };

    const onTemperatureChange = (
        newValue: number,
        range?: [number, number],
        event?: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent | React.KeyboardEvent
    ) => {
        setTemperature(newValue);
    };

    const onMinimumSearchScoreChange = (_ev?: React.SyntheticEvent<HTMLElement, Event>, newValue?: string) => {
        setMinimumSearchScore(parseFloat(newValue || "0"));
    };

    const onMinimumRerankerScoreChange = (_ev?: React.SyntheticEvent<HTMLElement, Event>, newValue?: string) => {
        setMinimumRerankerScore(parseFloat(newValue || "0"));
    };

    const onRetrieveCountChange = (_ev?: React.SyntheticEvent<HTMLElement, Event>, newValue?: string) => {
        setRetrieveCount(parseInt(newValue || "3"));
    };

    const onUseSemanticRankerChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseSemanticRanker(!!checked);
    };

    const onUseSemanticCaptionsChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseSemanticCaptions(!!checked);
    };

    const onShouldStreamChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setShouldStream(!!checked);
    };

    const onExcludeCategoryChanged = (_ev?: React.FormEvent, newValue?: string) => {
        setExcludeCategory(newValue || "");
    };

    const onUseSuggestFollowupQuestionsChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseSuggestFollowupQuestions(!!checked);
    };

    const onUseOidSecurityFilterChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseOidSecurityFilter(!!checked);
    };

    const onUseGroupsSecurityFilterChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseGroupsSecurityFilter(!!checked);
    };

    const onExampleClicked = (example: string) => {
        makeApiRequest(example);
    };

    const onShowCitation = (citation: string, index: number) => {
        if (activeCitation === citation && activeAnalysisPanelTab === AnalysisPanelTabs.CitationTab && selectedAnswer === index) {
            setActiveAnalysisPanelTab(undefined);
        } else {
            setActiveCitation(citation);
            setActiveAnalysisPanelTab(AnalysisPanelTabs.CitationTab);
        }

        setSelectedAnswer(index);
    };

    const onToggleTab = (tab: AnalysisPanelTabs, index: number) => {
        if (activeAnalysisPanelTab === tab && selectedAnswer === index) {
            setActiveAnalysisPanelTab(undefined);
        } else {
            setActiveAnalysisPanelTab(tab);
        }

        setSelectedAnswer(index);
    };

    const getPlaceholderText = (language?: string): string => {
        switch (language) {
            case "es":
                return "Ingrese su pregunta";
            case "fr":
                return "Tapez votre question";
            case "de":
                return "Geben Sie Ihre Frage ein";
            case "pt":
                return "Digite a sua Pergunta";
            case "en":
                return "Enter your Question";
            default:
                return "Enter your Question";
        }
    };

    return (
        <div className={styles.container}>
            <Modal isOpen={showPopupDisclaimer} onRequestClose={closePopupDisclaimer} className={styles.popupContainer} overlayClassName={styles.overlay}>
                <div className={styles.modalContent}>
                    <button className={styles.closeButton} onClick={closePopupDisclaimer}>
                        &times;
                    </button>
                    <h2>Bem-vindo ao GPM!</h2>
                    <p>Para melhorar o assistente virtual, as perguntas e as respostas geradas serão armazenadas por um período de 7 dias.</p>
                    <p>
                        Pedimos que não insira dados pessoais quando colocar as suas questões. Caso o faça, os mesmos serão guardados, à semelhança de todas as
                        perguntas e respostas, durante 7 dias, para efeitos de melhoria do serviço. Após esse prazo, serão eliminados.
                    </p>
                    <p>Use as sugestões de perguntas, ou coloque sua própria questão na área indicada:</p>
                    <hr></hr>
                    <p>Quais são as áreas que você tem interesse em saber?</p>
                    <div className={styles.buttonGroup}>
                        <button className={`${styles.optionButton} ${styles.fullWidthButton}`} onClick={() => handleMenuItemClick("geral")}>
                            Geral
                        </button>
                    </div>
                    <div className={styles.buttonGroup}>
                        <button className={styles.optionButton} onClick={() => handleMenuItemClick("turismo")}>
                            Turismo
                        </button>
                        <button className={styles.optionButton} onClick={() => handleMenuItemClick("historia")}>
                            Historia e Patrimonio
                        </button>
                        <button className={styles.optionButton} onClick={() => handleMenuItemClick("cultura")}>
                            Cultura
                        </button>
                    </div>
                </div>
            </Modal>
            <div className={styles.header} style={{ backgroundColor: colorHeader }}>
                <div className={styles.menuIcon} onClick={toggleMenu}>
                    ☰
                    {menuOpen && (
                        <div className={styles.dropdownMenu}>
                            <ul>
                                <li>
                                    <a onClick={() => handleMenuItemClick("geral")}>Geral</a>
                                </li>
                                <li>
                                    <a onClick={() => handleMenuItemClick("turismo")}>Turismo</a>
                                </li>
                                <li>
                                    <a onClick={() => handleMenuItemClick("historia")}>Historia e Patrimonio</a>
                                </li>
                                <li>
                                    <a onClick={() => handleMenuItemClick("cultura")}>Cultura</a>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
                <h1 className={styles.title} style={{ color: color }}>
                    {languageTitle}
                </h1>
                <div className={styles.languageButtons}>
                    <button onClick={() => handleLanguageChange("en")}>
                        <span className={styles.flagIcon}>EN</span>
                    </button>
                    <button onClick={() => handleLanguageChange("pt")}>
                        <span className={styles.flagIcon}>PT</span>
                    </button>
                    <button onClick={() => handleLanguageChange("es")}>
                        <span className={styles.flagIcon}>ES</span>
                    </button>
                    <button onClick={() => handleLanguageChange("fr")}>
                        <span className={styles.flagIcon}>FR</span>
                    </button>
                </div>
            </div>
            <div
                style={{
                    flex: "1",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#fff",
                    width: "100%",
                    height: "100%",
                    margin: "auto"
                }}
            >
                {!lastQuestionRef.current ? (
                    <div className={styles.chatWrapper}>
                        <div>
                            <div
                                style={{
                                    justifyContent: "end",
                                    paddingLeft: "10px",
                                    position: "relative",
                                    width: "100%"
                                }}
                            >
                                <div className={styles.avatarWelcome}>
                                    <video
                                        id="Welcomeavatar"
                                        src={newPauliteiro}
                                        controls={false}
                                        autoPlay={true}
                                        loop
                                        muted
                                        disablePictureInPicture
                                        controlsList="nodownload"
                                        className={styles.VideoAvatarWelcome}
                                    />
                                </div>
                                <div
                                    id="linha 365"
                                    className={styles.volumeIconWrapper}
                                    onClick={() => {
                                        setIsSoundOn(!isSoundOn);
                                    }}
                                >
                                    {isSoundOn ? (
                                        <BsVolumeUpFill style={{ color: "white" }} size={32} />
                                    ) : (
                                        <BsVolumeMuteFill style={{ color: "white" }} size={32} />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div
                            style={{
                                paddingTop: "50px",
                                paddingRight: "10px",
                                display: "flex",
                                justifyContent: "space-between",
                                flexDirection: "column"
                            }}
                        >
                            <div className={styles.boxSugestoes}>
                                <ExampleList
                                    language2={language}
                                    selectedMenuItem={selectedMenuItem}
                                    onExampleClicked={onExampleClicked}
                                    colorHeader={colorHeader}
                                    colorText={color}
                                />
                            </div>

                            <div>
                                <ClearChatButton
                                    language={language}
                                    className={styles.commandButtonDelete}
                                    onClick={clearChat}
                                    disabled={!lastQuestionRef.current || isLoading}
                                />
                                <QuestionInput
                                    clearOnSend
                                    placeholder={getPlaceholderText(language)}
                                    disabled={isLoading}
                                    onSend={question => makeApiRequest(question)}
                                    onListen={handleVoiceInput}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className={styles.chatWrapper}>
                            <div style={{ display: "flex" }}>
                                <div
                                    style={{
                                        // display: "flex",
                                        // flexDirection: "column",
                                        // gap: "10px",
                                        justifyContent: "end",
                                        paddingLeft: "10px",
                                        position: "relative",
                                        width: "100%"
                                    }}
                                >
                                    <div
                                        style={{
                                            marginBottom: "0",
                                            height: "calc(100vh - 60px)",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "end",
                                            alignItems: "center",
                                            overflow: "hidden"
                                        }}
                                        className={styles.avatar}
                                    >
                                        <video
                                            id="Video no chat"
                                            src={newPauliteiro}
                                            controls={false}
                                            autoPlay={true}
                                            loop
                                            width="100%"
                                            muted
                                            disablePictureInPicture
                                            controlsList="nodownload"
                                            className={styles.Avatarchat}
                                        />

                                        {isActive ? (
                                            <button className={styles.btnVoiceRedondo} style={{ position: "absolute" }}>
                                                <Record24Regular color="#1d9dff" primaryFill="rgb(29,157,255)" />
                                            </button>
                                        ) : (
                                            <button className={styles.btnVoiceRedondo} style={{ position: "absolute" }}>
                                                <Mic28Filled /> 
                                            </button>
                                        )}
                                    </div>
                                    <div
                                        id="linha 461"
                                        className={styles.volumeNotMobile}
                                        onClick={() => {
                                            setIsSoundOn(!isSoundOn);
                                            // isSoundOn ? setaudiostatus("pause") : setaudiostatus("resume");
                                        }}
                                    >
                                        {isSoundOn ? (
                                            <BsVolumeUpFill style={{ color: "white" }} size={32} />
                                        ) : (
                                            <BsVolumeMuteFill style={{ color: "white" }} size={32} />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div
                                //className={styles.formContent}
                                id="questionchat"
                                style={{
                                    paddingTop: "20px",
                                    paddingLeft: "10px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    flexDirection: "column"
                                }}
                                className={styles.questionchat}
                            >
                                {/*/here*/}
                                <div className={styles.boxAnswer} style={{ maxHeight: "100vh", paddingTop: "25px", overflowY: "scroll", paddingRight: "10px" }}>
                                    {answers.map((answer, index) => (
                                        <div key={index}>
                                            <UserChatMessage message={answer[0]} />
                                            <div className={styles.chatMessageGpt} ref={chatMessageStreamEnd}>
                                                <Answer
                                                    key={index}
                                                    answer={answer[1]}
                                                    isSelected={selectedAnswer === index && activeAnalysisPanelTab !== undefined}
                                                    onCitationClicked={c => onShowCitation(c, index)}
                                                    isStreaming={false}
                                                    onThoughtProcessClicked={() => onToggleTab(AnalysisPanelTabs.ThoughtProcessTab, index)}
                                                    onSupportingContentClicked={() => onToggleTab(AnalysisPanelTabs.SupportingContentTab, index)}
                                                    onFollowupQuestionClicked={q => makeApiRequest(q)}
                                                    showFollowupQuestions={useSuggestFollowupQuestions && answers.length - 1 === index}
                                                    playsound={isSoundOn}
                                                    language={language}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <>
                                            <UserChatMessage message={lastQuestionRef.current} />
                                            <div className={styles.chatMessageGptMinWidth}>
                                                <AnswerLoading />
                                            </div>
                                        </>
                                    )}
                                    {error ? (
                                        <>
                                            <UserChatMessage message={lastQuestionRef.current} />
                                            <div className={styles.chatMessageGptMinWidth}>
                                                <AnswerError error={error.toString()} onRetry={() => makeApiRequest(lastQuestionRef.current)} />
                                            </div>
                                        </>
                                    ) : null}

                                    <div />
                                </div>

                                <div
                                    style={{
                                        position: "sticky",
                                        bottom: 0,
                                        /*paddingTop: '15px',*/
                                        background: "white"
                                    }}
                                    className={styles.wrapInputs}
                                >
                                    <ClearChatButton
                                        language={language}
                                        className={styles.commandButtonDelete}
                                        onClick={clearChat}
                                        disabled={!lastQuestionRef.current || isLoading}
                                    />

                                    <QuestionInput
                                        clearOnSend
                                        placeholder={getPlaceholderText(language)}
                                        disabled={isLoading}
                                        onSend={question => makeApiRequest(question)}
                                        onListen={handleVoiceInput}
                                        // isActive={isActive}
                                    />

                                    {/* <div className={styles.volumeAvatar}>
                                        <div
                                            id="linha 552"
                                            className={styles.volumeMobile}
                                            onClick={() => {
                                                setIsSoundOn(!isSoundOn);
                                                // isSoundOn ? setaudiostatus("pause") : setaudiostatus("resume");
                                            }}
                                        >
                                            {isSoundOn ? (
                                                <BsVolumeUpFill style={{ color: "white" }} size={32} />
                                            ) : (
                                                <BsVolumeMuteFill style={{ color: "white" }} size={32} />
                                            )}
                                        </div>
                                    </div> */}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* {answers.length > 0 && activeAnalysisPanelTab && (
                <div className={styles.AnalisesPanel}>
                    <AnalysisPanel
                        className={styles.chatAnalysisPanel}
                        activeCitation={activeCitation}
                        onActiveTabChanged={x => onToggleTab(x, selectedAnswer)}
                        citationHeight="810px"
                        answer={answers[selectedAnswer][1]}
                        activeTab={activeAnalysisPanelTab}
                        // setActiveAnalysisPanelTab={closeAnalysisPanel}
                    />
                </div>
            )} */}
        </div>
    );
};

export default Chat;
