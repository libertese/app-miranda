import { useMemo, useEffect, useState } from "react";
import { Stack, IconButton } from "@fluentui/react";
import DOMPurify from "dompurify";

import styles from "./Answer.module.css";

import { AnswerFeedbackRequest, ChatAppResponse, getCitationFilePath, feedbackApi } from "../../api";

import { parseAnswerToHtml } from "./AnswerParser";
import { AnswerIcon } from "./AnswerIcon";
import mirandaLogo from "../../assets/miranda.png";
import { ThumbLike24Regular, ThumbDislike24Regular } from "@fluentui/react-icons";
import { TextAnalyticsClient, AzureKeyCredential } from "@azure/ai-text-analytics";
import { usecontrolaudio } from "../../hooks/usecontrolaudio";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

interface Props {
    key?: number;
    answer: ChatAppResponse;
    isSelected?: boolean;
    isStreaming: boolean;
    onCitationClicked: (filePath: string) => void;
    onThoughtProcessClicked?: () => void;
    onSupportingContentClicked?: () => void;
    onFollowupQuestionClicked?: (question: string) => void;
    showFollowupQuestions?: boolean;
    playsound: boolean;
    language?: string;
}
export const Answer = ({
    key,
    answer,
    isSelected,
    isStreaming,
    onCitationClicked,
    onThoughtProcessClicked,
    onSupportingContentClicked,
    onFollowupQuestionClicked,
    showFollowupQuestions,
    playsound,
    language
}: Props) => {
    const followupQuestions = answer.choices[0].context.followup_questions;
    const messageContent = answer.choices[0].message.content;
    const parsedAnswer = useMemo(() => parseAnswerToHtml(messageContent, isStreaming, onCitationClicked), [answer]);
    const { audiostatus, setaudiostatus } = usecontrolaudio();
    const sanitizedAnswerHtml = DOMPurify.sanitize(parsedAnswer.answerHtml);

    const handleVoiceOutput = async (resposta: any, playsound: boolean) => {
        const player = new sdk.SpeakerAudioDestination();
        if (playsound) {
            const speechConfig = sdk.SpeechConfig.fromSubscription("54f08182a9654cca8e01cf697e38b004", "westeurope");
            var VoiceName = "";
            switch (language) {
                case "pt":
                    VoiceName = "pt-PT-DuarteNeural";
                    break;
                case "fr":
                    VoiceName = "fr-FR-HenriNeural";
                    break;
                case "en":
                    VoiceName = "en-US-GuyNeural";
                    break;
                case "es":
                    VoiceName = "es-ES-AlvaroNeural";
                    break;
                case "de":
                    VoiceName = "de-DE-StefanNeural";
                    break;
                case "it":
                    VoiceName = "it-IT-CosimoNeural";
                    break;
                case "ja":
                    VoiceName = "ja-JP-KeitaNeural";
                    break;
                case "ru":
                    VoiceName = "ru-RU-PavelNeural";
                    break;
                case "ar":
                    VoiceName = "ar-SA-NaayfNeural";
                    break;
                case "zh":
                    VoiceName = "zh-CN-KangkangNeural";
                    break;
                default:
                    console.log("Unsupported language.1111");
                    return;
            }

            speechConfig.speechSynthesisLanguage = language;
            speechConfig.speechSynthesisVoiceName = VoiceName;
            const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput(); // Use default speaker output for audio
            const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
            const player = new sdk.SpeakerAudioDestination();

            const audioConfigplayer = sdk.AudioConfig.fromSpeakerOutput(player);
            //const syn = new sdk.SpeechSynthesizer(speechConfig, audioConfig)
            const textToSpeak = resposta.replace("<a></a>", ""); // Replace with your desired text
            synthesizer.speakTextAsync(
                textToSpeak,
                function (result) {
                    sdk.ResultReason.SynthesizingAudio;
                    if (audiostatus == "pause") player.pause();

                    synthesizer.close();

                    player.onAudioEnd = function () {
                        console.log("speakTextAsync finished");
                    };
                },
                function (err) {
                    console.trace("err - " + err);
                    synthesizer.close();
                }
            );
        } else {
            console.log("sound off");
        }
        player.close();
    };

    useEffect(() => {
        handleVoiceOutput(sanitizedAnswerHtml.replace("<a></a>", ""), playsound);
        setaudiostatus("initial");
    }, [answer]);

    const [positiveFeedback, setPositiveFeedback] = useState<boolean>(false);
    const [negativeFeedback, setNegativeFeedback] = useState<boolean>(false);
    const sendPositiveFeedback = async (event: React.MouseEvent<HTMLDivElement, MouseEvent>, _feedbackId: string) => {
        if (positiveFeedback == true) setPositiveFeedback(false);
        else {
            setPositiveFeedback(true);
            setNegativeFeedback(false);
        }

        try {
            const request: AnswerFeedbackRequest = {
                feedbackId: String(answer),
                feedback: true
            };
            const result = await feedbackApi(request);
        } catch (e) {
            console.log("Entrou no cast ", e);
        }
    };

    const sendNegativeFeedback = async (event: React.MouseEvent<HTMLDivElement, MouseEvent>, _feedbackId: string) => {
        if (negativeFeedback == true) setNegativeFeedback(false);
        else {
            setNegativeFeedback(true);
            setPositiveFeedback(false);
        }
        try {
            const request: AnswerFeedbackRequest = {
                feedbackId: String(answer),
                feedback: false
            };
            const result = await feedbackApi(request);
        } catch (e) {
            console.log("Entrou no cast ", e);
        }
    };

    return (
        <Stack className={`${styles.answerContainer} ${isSelected && styles.selected}`} verticalAlign="space-between">
            <div className={styles.answerHeader}>
                <Stack.Item>
                    <Stack horizontal horizontalAlign="space-between">
                        <img src={mirandaLogo} alt="Miranda do Douro Logo" aria-label="Miranda do Douro Logo" width="28" height="28"></img>
                        <div></div>
                        <div className={styles.buttonsAnswerFeedback}>
                            <div className={styles.buttonLike} onClick={event => sendPositiveFeedback(event, answer.choices[0].message.content)}>
                                <ThumbLike24Regular primaryFill="rgb(50, 205, 50)" className={`${styles.likeCliked} ${styles.like}`}></ThumbLike24Regular>
                            </div>
                            <div className={styles.buttonDislike} onClick={event => sendNegativeFeedback(event, answer.choices[0].message.content)}>
                                <ThumbDislike24Regular
                                    primaryFill="rgb(255, 0, 0)"
                                    className={`${styles.dislikeCliked} ${styles.dislike}`}
                                ></ThumbDislike24Regular>
                            </div>
                        </div>
                    </Stack>
                </Stack.Item>
            </div>
            <Stack.Item grow>
                <div className={styles.answerText} dangerouslySetInnerHTML={{ __html: sanitizedAnswerHtml.replace('"', "").replace('"', "") }}></div>
            </Stack.Item>
            {!!followupQuestions?.length && showFollowupQuestions && onFollowupQuestionClicked && (
                <Stack.Item>
                    <Stack horizontal wrap className={`${!!parsedAnswer.citations.length ? styles.followupQuestionsList : ""}`} tokens={{ childrenGap: 6 }}>
                        <span className={styles.followupQuestionLearnMore}>Follow-up questions:</span>
                        {followupQuestions.map((x, i) => {
                            return (
                                <a key={i} className={styles.followupQuestion} title={x} onClick={() => onFollowupQuestionClicked(x)}>
                                    {`${x}`}
                                </a>
                            );
                        })}
                    </Stack>
                </Stack.Item>
            )}
        </Stack>
    );
};
