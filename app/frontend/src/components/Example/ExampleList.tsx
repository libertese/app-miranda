import { useState } from "react";
import { Example } from "./Example";

import styles from "./Example.module.css";

const EXAMPLES: { [key: string]: string[] } = {
    en: [
        "Tell me what you know about the Pauliteiros Dance",
        "What is the origin of the Pauliteiros Dance?",
        "What is the Lhaço?",
        "Tell me what you know about Miranda do Douro",
        "What are the main Pauliteiros groups of Miranda?"
    ],
    pt: [
        "Diz-me o que sabes sobre a Dança dos Pauliteiros",
        "Qual a origem da Dança dos Pauliteiros?",
        "O que é o Lhaço?",
        "Diz-me o que sabes sobre Miranda do Douro",
        "Quais são os principais grupos de Pauliteiros de Miranda?"
    ],
    es: [
        "Dime lo que sabes sobre la Danza de los Pauliteiros",
        "¿Cuál es el origen de la Danza de los Pauliteiros?",
        "¿Qué es el Lhaço?",
        "Dime lo que sabes sobre Miranda do Douro",
        "¿Cuáles son los principales grupos de Pauliteiros de Miranda?"
    ],
    pt_pt: [
        "Diz-me o que sabes sobre a Dança dos Pauliteiros",
        "Qual é a origem da Dança dos Pauliteiros?",
        "O que é o Lhaço?",
        "Diz-me o que sabes sobre Miranda do Douro",
        "Quais são os principais grupos de Pauliteiros de Miranda?"
    ]
};

const EXAMPLES_RESTURANTES: { [key: string]: string[] } = {
    en: [
        "RESTAURANTES___Tell me what you know about the Pauliteiros Dance",
        "RESTAURANTES___What is the origin of the Pauliteiros Dance?",
        "RESTAURANTES___What is the Lhaço?",
        "RESTAURANTES___Tell me what you know about Miranda do Douro",
        "RESTAURANTES___What are the main Pauliteiros groups of Miranda?"
    ],
    pt: [
        "RESTAURANTES___Diz-me o que sabes sobre a Dança dos Pauliteiros",
        "RESTAURANTES___Qual a origem da Dança dos Pauliteiros?",
        "RESTAURANTES___O que é o Lhaço?",
        "RESTAURANTES___Diz-me o que sabes sobre Miranda do Douro",
        "RESTAURANTES___Quais são os principais grupos de Pauliteiros de Miranda?"
    ],
    es: [
        "RESTAURANTES___Dime lo que sabes sobre la Danza de los Pauliteiros",
        "RESTAURANTES___¿Cuál es el origen de la Danza de los Pauliteiros?",
        "RESTAURANTES___¿Qué es el Lhaço?",
        "RESTAURANTES___Dime lo que sabes sobre Miranda do Douro",
        "RESTAURANTES___¿Cuáles son los principales grupos de Pauliteiros de Miranda?"
    ],
    pt_pt: [
        "RESTAURANTES___Diz-me o que sabes sobre a Dança dos Pauliteiros",
        "RESTAURANTES___Qual é a origem da Dança dos Pauliteiros?",
        "RESTAURANTES___O que é o Lhaço?",
        "RESTAURANTES___Diz-me o que sabes sobre Miranda do Douro",
        "RESTAURANTES___Quais são os principais grupos de Pauliteiros de Miranda?"
    ]
};

const EXAMPLES_TURISMO: { [key: string]: string[] } = {
    en: [
        "TURISMO___Tell me what you know about the Pauliteiros Dance",
        "TURISMO___What is the origin of the Pauliteiros Dance?",
        "TURISMO___What is the Lhaço?",
        "TURISMO___Tell me what you know about Miranda do Douro",
        "TURISMO___What are the main Pauliteiros groups of Miranda?"
    ],
    pt: [
        "TURISMO___Diz-me o que sabes sobre a Dança dos Pauliteiros",
        "TURISMO___Qual a origem da Dança dos Pauliteiros?",
        "TURISMO___O que é o Lhaço?",
        "TURISMO___Diz-me o que sabes sobre Miranda do Douro",
        "TURISMO___Quais são os principais grupos de Pauliteiros de Miranda?"
    ],
    es: [
        "TURISMO___Dime lo que sabes sobre la Danza de los Pauliteiros",
        "TURISMO___¿Cuál es el origen de la Danza de los Pauliteiros?",
        "TURISMO___¿Qué es el Lhaço?",
        "TURISMO___Dime lo que sabes sobre Miranda do Douro",
        "TURISMO___¿Cuáles son los principales grupos de Pauliteiros de Miranda?"
    ],
    pt_pt: [
        "TURISMO___Diz-me o que sabes sobre a Dança dos Pauliteiros",
        "TURISMO___Qual é a origem da Dança dos Pauliteiros?",
        "TURISMO___O que é o Lhaço?",
        "TURISMO___Diz-me o que sabes sobre Miranda do Douro",
        "TURISMO___Quais são os principais grupos de Pauliteiros de Miranda?"
    ]
};

interface Props {
    onExampleClicked: (lang: string) => void;
    language2: string;
    selectedMenuItem?: string;
    colorText?: string;
    colorHeader?: string;
    useGPT4V?: boolean;
}

export const ExampleList: React.FC<Props> = ({ onExampleClicked, language2, selectedMenuItem, colorText, colorHeader, useGPT4V }) => {
    var examples;
    // Função para traduzir o texto com base na linguagem selecionada
    switch (selectedMenuItem) {
        case "restaurante":
            examples = EXAMPLES_RESTURANTES[language2];
            console.log("restaurantes" + examples);
            break;
        case "turismo":
            examples = EXAMPLES_TURISMO[language2];
            break;
        default:
            examples = EXAMPLES[language2];
            break;
    }

    // Função para traduzir o texto com base na linguagem selecionada
    const translateText = (text: string) => {
        switch (language2) {
            case "pt":
                return "Sugestões de perguntas:";
            case "es":
                return "Sugerencias de preguntas:";
            case "pt_pt":
                return "Sugestões de perguntas:";
            // Adicione mais casos conforme necessário para outras linguagens
            default:
                return "Suggestions for questions:";
        }
    };

    return (
        <div>
            {/* Main Content */}
            <p className={styles.suggestionsTitle} style={{ color: colorText }}>
                {translateText("Sugestões de perguntas:")}
            </p>
            <ul className={styles.examplesNavList}>
                {examples.map((question, i) => (
                    <li className={styles.eacheli} style={{ color: colorText, borderColor: colorText }}>
                        <Example text={question} value={question} onClick={onExampleClicked} colorHeader={colorHeader} colorText={colorText} />
                    </li>
                ))}
            </ul>
        </div>
    );
};
