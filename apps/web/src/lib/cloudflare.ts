import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

// ============================================================
// CLOUDFLARE R2 — foto (avatar, portfolio nanny)
// Folder struktur: users/{userId}/avatar/ dan users/{userId}/portfolio/photos/
// ============================================================

const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.R2_BUCKET_NAME!
const PUBLIC_URL = process.env.R2_PUBLIC_URL!

export const r2 = {
  async uploadPhoto(key: string, body: Buffer, contentType: string) {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    )
    return `${PUBLIC_URL}/${key}`
  },

  async deletePhoto(key: string) {
    await r2Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
  },

  async getPresignedUploadUrl(key: string, contentType: string, expiresIn = 300) {
    return getSignedUrl(
      r2Client,
      new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
      { expiresIn }
    )
  },

  publicUrl(key: string) {
    return `${PUBLIC_URL}/${key}`
  },

  // Folder helpers — memastikan struktur konsisten
  keys: {
    avatar: (userId: string) => `users/${userId}/avatar/profile`,
    portfolioPhoto: (userId: string, slug: string) =>
      `users/${userId}/portfolio/photos/${Date.now()}-${slug}`,
    childJournalPhoto: (userId: string, childId: string, slug: string) =>
      `users/${userId}/children/${childId}/journal/${Date.now()}-${slug}`,
  },
}

// ============================================================
// CLOUDFLARE STREAM — video (perkenalan & keahlian nanny)
// Setiap video max 3 menit (180 detik), di-enforce saat upload
// ============================================================

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!
const STREAM_TOKEN = process.env.CLOUDFLARE_STREAM_TOKEN!
const STREAM_BASE = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream`

type StreamUploadResult = {
  uid: string
  state: "queued" | "inprogress" | "ready" | "error" | string
  playbackUrl: string
  thumbnailUrl: string
  duration?: number
}

export const cfStream = {
  async getUploadUrl(metadata: {
    userId: string
    nannyId: string
    type: "INTRO_VIDEO" | "SKILL_VIDEO"
    slug: string
    maxDurationSeconds?: number
  }): Promise<{ uploadUrl: string; uid: string }> {
    if (!ACCOUNT_ID) throw new Error("CLOUDFLARE_ACCOUNT_ID belum dikonfigurasi")
    if (!STREAM_TOKEN) throw new Error("CLOUDFLARE_STREAM_TOKEN belum dikonfigurasi")

    const res = await fetch(`${STREAM_BASE}/direct_upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STREAM_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        maxDurationSeconds: metadata.maxDurationSeconds ?? 180,
        meta: {
          userId: metadata.userId,
          nannyId: metadata.nannyId,
          type: metadata.type,
          slug: metadata.slug,
        },
      }),
    })

    if (!res.ok) {
      const errBody = await res.text().catch(() => "")
      throw new Error(`Cloudflare Stream API ${res.status}: ${errBody}`)
    }

    const data = await res.json()
    if (!data.result?.uploadURL || !data.result?.uid) {
      throw new Error(`Cloudflare Stream response tidak valid: ${JSON.stringify(data)}`)
    }

    return {
      uploadUrl: data.result.uploadURL,
      uid: data.result.uid,
    }
  },

  async getVideoDetails(uid: string): Promise<StreamUploadResult> {
    const res = await fetch(`${STREAM_BASE}/${uid}`, {
      headers: { Authorization: `Bearer ${STREAM_TOKEN}` },
    })

    if (!res.ok) {
      throw new Error(`Cloudflare Stream get video gagal: ${res.status}`)
    }

    const data = await res.json()
    return {
      uid: data.result.uid,
      state: (data.result.status?.state as string) ?? "queued",
      // Ambil dari API response — jangan konstruksi manual pakai ACCOUNT_ID
      // (ACCOUNT_ID ≠ customer subdomain CF Stream)
      playbackUrl: data.result.playback?.hls ?? `https://videodelivery.net/${uid}/manifest/video.m3u8`,
      thumbnailUrl: data.result.thumbnail ?? `https://videodelivery.net/${uid}/thumbnails/thumbnail.jpg`,
      duration: typeof data.result.duration === "number" ? data.result.duration : undefined,
    }
  },

  async deleteVideo(uid: string) {
    const res = await fetch(`${STREAM_BASE}/${uid}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${STREAM_TOKEN}` },
    })

    if (!res.ok) {
      throw new Error(`Cloudflare Stream delete gagal: ${res.status}`)
    }
  },

  embedUrl(uid: string) {
    return `https://iframe.videodelivery.net/${uid}`
  },

  thumbnailUrl(uid: string) {
    // videodelivery.net tidak butuh customer subdomain (ACCOUNT_ID ≠ customer subdomain)
    return `https://videodelivery.net/${uid}/thumbnails/thumbnail.jpg`
  },
}
