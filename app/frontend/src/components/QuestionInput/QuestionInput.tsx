import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { Stack, TextField } from "@fluentui/react";
import { Button, Tooltip, Field, Textarea } from "@fluentui/react-components";
import { Send28Filled, Mic32Regular, MicOff32Regular } from "@fluentui/react-icons"; // Importe os ícones do FluentUI
import { isLoggedIn, requireLogin } from "../../authConfig";

import styles from "./QuestionInput.module.css";

interface Props {
    onSend: (question: string) => void;
    disabled: boolean;
    initQuestion?: string;
    placeholder?: string;
    clearOnSend?: boolean;
}

export const QuestionInput = ({ onSend, disabled, placeholder, clearOnSend, initQuestion }: Props) => {
    const [question, setQuestion] = useState<string>("");
    const [speechRecognitionActive, setSpeechRecognitionActive] = useState<boolean>(false); // Novo estado para controlar a ativação do reconhecimento de voz
    const [speechRecognitionText, setSpeechRecognitionText] = useState<string>(""); // Novo estado para armazenar o texto reconhecido pelo microfone

    useEffect(() => {
        initQuestion && setQuestion(initQuestion);
    }, [initQuestion]);

    const sendQuestion = () => {
        if (disabled || !question.trim()) {
            return;
        }

        onSend(question);

        if (clearOnSend) {
            setQuestion("");
        }
    };

    const onEnterPress = (ev: React.KeyboardEvent<Element>) => {
        if (ev.key === "Enter" && !ev.shiftKey) {
            ev.preventDefault();
            sendQuestion();
        }
    };

    const onQuestionChange = (_ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        if (!newValue) {
            setQuestion("");
        } else if (newValue.length <= 1000) {
            setQuestion(newValue);
        }
    };

    const { instance } = useMsal();
    const disableRequiredAccessControl = requireLogin && !isLoggedIn(instance);
    const sendQuestionDisabled = disabled || !question.trim() || requireLogin;

    if (disableRequiredAccessControl) {
        placeholder = "Please login to continue...";
    }

    // Função para iniciar o reconhecimento de voz
    // const startSpeechRecognition = () => {
    //     // const recognition = new window.webkitSpeechRecognition(); // Crie uma nova instância de reconhecimento de fala
    //     recognition.lang = "en-US"; // Defina o idioma para inglês americano, ajuste conforme necessário

    //     recognition.onstart = () => {
    //         setSpeechRecognitionActive(true); // Atualize o estado para indicar que o reconhecimento de voz está ativo
    //     };

    //     // recognition.onresult = (event: SpeechRecognitionEvent) => {
    //     //     const transcript = event.results[0][0].transcript;
    //     //     setSpeechRecognitionText(transcript); // Atualize o estado com o texto reconhecido pelo microfone
    //     // };

    //     recognition.onend = () => {
    //         setSpeechRecognitionActive(false); // Atualize o estado para indicar que o reconhecimento de voz foi encerrado
    //     };

    //     recognition.start(); // Inicie o reconhecimento de voz
    // };

    // Função para parar o reconhecimento de voz
    // const stopSpeechRecognition = () => {
    //     window.webkitSpeechRecognition.stop(); // Pare o reconhecimento de voz
    // };

    return (
        <Stack horizontal className={styles.questionInputContainer}>
            <TextField
                className={styles.questionInputTextArea}
                disabled={disableRequiredAccessControl}
                placeholder={placeholder}
                multiline
                resizable={false}
                borderless
                value={question}
                onChange={onQuestionChange}
                onKeyDown={onEnterPress}
            />
            <div className={styles.questionInputButtonsContainer}>
                <Button size="large" icon={<Send28Filled primaryFill="rgba(115, 118, 225, 1)" />} disabled={sendQuestionDisabled} onClick={sendQuestion} />
            </div>
        </Stack>
    );
};
