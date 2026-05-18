import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import crypto from "crypto"

// POST /api/webhooks/cloudflare-stream
//
// Cloudflare Stream memanggil webhook ini saat video selesai di-encode (state = "ready").
// Kita update durationSec di NannyMedia supaya kita tahu video sudah siap diputar.
//
// Setup di CF Stream dashboard:
//   Webhook URL: https://bundayakin.com/api/webhooks/cloudflare-stream
//   Secret: CLOUDFLARE_STREAM_WEBHOOK_SECRET (simpan di env)
//
// CF mengirim header: Cloudflare-Signature: time=<unix>,sig1=<hmac-sha256>
// Signature = HMAC-SHA256(key=secret, data="<time>.<raw-body>")

export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get("Cloudflare-Signature") ?? ""

  // Fail-closed: reject all requests if secret is not configured
  const secret = process.env.CLOUDFLARE_STREAM_WEBHOOK_SECRET
  if (!secret) {
    console.error("[CF_STREAM_WEBHOOK] CLOUDFLARE_STREAM_WEBHOOK_SECRET not configured")
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
  }

  const timePart = signature.split(",").find((p) => p.startsWith("time="))
  const sigPart  = signature.split(",").find((p) => p.startsWith("sig1="))
  const time = timePart?.slice(5) ?? ""
  const sig  = sigPart?.slice(5)  ?? ""

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${time}.${rawBody}`)
    .digest("hex")

  // Decode hex → bytes before comparing; Buffer lengths must match for timingSafeEqual
  const expBuf = Buffer.from(expected, "hex")
  const sigBuf = Buffer.from(sig, "hex")
  if (expBuf.length !== sigBuf.length || !crypto.timingSafeEqual(expBuf, sigBuf)) {
    console.warn("[CF_STREAM_WEBHOOK] signature mismatch")
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const uid = payload.uid as string | undefined
  const state = (payload.status as { state?: string } | undefined)?.state
  const durationRaw = payload.duration as number | undefined

  // Only act when video is fully ready
  if (uid && state === "ready") {
    const durationSec = durationRaw ? Math.round(durationRaw) : null
    await prisma.nannyMedia.updateMany({
      where: { storageKey: uid },
      data: { ...(durationSec !== null ? { durationSec } : {}) },
    })
  }

  return NextResponse.json({ ok: true })
}
