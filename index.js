const { create } = require('venom-bot');
const dotenv = require('dotenv');
const OpenAIApi = require('openai-api');

dotenv.config();

// Inicializa o cliente WhatsApp usando Venom-bot
create({
    session: 'Chat-GPT', // Define uma sessão chamada 'Chat-GPT'
    multidevice: true // Habilita a funcionalidade de vários dispositivos
})
    .then((client) => start(client)) // Quando o cliente estiver pronto, chama a função 'start'
    .catch((erro) => {
        console.log(erro); // Em caso de erro, registra-o no console
    });

const openai = new OpenAIApi({ key: process.env.OPENAI_KEY });

// Função para obter uma resposta do modelo de linguagem GPT-3 (Davinci)
const getDavinciResponse = async (clientText) => {
    // Define as opções para a solicitação ao modelo GPT-3 (Davinci)
    const options = {
        engine: 'davinci', // Usa o mecanismo Davinci da OpenAI
        prompt: clientText, // O texto que o modelo deve continuar
        max_tokens: 4000, // O número máximo de tokens na resposta
        temperature: 1, // Controla a aleatoriedade da resposta
        top_p: 1, // Controla a diversidade da resposta
        presencePenalty: 0, // Penalidade por repetir tokens
        frequencyPenalty: 0, // Penalidade por usar palavras com frequência
        bestOf: 1, // Número de respostas a serem geradas e escolhidas
        n: 1, // Número de respostas a serem retornadas
        stream: false, // Define se o resultado é retornado como streaming
        stop: ['\n', 'testing'], // Define os tokens de parada
    };

    try {
        // Faz uma solicitação à API da OpenAI para obter uma resposta
        const response = await openai.createCompletion(options);
        let botResponse = '';
        // Extrai o texto da resposta
        response.data.choices.forEach(({ text }) => {
            botResponse += text;
        });
        // Retorna a resposta formatada com um cabeçalho
        return `Chat GPT 🤖\n\n ${botResponse.trim()}`;
    } catch (e) {
        return `❌ OpenAI Response Error: ${e.response.data.error.message}`;
    }
};

// Função para obter uma resposta do modelo de pesquisa DALL-E
const getDalleResponse = async (clientText) => {
    // Define as opções para a solicitação ao modelo DALL-E
    const options = {
        engine: 'davinci', // Usa o mecanismo Davinci da OpenAI
        documents: ["White House", "hospital", "school"], // Documentos de referência
        query: clientText // Consulta para o modelo DALL-E
    };

    try {
        // Faz uma solicitação à API da OpenAI para obter uma resposta do DALL-E
        const response = await openai.createSearch(options);
        console.log(response.data); // Registra os dados de resposta no console
    } catch (e) {
        return `❌ OpenAI Response Error: ${e.response.data.error.message}`;
    }
};

// Define um objeto com comandos disponíveis
const commands = (client, message) => {
    const iaCommands = {
        davinci3: "/bot",
        dalle: "/img"
    }

    // Extrai a primeira palavra da mensagem
    let firstWord = message.text.substring(0, message.text.indexOf(" "));

    switch (firstWord) {
        case iaCommands.davinci3:
            const question = message.text.substring(message.text.indexOf(" "));

            const botText = "🤖 world 🌎"
            // Chama a função getDavinciResponse com a pergunta do usuário
            getDavinciResponse(question).then((response) => {
                // Envia a resposta de volta ao remetente
                client.sendText(message.from, botText)
            });
            break;

        case iaCommands.dalle:
            const imgDescription = message.text.substring(message.text.indexOf(" "));
            // Chama a função getDalleResponse com a descrição da imagem
            getDalleResponse(imgDescription).then((imgUrl) => {
                // Envia uma imagem gerada pelo modelo DALL-E
                client.sendImage(
                    message.from,
                    imgUrl,
                    imgDescription,
                    'Imagem gerada pela IA DALL-E 🤖'
                );
            });
            break;
    }
};

// Função principal que configura um ouvinte para as mensagens do cliente WhatsApp
async function start(client) {
    client.onAnyMessage((message) => commands(client, message));
}
