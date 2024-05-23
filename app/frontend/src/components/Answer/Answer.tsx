import { useMemo, useEffect, useState } from "react";
import { Stack, IconButton } from "@fluentui/react";
import DOMPurify from "dompurify";

import styles from "./Answer.module.css";

import { ChatAppResponse, getCitationFilePath } from "../../api";
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
        const pause = () => {
            player.close();
        };

        const resume = () => {
            player.resume();
        };

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
                    VoiceName = "es-ES-PabloNeural";
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
            const textToSpeak = resposta; // Replace with your desired text
            synthesizer.speakTextAsync(
                textToSpeak.choices[0].message.content,
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
        handleVoiceOutput(answer, playsound);
        setaudiostatus("initial");
    }, [answer]);

    return (
        // <Stack className={`${styles.answerContainer} ${isSelected && styles.selected}`} verticalAlign="space-between">
        //     <Stack.Item>
        //         <Stack horizontal horizontalAlign="space-between">
        //             <img src={mirandaLogo} alt="Miranda do Douro Logo" aria-label="Miranda do Douro Logo" width="28" height="28"></img>
        //         </Stack>
        //     </Stack.Item>

        //     <Stack.Item grow>
        //         <div className={styles.answerText} dangerouslySetInnerHTML={{ __html: sanitizedAnswerHtml }}></div>
        //     </Stack.Item>

        //     {!!parsedAnswer.citations.length && (
        //         <Stack.Item>
        //             <Stack horizontal wrap tokens={{ childrenGap: 5 }}>
        //                 <span className={styles.citationLearnMore}>Citations:</span>
        //                 {parsedAnswer.citations.map((x, i) => {
        //                     const path = getCitationFilePath(x);
        //                     return (
        //                         <a key={i} className={styles.citation} title={x} onClick={() => onCitationClicked(path)}>
        //                             {`${++i}. ${x}`}
        //                         </a>
        //                     );
        //                 })}
        //             </Stack>
        //         </Stack.Item>
        //     )}

        //     {!!followupQuestions?.length && showFollowupQuestions && onFollowupQuestionClicked && (
        //         <Stack.Item>
        //             <Stack horizontal wrap className={`${!!parsedAnswer.citations.length ? styles.followupQuestionsList : ""}`} tokens={{ childrenGap: 6 }}>
        //                 <span className={styles.followupQuestionLearnMore}>Follow-up questions:</span>
        //                 {followupQuestions.map((x, i) => {
        //                     return (
        //                         <a key={i} className={styles.followupQuestion} title={x} onClick={() => onFollowupQuestionClicked(x)}>
        //                             {`${x}`}
        //                         </a>
        //                     );
        //                 })}
        //             </Stack>
        //         </Stack.Item>
        //     )}
        // </Stack>
        <Stack className={`${styles.answerContainer} ${isSelected && styles.selected}`} verticalAlign="space-between">
            <div className={styles.answerHeader}>
                <Stack.Item>
                    <Stack horizontal horizontalAlign="space-between">
                        <img src={mirandaLogo} alt="Miranda do Douro Logo" aria-label="Miranda do Douro Logo" width="28" height="28"></img>
                        <div></div>
                    </Stack>
                </Stack.Item>
                {/* <div className={styles.buttonsAnswerFeedback}>
                    <div className={styles.buttonLike}>
                        <ThumbLike24Regular primaryFill="rgb(50, 205, 50)" className={`${styles.likeCliked} ${styles.like}`}></ThumbLike24Regular>
                    </div>
                    <div className={styles.buttonDislike}>
                        <ThumbDislike24Regular primaryFill="rgb(255, 0, 0)" className={`${styles.dislikeCliked} ${styles.dislike}`}></ThumbDislike24Regular>
                    </div>
                </div> */}
                {/* <div className={styles.buttonsAnswerFeedback}>
                    <div className={styles.buttonLike} onClick={event => sendPositiveFeedback(event, answer.questionid)}>
                        <ThumbLike24Regular
                            primaryFill="rgb(50, 205, 50)"
                            className={`${positiveFeedback ? styles.likeCliked : ""} ${styles.like}`}
                        ></ThumbLike24Regular>
                    </div>
                    <div className={styles.buttonDislike} onClick={event => sendNegativeFeedback(event, answer.questionid)}>
                        <ThumbDislike24Regular
                            primaryFill="rgb(255, 0, 0)"
                            className={`${negativeFeedback ? styles.dislikeCliked : ""} ${styles.dislike}`}
                        ></ThumbDislike24Regular>
                    </div>
                </div> */}
            </div>
            <Stack.Item grow>
                <div className={styles.answerText} dangerouslySetInnerHTML={{ __html: sanitizedAnswerHtml.replace('"', "").replace('"', "") }}></div>
            </Stack.Item>
            {!!parsedAnswer.citations.length && (
                <Stack.Item>
                    <Stack horizontal wrap tokens={{ childrenGap: 5 }}>
                        <span className={styles.citationLearnMore}>Citações:</span>
                        {parsedAnswer.citations.map((x, i) => {
                            const path = getCitationFilePath(x);
                            return (
                                <a
                                    key={i}
                                    className={styles.citation}
                                    title={` ${x.replace(/[-\d+]|_[pP]ag|\.[pP][dD][fF]/g, "").replace(/_/g, " ")}`}
                                    onClick={() => onCitationClicked(path)}
                                >
                                    {`${++i}. ${x.replace(/[-\d+]|_[pP]ag|\.[pP][dD][fF]/g, "").replace(/_/g, " ")}`}
                                </a>
                            );
                        })}
                    </Stack>
                </Stack.Item>
            )}
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
