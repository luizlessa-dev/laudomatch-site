export const config = {
  runtime: "edge",
}

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN!
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID!

// --------------------------------------------------
// VERIFICAÇÃO DO WEBHOOK (Meta faz isso 1x)
// --------------------------------------------------
export async function GET(req: Request) {
  const url = new URL(req.url)

  const mode = url.searchParams.get("hub.mode")
  const token = url.searchParams.get("hub.verify_token")
  const challenge = url.searchParams.get("hub.challenge")

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verificado com sucesso")
    return new Response(challenge, { status: 200 })
  }

  return new Response("Erro de verificação", { status: 403 })
}

// --------------------------------------------------
// RECEBER MENSAGENS DO WHATSAPP
// --------------------------------------------------
export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("📩 WEBHOOK RECEBIDO:", JSON.stringify(body))

    const message =
      body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]

    if (!message) {
      console.log("Nenhuma mensagem encontrada")
      return new Response("ok", { status: 200 })
    }

    const from = message.from
    const text = message.text?.body || ""

    console.log("👤 Usuário:", from)
    console.log("💬 Mensagem:", text)

    // resposta automática
    await sendWhatsAppMessage(
      from,
      "👋 Olá! Aqui é o LaudoMatch.\n\nRecebemos sua mensagem com sucesso!"
    )

    return new Response("ok", { status: 200 })

  } catch (error) {
    console.error("❌ ERRO NO WEBHOOK:", error)
    return new Response("erro", { status: 200 })
  }
}

// --------------------------------------------------
// ENVIAR MENSAGEM VIA WHATSAPP CLOUD API
// --------------------------------------------------
async function sendWhatsAppMessage(to: string, text: string) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v24.0/${PHONE_NUMBER_ID}/messages`,
      {
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
      }
    )

    const data = await response.json()

    console.log("📤 RESPOSTA META:", JSON.stringify(data))

  } catch (error) {
    console.error("❌ ERRO AO ENVIAR MENSAGEM:", error)
  }
}
