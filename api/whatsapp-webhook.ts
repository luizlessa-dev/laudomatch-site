import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // ===== VERIFICAÇÃO DA META (GET) =====
  if (req.method === 'GET') {
    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']

    if (mode === 'subscribe' && token === 'laudomatch_verify_token') {
      console.log('Webhook verificado pela Meta')
      return res.status(200).send(challenge)
    }

    return res.status(403).send('Forbidden')
  }

  // ===== EVENTOS RECEBIDOS DO WHATSAPP (POST) =====
  if (req.method === 'POST') {
    console.log('📩 Evento recebido do WhatsApp:')
    console.log(JSON.stringify(req.body, null, 2))

    return res.status(200).send('EVENT_RECEIVED')
  }

  return res.status(200).send('OK')
}
