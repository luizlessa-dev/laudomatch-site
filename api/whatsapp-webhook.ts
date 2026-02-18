import type { VercelRequest, VercelResponse } from '@vercel/node'

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN
const PHONE_NUMBER_ID = "1031772316684759"

async function sendWhatsAppMessage(to: string, text: string) {
  await fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text }
    })
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {

  // Verificação da Meta
  if (req.method === 'GET') {
    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']

    if (mode === 'subscribe' && token === 'laudomatch_verify_token') {
      return res.status(200).send(challenge)
    }

    return res.status(403).send('Forbidden')
  }

  // Recebendo mensagens do WhatsApp
  if (req.method === 'POST') {
    const body = req.body

    try {
      const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]

      if (message) {
        const from = message.from
        const userText = message.text?.body || ""

        console.log("Mensagem recebida:", userText)

        const reply = `👋 Olá! Sou o assistente do *LaudoMatch*.

Geramos laudos de vistoria profissional automaticamente a partir de fotos 📸

👉 Teste grátis agora:
https://laudomatch.com

Se quiser, responda *COMEÇAR* que eu te explico como funciona 😉`

        await sendWhatsAppMessage(from, reply)
      }

      return res.status(200).send("EVENT_RECEIVED")

    } catch (error) {
      console.error(error)
      return res.status(200).send("OK")
    }
  }

  return res.status(200).send("OK")
}
