export function welcomeNannyHtml(name: string): string {
  const firstName = name.split(" ")[0] ?? name

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Selamat Bergabung di BundaYakin</title>
</head>
<body style="margin:0;padding:0;background-color:#E5F6F4;font-family:'Plus Jakarta Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#E5F6F4;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header / Logo -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#2C5F5A;border-radius:14px;padding:10px 20px;">
                    <span style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">BundaYakin</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero card -->
          <tr>
            <td style="background-color:#2C5F5A;border-radius:24px 24px 0 0;padding:36px 32px 28px;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#A8DDD8;">Selamat bergabung</p>
              <h1 style="margin:0 0 12px;font-size:26px;font-weight:700;color:#ffffff;line-height:1.3;">
                Halo, ${firstName}! 🌟
              </h1>
              <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.8);line-height:1.6;">
                Kamu sudah terdaftar di BundaYakin — platform yang menghargai kemampuan dan kepribadian nanny secara adil dan ilmiah.
              </p>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="background-color:#ffffff;border-radius:0 0 24px 24px;padding:28px 32px 32px;">

              <!-- Message -->
              <p style="margin:0 0 20px;font-size:14px;color:#444444;line-height:1.7;">
                Di BundaYakin, kami tidak hanya melihat pengalaman kerjamu — kami membantu orang tua mengenal <strong>siapa kamu sebenarnya</strong>: cara kerjamu, nilaimu, dan kecocokanmu dengan keluarga yang tepat.
              </p>

              <!-- Steps -->
              <p style="margin:0 0 16px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#999AAA;">Yang perlu kamu lakukan</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
                <tr>
                  <td width="36" valign="top" style="padding-top:2px;">
                    <div style="width:28px;height:28px;border-radius:50%;background-color:#E5F6F4;font-size:13px;font-weight:700;color:#2C5F5A;text-align:center;line-height:28px;">1</div>
                  </td>
                  <td style="padding-left:8px;">
                    <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#2C5F5A;">Lengkapi profil kamu</p>
                    <p style="margin:0;font-size:12px;color:#999AAA;line-height:1.5;">Foto, pengalaman kerja, kemampuan khusus, dan video perkenalan singkat.</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
                <tr>
                  <td width="36" valign="top" style="padding-top:2px;">
                    <div style="width:28px;height:28px;border-radius:50%;background-color:#E5F6F4;font-size:13px;font-weight:700;color:#2C5F5A;text-align:center;line-height:28px;">2</div>
                  </td>
                  <td style="padding-left:8px;">
                    <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#2C5F5A;">Isi tes kecocokan</p>
                    <p style="margin:0;font-size:12px;color:#999AAA;line-height:1.5;">Pertanyaan tentang preferensi kerja dan gaya pengasuhan. Jujur adalah kunci cocok yang tepat.</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td width="36" valign="top" style="padding-top:2px;">
                    <div style="width:28px;height:28px;border-radius:50%;background-color:#E5F6F4;font-size:13px;font-weight:700;color:#2C5F5A;text-align:center;line-height:28px;">3</div>
                  </td>
                  <td style="padding-left:8px;">
                    <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#2C5F5A;">Tunggu undangan dari orang tua</p>
                    <p style="margin:0;font-size:12px;color:#999AAA;line-height:1.5;">Saat ada keluarga yang cocok, kamu akan diundang untuk mulai proses matching.</p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="https://bundayakin.com/dashboard/nanny"
                       style="display:inline-block;background-color:#5BBFB0;color:#ffffff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;min-width:200px;text-align:center;">
                      Lengkapi Profil →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Trust message -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#E5F6F4;border-radius:12px;padding:16px 20px;">
                <tr>
                  <td>
                    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#2C5F5A;">Kamu aman bersama kami</p>
                    <p style="margin:0;font-size:12px;color:#2C5F5A;line-height:1.7;">
                      ✓ Profil kamu hanya terlihat oleh orang tua yang cocok<br/>
                      ✓ Data pribadi dijaga ketat<br/>
                      ✓ Proses matching transparan &amp; adil untuk kedua pihak
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 0 8px;">
              <p style="margin:0 0 4px;font-size:11px;color:#5A8A85;">
                Email ini dikirim ke akun BundaYakin kamu.
              </p>
              <p style="margin:0;font-size:11px;color:#7ABDB7;">
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

export function welcomeNannyText(name: string): string {
  const firstName = name.split(" ")[0] ?? name
  return `Halo, ${firstName}!

Selamat bergabung di BundaYakin!

Yang perlu kamu lakukan:
1. Lengkapi profil (foto, pengalaman, video perkenalan)
2. Isi tes kecocokan dengan jujur
3. Tunggu undangan dari orang tua yang cocok

Mulai sekarang: https://bundayakin.com/dashboard/nanny

Kamu aman bersama kami — data pribadimu dijaga ketat.
— Tim BundaYakin`
}
