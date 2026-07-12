import type { PsikotesCategoryResult } from "@/lib/psikotes"

function categoriesHtml(categories: PsikotesCategoryResult[]): string {
  return categories
    .map(
      cat => `
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F3EEF8;border-radius:12px;padding:16px 18px;margin-bottom:12px;">
                <tr><td>
                  <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#5A3A7A;">${cat.label}</p>
                  ${cat.narratives.map(n => `<p style="margin:0 0 6px;font-size:12px;color:#666666;line-height:1.7;">${n}</p>`).join("")}
                </td></tr>
              </table>`
    )
    .join("")
}

export function psikotesInviteResultHtml(parentName: string, nannyName: string, categories: PsikotesCategoryResult[]): string {
  const firstName = parentName.split(" ")[0] ?? parentName
  const nannyFirstName = nannyName.split(" ")[0] ?? nannyName

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Hasil Psikotes ${nannyFirstName} Sudah Siap</title>
</head>
<body style="margin:0;padding:0;background-color:#F3EEF8;font-family:'Plus Jakarta Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F3EEF8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#5A3A7A;border-radius:14px;padding:10px 20px;">
                    <span style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">BundaYakin</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color:#5A3A7A;border-radius:24px 24px 0 0;padding:36px 32px 28px;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#A8DDD8;">Undangan Psikotes selesai</p>
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#ffffff;line-height:1.3;font-style:italic;">
                Halo, Bunda ${firstName} 👋
              </h1>
              <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.75);line-height:1.6;">
                ${nannyFirstName} sudah menyelesaikan Psikotes Karakter Kerja Nanny yang Bunda undang. Ini gambaran gaya kerjanya.
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color:#ffffff;border-radius:0 0 24px 24px;padding:28px 32px 32px;">
              ${categoriesHtml(categories)}
              <p style="margin:16px 0 0;font-size:11px;color:#999AAA;line-height:1.6;">
                Hasil ini adalah gambaran gaya kerja ${nannyFirstName} berdasarkan Psikotes Karakter Kerja Nanny (Capture Work Style), bukan tes kecocokan dengan keluarga Bunda.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:24px 0 8px;">
              <p style="margin:0 0 4px;font-size:11px;color:#999AAA;">
                Email ini dikirim ke akun BundaYakin kamu.
              </p>
              <p style="margin:0;font-size:11px;color:#C8B8DC;">
                Human Care Consulting · bundayakin.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function psikotesInviteResultText(parentName: string, nannyName: string, categories: PsikotesCategoryResult[]): string {
  const firstName = parentName.split(" ")[0] ?? parentName
  const nannyFirstName = nannyName.split(" ")[0] ?? nannyName

  const body = categories
    .map(cat => `${cat.label}\n${cat.narratives.map(n => `- ${n}`).join("\n")}`)
    .join("\n\n")

  return `Halo, Bunda ${firstName}!

${nannyFirstName} sudah menyelesaikan Psikotes Karakter Kerja Nanny yang Bunda undang.

${body}

Hasil ini adalah gambaran gaya kerja ${nannyFirstName}, bukan tes kecocokan dengan keluarga Bunda.

— Tim BundaYakin`
}
