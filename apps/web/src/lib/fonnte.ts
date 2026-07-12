// Kirim pesan WhatsApp via Fonnte. `phone` harus sudah dalam format internasional
// (62xxxxxxxxxx) — pakai normalizePhone() dari src/lib/phone.ts sebelum memanggil ini.
export async function sendWhatsAppMessage(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: process.env.FONNTE_API_TOKEN!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ target: phone, message, countryCode: "62" }),
    })

    const result = await res.json() as { status?: boolean; reason?: string }
    if (!res.ok || !result.status) {
      return { success: false, error: result.reason ?? `Fonnte error ${res.status}` }
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}
