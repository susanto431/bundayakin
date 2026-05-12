export type PdfReportPayload = {
  matching_request_id: string
  nanny: {
    name: string
    city?: string | null
    years_of_experience?: number | null
    skills?: string[]
    education_level?: string | null
    religion?: string | null
  }
  parent: {
    full_name: string
  }
  scores: {
    overall: number
    domain_a?: number | null
    domain_b?: number | null
    domain_c?: number | null
    aspect_breakdown?: Record<string, number>
  }
  match_highlights?: string[]
  mismatch_areas?: string[]
  negotiation_points?: string[]
  tips_for_parent?: string[]
  tips_for_nanny?: string[]
  generated_at?: string
}

export async function generatePdfReport(payload: PdfReportPayload): Promise<ArrayBuffer> {
  const serviceUrl = process.env.PDF_SERVICE_URL
  const secret = process.env.PDF_SERVICE_SECRET

  if (!serviceUrl || !secret) {
    throw new Error("PDF_SERVICE_URL or PDF_SERVICE_SECRET not configured")
  }

  const res = await fetch(`${serviceUrl}/generate-report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": secret,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`PDF service error ${res.status}: ${text}`)
  }

  return res.arrayBuffer()
}
