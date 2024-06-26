import { Delete24Regular } from "@fluentui/react-icons";
import { Button } from "@fluentui/react-components";

import styles from "./ClearChatButton.module.css";

interface Props {
    className?: string;
    onClick: () => void;
    disabled?: boolean;
    language?: string;
}

const getButtonText = (language?: string): string => {
    switch (language) {
        case "es":
            return "Limpiar chat";
        case "fr":
            return "Effacer la discussion";
        case "de":
            return "Chat löschen";
        case "pt":
            return "Limpar chat";
        case "en":
            return "Clear chat";
        default:
            return "";
    }
};

export const ClearChatButton = ({ className, disabled, onClick, language }: Props) => {
    return (
        <div className={`${styles.container} ${className ?? ""}`}>
            <Button icon={<Delete24Regular />} disabled={disabled} onClick={onClick}>
                {getButtonText(language)}
            </Button>
        </div>
    );
};
