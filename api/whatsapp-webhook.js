// ===============================
// CONFIG
// ===============================
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;


// ===============================
// VERIFICAÇÃO DO WEBHOOK (META)
// ===============================
export default async function handler(req, res) {

  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK VERIFICADO");
      return res.status(200).send(challenge);
    } else {
      return res.status(403).send("Forbidden");
    }
  }

  // ===============================
  // RECEBER MENSAGENS
  // ===============================
  if (req.method === "POST") {
    try {
      const body = req.body;

      const message =
        body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

      if (!message) return res.sendStatus(200);

      const from = message.from;
      const text = message.text?.body?.toLowerCase() || "";

      console.log("Mensagem recebida:", text);

      const reply = getBotReply(text);

      await sendWhatsAppMessage(from, reply);

      return res.sendStatus(200);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  }

  return res.sendStatus(405);
}


// ===============================
// MOTOR DO BOT
// ===============================
function getBotReply(text) {

  // PRIMEIRA MENSAGEM / MENU
  if (!text || text === "oi" || text === "olá" || text === "ola") {
    return `Olá! 👋

Sou o assistente do *LaudoMatch*.

Criamos laudos de vistoria com fotos + IA 📸📄

Como posso te ajudar?

1️⃣ Conhecer a plataforma
2️⃣ Ver exemplo de laudo
3️⃣ Testar gratuitamente
4️⃣ Falar com humano`;
  }

  // OPÇÃO 1
  if (text.includes("1") || text.includes("conhecer")) {
    return `O LaudoMatch cria laudos automaticamente usando fotos + IA.

Você só precisa:
• Tirar fotos
• Escrever observações
• Gerar o PDF em minutos

Ideal para:
🏢 Imobiliárias
👷 Engenheiros
📐 Arquitetos

Digite *3* para testar grátis 😉`;
  }

  // OPÇÃO 2
  if (text.includes("2") || text.includes("exemplo")) {
    return `Você pode ver um exemplo aqui:
https://www.laudomatch.com

Digite *3* para criar sua conta grátis 🙂`;
  }

  // OPÇÃO 3 (CONVERSÃO)
  if (
    text.includes("3") ||
    text.includes("teste") ||
    text.includes("gratis") ||
    text.includes("grátis")
  ) {
    return `Perfeito! 🎉

Crie sua conta grátis:
https://www.laudomatch.com

Plano gratuito inclui:
• 2 laudos/mês
• PDF automático
• IA integrada`;
  }

  // OPÇÃO 4
  if (text.includes("4") || text.includes("humano")) {
    return `Perfeito 🙂

O Luiz vai falar com você aqui em breve 👍`;
  }

  // FAQ PREÇO
  if (
    text.includes("preço") ||
    text.includes("valor") ||
    text.includes("plano")
  ) {
    return `Temos dois planos:

🆓 Gratuito — 2 laudos/mês
🚀 Pro — R$49/mês ilimitado

Comece grátis:
https://www.laudomatch.com`;
  }

  // FAQ CELULAR
  if (text.includes("celular") || text.includes("iphone") || text.includes("android")) {
    return `Sim 😊 funciona direto no celular!`;
  }

  // FAQ PDF
  if (text.includes("pdf")) {
    return `Os laudos são gerados em PDF profissional automaticamente 📄`;
  }

  // FALLBACK
  return `Posso te ajudar 🙂

1️⃣ Conhecer a plataforma
2️⃣ Ver exemplo
3️⃣ Testar grátis
4️⃣ Falar com humano`;
}


// ===============================
// ENVIAR MENSAGEM WHATSAPP
// ===============================
async function sendWhatsAppMessage(to, message) {

  const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;

  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to,
      text: { body: message },
    }),
  });
}
