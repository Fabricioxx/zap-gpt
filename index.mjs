import { create } from 'venom-bot'

create({
    session: 'chat-gpt',
    multidevice: true
})
    .then((client) => start(client))
    .catch((erro) => {
        console.log(erro)
    })

async function start(client) {
    const botText = "🤖 world 🌎"
    // Da um console.log em message depois, tem muita coisa bacana
    client.onAnyMessage((message) => {
        if (message.body.toLowerCase() === "hello") {
            // message.from é o número do usuário que enviou a msg "hello"
            client.sendText(message.from, botText)
        }
    })
}