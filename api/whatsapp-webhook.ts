import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 1️⃣ VERIFICAÇÃO DO WEBHOOK (META)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']

    if (mode === 'subscribe' && token === 'laudomatch_verify_token') {
      return res.status(200).send(challenge)
    }

    return res.status(403).send('Forbidden')
  }

  // 2️⃣ EVENTOS RECEBIDOS DO WHATSAPP
  if (req.method === 'POST') {
    console.log('Evento WhatsApp recebido:')
    console.log(JSON.stringify(req.body, null, 2))

    return res.status(200).send('EVENT_RECEIVED')
  }

  return res.status(200).send('OK')
}
