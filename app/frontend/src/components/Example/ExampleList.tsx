import { useState } from "react";
import { Example } from "./Example";

import styles from "./Example.module.css";
const EXAMPLES: { [key: string]: string[] } = {
    en: [
        "What are the parishes of Miranda do Douro?",
        "What are the main monuments of Miranda do Douro?",
        "Tell me about the Pauliteiros of Miranda do Douro",
        "Tell me what you know about Miranda do Douro"
    ],
    pt: [
        "Quais as freguesias de Miranda do Douro?",
        "Quais os principais monumentos de Miranda do Douro?",
        "Fala-me sobre os pauliteiros de Miranda do Douro",
        "Diz-me o que sabes sobre Miranda do Douro"
    ],
    es: [
        "¿Cuales son los ayuntamientos de Miranda do Douro?",
        "¿Cuáles son los principales monumentos de Miranda do Douro?",
        "Háblame sobre los pauliteiros de Miranda do Douro",
        "Dime lo que sabes sobre Miranda do Douro"
    ],
    pt_pt: [
        "Quais as freguesias de Miranda do Douro?",
        "Quais os principais monumentos de Miranda do Douro?",
        "Fala-me sobre os pauliteiros de Miranda do Douro",
        "Diz-me o que sabes sobre Miranda do Douro"
    ],
    fr: [
        "Quelles sont les paroisses de Miranda do Douro?",
        "Quels sont les principaux monuments de Miranda do Douro?",
        "Parlez-moi des pauliteiros de Miranda do Douro",
        "Dites-moi ce que vous savez de Miranda do Douro"
    ]
};

const EXAMPLES_RESTURANTES: { [key: string]: string[] } = {
    en: [
        "What are the parishes of Miranda do Douro?",
        "What are the main monuments of Miranda do Douro?",
        "Tell me about the Pauliteiros of Miranda do Douro",
        "Tell me what you know about Miranda do Douro"
    ],
    pt: [
        "Quais as freguesias de Miranda do Douro?",
        "Quais os principais monumentos de Miranda do Douro?",
        "Fala-me sobre os pauliteiros de Miranda do Douro",
        "Diz-me o que sabes sobre Miranda do Douro"
    ],
    es: [
        "¿Cuales son los ayuntamientos de Miranda do Douro?",
        "¿Cuáles son los principales monumentos de Miranda do Douro?",
        "Háblame sobre los pauliteiros de Miranda do Douro",
        "Dime lo que sabes sobre Miranda do Douro"
    ],
    pt_pt: [
        "Quais as freguesias de Miranda do Douro?",
        "Quais os principais monumentos de Miranda do Douro?",
        "Fala-me sobre os pauliteiros de Miranda do Douro",
        "Diz-me o que sabes sobre Miranda do Douro"
    ],
    fr: [
        "Quelles sont les paroisses de Miranda do Douro?",
        "Quels sont les principaux monuments de Miranda do Douro?",
        "Parlez-moi des pauliteiros de Miranda do Douro",
        "Dites-moi ce que vous savez de Miranda do Douro"
    ]
};

const EXAMPLES_TURISMO: { [key: string]: string[] } = {
    en: [
        "Tell me about the gastronomy of Miranda do Douro",
        "Describe the Castle of Miranda do Douro",
        "Tell me about the Cathedral of Miranda do Douro",
        "What are the typical handicrafts of Miranda do Douro?"
    ],
    pt: [
        "Fala-me sobre a gastronomia de Miranda do Douro",
        "Descreve o Castelo de Miranda do Douro",
        "Fala sobre a Sé Catedral de Miranda do Douro",
        "Qual o artesanato típico de Miranda do Douro"
    ],
    es: [
        "Háblame sobre la gastronomía de Miranda do Douro",
        "Describe el Castillo de Miranda do Douro",
        "Háblame sobre la Catedral de Miranda do Douro",
        "Háblame de la artesanía típica de Miranda do Douro?"
    ],
    pt_pt: [
        "Fala-me sobre a gastronomia de Miranda do Douro",
        "Descreve o Castelo de Miranda do Douro",
        "Fala sobre a Sé Catedral de Miranda do Douro",
        "Qual o artesanato típico de Miranda do Douro"
    ],
    fr: [
        "Parle-moi de la gastronomie de Miranda do Douro",
        "Décris le Château de Miranda do Douro",
        "Parle-moi de la Cathédrale de Miranda do Douro",
        "Quel est l'artisanat typique de Miranda do Douro?"
    ]
};

const EXAMPLES_HISTORIA: { [key: string]: string[] } = {
    en: [
        "Talk about the history of Miranda do Douro",
        "Describe the native breeds of Miranda do Douro",
        "What are the Sanctuaries of Miranda do Douro?",
        "What services are provided by the Municipal Archive?"
    ],
    pt: [
        "Fala sobre a história de Miranda do Douro",
        "Descreve as raças autóctones de Miranda do Douro",
        "Quais os Santuários de Miranda do Douro?",
        "Quais os serviços prestados pelo arquivo Municipal?"
    ],
    es: [
        "Háblame sobre la historia de Miranda do Douro",
        "Describe las razas autóctonas de Miranda do Douro",
        "¿Cuáles son los Santuarios de Miranda do Douro?",
        "¿Qué servicios presta el archivo Municipal?"
    ],
    pt_pt: [
        "Fala sobre a história de Miranda do Douro",
        "Descreve as raças autóctones de Miranda do Douro",
        "Quais os Santuários de Miranda do Douro?",
        "Quais os serviços prestados pelo arquivo Municipal?"
    ],
    fr: [
        "Parle de l'histoire de Miranda do Douro",
        "Décris les races autochtones de Miranda do Douro",
        "Quels sont les Sanctuaires de Miranda do Douro?",
        "Quels services sont fournis par les Archives Municipales?"
    ]
};

const EXAMPLES_CULTURA: { [key: string]: string[] } = {
    en: ["Tell me about the Mirandese language", "Describe the dance of the Pauliteiros", "What is the origin of the Pauliteiros", "What is a lhaço?"],
    pt: ["Fala-me sobre a língua mirandesa", "Descreve a dança dos pauliteiros", "Qual a origem dos pauliteiros", "O que é um lhaço?"],
    es: ["Háblame sobre el idioma mirandés", "Describe la danza de los Pauliteiros", "¿Cuál es el origen de los Pauliteiros?", "¿Qué es un lhaço?"],
    pt_pt: ["Fala-me sobre a língua mirandesa", "Descreve a dança dos pauliteiros", "Qual a origem dos pauliteiros", "O que é um lhaço?"],
    fr: ["Parle-moi de la langue mirandaise", "Décris la danse des Pauliteiros", "Quelle est l'origine des Pauliteiros?", "Qu'est-ce qu'un lhaço?"]
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
        case "geral":
            examples = EXAMPLES_RESTURANTES[language2];
            break;
        case "turismo":
            examples = EXAMPLES_TURISMO[language2];
            break;
        case "historia":
            examples = EXAMPLES_HISTORIA[language2];
            break;
        case "cultura":
            examples = EXAMPLES_CULTURA[language2];
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
            case "fr":
                return "Suggestions de questions:";
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
