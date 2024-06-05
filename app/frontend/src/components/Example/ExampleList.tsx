import { useState } from "react";
import { Example } from "./Example";

import styles from "./Example.module.css";
const EXAMPLES: { [key: string]: string[] } = {
    en: [
        "What function of the Miranda do Douro city council do you consider most important for the quality of life of citizens?",
        "Do you think promoting tourism can bring significant benefits to the local economy of Miranda do Douro? Why?",
        "How do you see the importance of environmental preservation policies implemented by the city council?",
        "What kind of cultural or social events would you like to see promoted by the Miranda do Douro city council?",
        "What are the main Pauliteiros groups of Miranda?"
    ],
    pt: [
        "Qual a função da prefeitura de Miranda do Douro que você considera mais importante para a qualidade de vida dos cidadãos?",
        "Você acha que a promoção do turismo pode trazer benefícios significativos para a economia local de Miranda do Douro? Por quê?",
        "Como você vê a importância das políticas de preservação ambiental implementadas pela prefeitura?",
        "Que tipo de eventos culturais ou sociais você gostaria de ver promovidos pela prefeitura de Miranda do Douro?",
        "Quais são os principais grupos de Pauliteiros de Miranda?"
    ],
    es: [
        "¿Qué función del ayuntamiento de Miranda do Douro consideras más importante para la calidad de vida de los ciudadanos?",
        "¿Crees que la promoción del turismo puede traer beneficios significativos para la economía local de Miranda do Douro? ¿Por qué?",
        "¿Cómo ves la importancia de las políticas de preservación ambiental implementadas por el ayuntamiento?",
        "¿Qué tipo de eventos culturales o sociales te gustaría ver promovidos por el ayuntamiento de Miranda do Douro?",
        "¿Cuáles son los principales grupos de Pauliteiros de Miranda?"
    ],
    pt_pt: [
        "Qual a função da câmara municipal de Miranda do Douro que consideras mais importante para a qualidade de vida dos cidadãos?",
        "Achas que a promoção do turismo pode trazer benefícios significativos para a economia local de Miranda do Douro? Porquê?",
        "Como vês a importância das políticas de preservação ambiental implementadas pela câmara municipal?",
        "Que tipo de eventos culturais ou sociais gostarias de ver promovidos pela câmara municipal de Miranda do Douro?",
        "Quais são os principais grupos de Pauliteiros de Miranda?"
    ]
};

const EXAMPLES_RESTURANTES: { [key: string]: string[] } = {
    en: [
        "Which typical dish from Miranda do Douro would you like to try first and why?",
        "Are you interested in learning to cook any of the mentioned dishes? If so, which one?",
        "What do you think of culinary traditions that use local products, such as chestnut soup?",
        "What is your opinion on the historical and cultural influence on the cuisine of Miranda do Douro, like in the case of alheiras?"
    ],
    pt: [
        "Qual prato típico de Miranda do Douro você gostaria de experimentar primeiro e por quê?",
        "Você tem algum interesse em aprender a cozinhar algum dos pratos mencionados? Se sim, qual?",
        "O que você acha das tradições culinárias que utilizam produtos locais, como a sopa de castanha?",
        "Qual a sua opinião sobre a influência histórica e cultural na gastronomia de Miranda do Douro, como no caso das alheiras?"
    ],
    es: [
        "¿Qué plato típico de Miranda do Douro te gustaría probar primero y por qué?",
        "¿Tienes interés en aprender a cocinar alguno de los platos mencionados? Si es así, ¿cuál?",
        "¿Qué opinas de las tradiciones culinarias que utilizan productos locales, como la sopa de castañas?",
        "¿Cuál es tu opinión sobre la influencia histórica y cultural en la gastronomía de Miranda do Douro, como en el caso de las alheiras?"
    ],
    pt_pt: [
        "Qual prato típico de Miranda do Douro gostarias de experimentar primeiro e porquê?",
        "Tens interesse em aprender a cozinhar algum dos pratos mencionados? Se sim, qual?",
        "O que achas das tradições culinárias que utilizam produtos locais, como a sopa de castanha?",
        "Qual a tua opinião sobre a influência histórica e cultural na gastronomia de Miranda do Douro, como no caso das alheiras?"
    ]
};
const EXAMPLES_TURISMO: { [key: string]: string[] } = {
    en: [
        "Which tourist spot in Miranda do Douro would you like to visit first and why?",
        "Have you heard about the Mirandese language before? What do you think of its cultural importance?",
        "Which aspect of the history of Miranda do Douro interests you the most?",
        "What outdoor activities would you like to do in the International Douro Natural Park?"
    ],
    pt: [
        "Qual ponto turístico de Miranda do Douro você gostaria de visitar primeiro e por quê?",
        "Você já ouviu falar sobre a língua mirandesa antes? O que acha de sua importância cultural?",
        "Qual aspecto da história de Miranda do Douro mais desperta seu interesse?",
        "Quais atividades ao ar livre você gostaria de realizar no Parque Natural do Douro Internacional?"
    ],
    es: [
        "¿Qué punto turístico de Miranda do Douro te gustaría visitar primero y por qué?",
        "¿Has oído hablar del idioma mirandés antes? ¿Qué piensas de su importancia cultural?",
        "¿Qué aspecto de la historia de Miranda do Douro despierta más tu interés?",
        "¿Qué actividades al aire libre te gustaría realizar en el Parque Natural del Duero Internacional?"
    ],
    pt_pt: [
        "Qual ponto turístico de Miranda do Douro gostarias de visitar primeiro e porquê?",
        "Já ouviste falar da língua mirandesa antes? O que achas da sua importância cultural?",
        "Qual aspecto da história de Miranda do Douro mais desperta o teu interesse?",
        "Quais atividades ao ar livre gostarias de realizar no Parque Natural do Douro Internacional?"
    ]
};
const EXAMPLES_HISTORIA: { [key: string]: string[] } = {
    en: [
        "Which tourist spot in Miranda do Douro fascinates you more: the Aqueduct of Vilarinho or the Castle of Miranda do Douro? Why?",
        "Have you had the opportunity to visit the Museum of Terra de Miranda? What do you think of its collection of archaeological artifacts?",
        "Which aspect of the War of Mirandum, which occurred during the Seven Years' War, impresses you the most?",
        "What activities would you like to do while exploring the prehistoric rock sanctuaries in Miranda do Douro?"
    ],
    pt: [
        "Qual ponto turístico em Miranda do Douro mais te fascina: o Aqueduto do Vilarinho ou o Castelo de Miranda do Douro? Por quê?",
        "Você já teve a oportunidade de visitar o Museu da Terra de Miranda? O que acha da sua coleção de artefatos arqueológicos?",
        "Qual aspecto da Guerra do Mirandum, que ocorreu durante a Guerra dos Sete Anos, mais te impressiona?",
        "Quais atividades você gostaria de realizar ao explorar os santuários rupestres pré-históricos em Miranda do Douro?"
    ],
    es: [
        "¿Qué punto turístico de Miranda do Douro te fascina más: el Acueducto de Vilarinho o el Castillo de Miranda do Douro? ¿Por qué?",
        "¿Has tenido la oportunidad de visitar el Museo de Tierra de Miranda? ¿Qué opinas de su colección de artefactos arqueológicos?",
        "¿Qué aspecto de la Guerra del Mirandum, que ocurrió durante la Guerra de los Siete Años, te impresiona más?",
        "¿Qué actividades te gustaría realizar al explorar los santuarios rupestres prehistóricos en Miranda do Douro?"
    ],
    pt_pt: [
        "Qual ponto turístico de Miranda do Douro gostarias de visitar primeiro: o Aqueduto do Vilarinho ou o Castelo de Miranda do Douro? Porquê?",
        "Já ouviste falar do Museu da Terra de Miranda? O que achas da sua coleção de artefactos arqueológicos?",
        "Qual aspecto da Guerra do Mirandum, que ocorreu durante a Guerra dos Sete Anos, mais te impressiona?",
        "Quais atividades ao ar livre gostarias de realizar ao explorar os santuários rupestres pré-históricos em Miranda do Douro?"
    ]
};

const EXAMPLES_CULTURA: { [key: string]: string[] } = {
    en: [
        "Which legend of Miranda do Douro intrigues you more: the Legend of the Moura or the Legend of the Nazo? Why?",
        "Have you had the opportunity to watch the 'Velha' dance or the 'Carocho' festival? What did you think of these traditions?",
        "What is your opinion on the preservation and revitalization of the Mirandese language in modern culture?",
        "Which aspect of Miranda do Douro's craftsmanship interests you more: the making of the 'Capa de Honras' or the production of bagpipes?"
    ],
    pt: [
        "Qual lenda de Miranda do Douro mais te intriga: a Lenda da Moura ou a Lenda do Nazo? Por quê?",
        "Você já teve a oportunidade de assistir à dança da 'Velha' ou à festa do 'Carocho'? O que achou dessas tradições?",
        "Qual é a sua opinião sobre a preservação e a revitalização da língua mirandesa na cultura moderna?",
        "Qual aspecto do artesanato de Miranda do Douro mais desperta o seu interesse: a confecção da 'Capa de Honras' ou a produção de gaitas-de-foles?"
    ],
    es: [
        "¿Qué leyenda de Miranda do Douro te intriga más: la Leyenda de la Moura o la Leyenda del Nazo? ¿Por qué?",
        "¿Has tenido la oportunidad de ver la danza de la 'Vieja' o la fiesta del 'Carocho'? ¿Qué opinas de estas tradiciones?",
        "¿Cuál es tu opinión sobre la preservación y revitalización del idioma mirandés en la cultura moderna?",
        "¿Qué aspecto de la artesanía de Miranda do Douro te despierta más interés: la confección de la 'Capa de Honras' o la producción de gaitas de foles?"
    ],
    pt_pt: [
        "Qual lenda de Miranda do Douro mais te intriga: a Lenda da Moura ou a Lenda do Nazo? Porquê?",
        "Já tiveste a oportunidade de assistir à dança da 'Velha' ou à festa do 'Carocho'? O que achaste dessas tradições?",
        "Qual é a tua opinião sobre a preservação e a revitalização da língua mirandesa na cultura moderna?",
        "Qual aspecto do artesanato de Miranda do Douro mais desperta o teu interesse: a confecção da 'Capa de Honras' ou a produção de gaitas-de-foles?"
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
