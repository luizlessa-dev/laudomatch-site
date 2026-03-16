import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import handler, { getBotReply, sendWhatsAppMessage } from "./whatsapp-webhook"

// ===============================
// Helpers
// ===============================

function makeReq(overrides: Record<string, unknown> = {}) {
  return {
    method: "GET",
    query: {},
    body: {},
    ...overrides,
  }
}

function makeRes() {
  const res = {
    _status: 0,
    _body: undefined as unknown,
    status(code: number) {
      res._status = code
      return { send: (b: unknown) => { res._body = b } }
    },
    sendStatus(code: number) {
      res._status = code
    },
  }
  return res
}

// ===============================
// getBotReply
// ===============================

describe("getBotReply", () => {
  describe("welcome menu", () => {
    it.each(["", "oi", "olá", "ola"])(
      'returns menu for "%s"',
      (input) => {
        const reply = getBotReply(input)
        expect(reply).toContain("LaudoMatch")
        expect(reply).toContain("1️⃣")
        expect(reply).toContain("2️⃣")
        expect(reply).toContain("3️⃣")
        expect(reply).toContain("4️⃣")
      }
    )
  })

  describe("option 1 — platform info", () => {
    it.each(["1", "quero conhecer", "conhecer a plataforma"])(
      'returns platform description for "%s"',
      (input) => {
        const reply = getBotReply(input)
        expect(reply).toContain("laudos automaticamente")
        expect(reply).toContain("Imobiliárias")
      }
    )
  })

  describe("option 2 — example", () => {
    it.each(["2", "ver exemplo", "exemplo de laudo"])(
      'returns example link for "%s"',
      (input) => {
        const reply = getBotReply(input)
        expect(reply).toContain("laudomatch.com")
      }
    )
  })

  describe("option 3 — free trial", () => {
    it.each(["3", "teste", "gratis", "grátis", "quero testar grátis"])(
      'returns free trial CTA for "%s"',
      (input) => {
        const reply = getBotReply(input)
        expect(reply).toContain("laudomatch.com")
        expect(reply).toContain("2 laudos/mês")
      }
    )
  })

  describe("option 4 — human contact", () => {
    it.each(["4", "falar com humano", "humano"])(
      'returns human contact message for "%s"',
      (input) => {
        const reply = getBotReply(input)
        expect(reply).toContain("Luiz")
      }
    )
  })

  describe("FAQ — pricing", () => {
    it.each(["preço", "qual o valor", "ver plano", "planos disponíveis"])(
      'returns pricing for "%s"',
      (input) => {
        const reply = getBotReply(input)
        expect(reply).toContain("Gratuito")
        expect(reply).toContain("Pro")
        expect(reply).toContain("R$49")
      }
    )
  })

  describe("FAQ — mobile", () => {
    it.each(["celular", "iphone", "android"])(
      'returns mobile support reply for "%s"',
      (input) => {
        const reply = getBotReply(input)
        expect(reply).toContain("celular")
      }
    )
  })

  describe("FAQ — PDF", () => {
    it("returns PDF description for 'pdf'", () => {
      const reply = getBotReply("pdf")
      expect(reply).toContain("PDF")
    })
  })

  describe("fallback", () => {
    it.each(["banana", "xyz", "random text with no keywords"])(
      'returns fallback menu for unrecognized "%s"',
      (input) => {
        const reply = getBotReply(input)
        expect(reply).toContain("1️⃣")
        expect(reply).toContain("2️⃣")
        expect(reply).toContain("3️⃣")
        expect(reply).toContain("4️⃣")
      }
    )
  })

  describe("branch ordering", () => {
    it("option 1 wins over pricing when both keywords present", () => {
      // "1" matches option 1 before the pricing FAQ check
      const reply = getBotReply("1 preço")
      expect(reply).toContain("laudos automaticamente")
    })
  })
})

// ===============================
// handler — GET (webhook verification)
// ===============================

describe("handler GET — webhook verification", () => {
  beforeEach(() => {
    process.env.WHATSAPP_VERIFY_TOKEN = "test-token"
    process.env.WHATSAPP_TOKEN = "wa-token"
    process.env.PHONE_NUMBER_ID = "123456"
  })

  afterEach(() => {
    delete process.env.WHATSAPP_VERIFY_TOKEN
    delete process.env.WHATSAPP_TOKEN
    delete process.env.PHONE_NUMBER_ID
  })

  it("returns 200 and echoes challenge for valid verification", async () => {
    const req = makeReq({
      method: "GET",
      query: {
        "hub.mode": "subscribe",
        "hub.verify_token": "test-token",
        "hub.challenge": "abc123",
      },
    })
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(200)
    expect(res._body).toBe("abc123")
  })

  it("returns 403 for wrong token", async () => {
    const req = makeReq({
      method: "GET",
      query: {
        "hub.mode": "subscribe",
        "hub.verify_token": "wrong-token",
        "hub.challenge": "abc123",
      },
    })
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(403)
  })

  it("returns 403 for wrong mode", async () => {
    const req = makeReq({
      method: "GET",
      query: {
        "hub.mode": "unsubscribe",
        "hub.verify_token": "test-token",
        "hub.challenge": "abc123",
      },
    })
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(403)
  })

  it("returns 403 when query params are missing", async () => {
    const req = makeReq({ method: "GET", query: {} })
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(403)
  })
})

// ===============================
// handler — POST (message handling)
// ===============================

describe("handler POST — message handling", () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    process.env.WHATSAPP_VERIFY_TOKEN = "test-token"
    process.env.WHATSAPP_TOKEN = "wa-token"
    process.env.PHONE_NUMBER_ID = "123456"
    vi.stubGlobal("fetch", fetchMock)
    fetchMock.mockResolvedValue({ json: async () => ({ messages: [{ id: "wamid.1" }] }) })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete process.env.WHATSAPP_VERIFY_TOKEN
    delete process.env.WHATSAPP_TOKEN
    delete process.env.PHONE_NUMBER_ID
  })

  function makeMessageBody(text: string, from = "5511999990000") {
    return {
      entry: [
        {
          changes: [
            {
              value: {
                messages: [{ from, text: { body: text } }],
              },
            },
          ],
        },
      ],
    }
  }

  it("returns 200 and sends a reply for valid message", async () => {
    const req = makeReq({ method: "POST", body: makeMessageBody("oi") })
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(200)
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it("sends reply to correct recipient number", async () => {
    const req = makeReq({ method: "POST", body: makeMessageBody("oi", "5511888880000") })
    const res = makeRes()
    await handler(req, res)
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.to).toBe("5511888880000")
  })

  it("lowercases message text before matching", async () => {
    const req = makeReq({ method: "POST", body: makeMessageBody("OI") })
    const res = makeRes()
    await handler(req, res)
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    // "OI" lowercased → "oi" → welcome menu
    expect(body.text.body).toContain("LaudoMatch")
  })

  it("returns 200 without calling send when no message in body", async () => {
    const req = makeReq({ method: "POST", body: { entry: [] } })
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(200)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("returns 500 when sendWhatsAppMessage throws", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network error"))
    const req = makeReq({ method: "POST", body: makeMessageBody("oi") })
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(500)
  })
})

// ===============================
// handler — unsupported methods
// ===============================

describe("handler — unsupported HTTP methods", () => {
  it.each(["PUT", "DELETE", "PATCH"])("returns 405 for %s", async (method) => {
    const req = makeReq({ method })
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(405)
  })
})

// ===============================
// sendWhatsAppMessage
// ===============================

describe("sendWhatsAppMessage", () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    process.env.WHATSAPP_TOKEN = "wa-token"
    process.env.PHONE_NUMBER_ID = "987654"
    vi.stubGlobal("fetch", fetchMock)
    fetchMock.mockResolvedValue({ json: async () => ({}) })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete process.env.WHATSAPP_TOKEN
    delete process.env.PHONE_NUMBER_ID
  })

  it("calls the correct Meta Graph API URL", async () => {
    await sendWhatsAppMessage("5511999990000", "Hello")
    const [url] = fetchMock.mock.calls[0]
    expect(url).toContain("graph.facebook.com")
    expect(url).toContain("987654")
    expect(url).toContain("messages")
  })

  it("sets Authorization header with Bearer token", async () => {
    await sendWhatsAppMessage("5511999990000", "Hello")
    const [, options] = fetchMock.mock.calls[0]
    expect(options.headers["Authorization"]).toBe("Bearer wa-token")
  })

  it("sends correct request body structure", async () => {
    await sendWhatsAppMessage("5511999990000", "Hello there")
    const [, options] = fetchMock.mock.calls[0]
    const body = JSON.parse(options.body)
    expect(body.messaging_product).toBe("whatsapp")
    expect(body.to).toBe("5511999990000")
    expect(body.text.body).toBe("Hello there")
  })

  it("uses POST method", async () => {
    await sendWhatsAppMessage("5511999990000", "Hello")
    const [, options] = fetchMock.mock.calls[0]
    expect(options.method).toBe("POST")
  })

  it("throws when fetch rejects (network error propagates)", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network failure"))
    await expect(sendWhatsAppMessage("5511999990000", "Hello")).rejects.toThrow("network failure")
  })
})
