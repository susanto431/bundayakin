export function welcomeParentHtml(name: string): string {
  const firstName = name.split(" ")[0] ?? name

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Selamat Datang di BundaYakin</title>
</head>
<body style="margin:0;padding:0;background-color:#F3EEF8;font-family:'Plus Jakarta Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F3EEF8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header / Logo -->
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

          <!-- Hero card -->
          <tr>
            <td style="background-color:#5A3A7A;border-radius:24px 24px 0 0;padding:36px 32px 28px;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#A8DDD8;">Selamat datang</p>
              <h1 style="margin:0 0 12px;font-size:26px;font-weight:700;color:#ffffff;line-height:1.3;font-style:italic;">
                Halo, Bunda ${firstName} 👋
              </h1>
              <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.75);line-height:1.6;">
                Akun BundaYakin kamu sudah aktif. Kami siap membantu Bunda menemukan nanny yang benar-benar cocok — bukan sekadar yang tersedia.
              </p>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="background-color:#ffffff;border-radius:0 0 24px 24px;padding:28px 32px 32px;">

              <!-- Tagline -->
              <p style="margin:0 0 24px;font-size:13px;color:#666666;line-height:1.7;border-left:3px solid #5BBFB0;padding-left:12px;">
                <em>"Karena Si Kecil Layak Dapat yang Terbaik"</em>
              </p>

              <!-- Steps -->
              <p style="margin:0 0 16px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#999AAA;">Langkah pertama</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
                <tr>
                  <td width="36" valign="top" style="padding-top:2px;">
                    <div style="width:28px;height:28px;border-radius:50%;background-color:#E5F6F4;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#2C5F5A;text-align:center;line-height:28px;">1</div>
                  </td>
                  <td style="padding-left:8px;">
                    <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#5A3A7A;">Isi profil keluarga & preferensi</p>
                    <p style="margin:0;font-size:12px;color:#999AAA;line-height:1.5;">Ceritakan kebutuhan si kecil, jadwal, dan harapan Bunda untuk nanny ideal.</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
                <tr>
                  <td width="36" valign="top" style="padding-top:2px;">
                    <div style="width:28px;height:28px;border-radius:50%;background-color:#E5F6F4;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#2C5F5A;text-align:center;line-height:28px;">2</div>
                  </td>
                  <td style="padding-left:8px;">
                    <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#5A3A7A;">Mulai tes kecocokan</p>
                    <p style="margin:0;font-size:12px;color:#999AAA;line-height:1.5;">Sistem kami mencocokkan berdasarkan nilai, gaya hidup, dan kemampuan — bukan hanya pengalaman.</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td width="36" valign="top" style="padding-top:2px;">
                    <div style="width:28px;height:28px;border-radius:50%;background-color:#E5F6F4;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#2C5F5A;text-align:center;line-height:28px;">3</div>
                  </td>
                  <td style="padding-left:8px;">
                    <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#5A3A7A;">Pantau & evaluasi bersama</p>
                    <p style="margin:0;font-size:12px;color:#999AAA;line-height:1.5;">Setelah nanny bergabung, kami bantu Bunda memantau perkembangan di minggu pertama hingga bulan ke-3.</p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="https://bundayakin.com/dashboard/parent"
                       style="display:inline-block;background-color:#5BBFB0;color:#ffffff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;min-width:200px;text-align:center;">
                      Mulai Sekarang →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Trust badge -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F3EEF8;border-radius:12px;padding:16px 20px;margin-bottom:0;">
                <tr>
                  <td>
                    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#999AAA;">Mengapa BundaYakin?</p>
                    <p style="margin:0;font-size:12px;color:#5A3A7A;line-height:1.7;">
                      ✓ Asesmen psikologi berbasis riset &nbsp;·&nbsp; ✓ Didukung psikolog HCC<br/>
                      ✓ Pemantauan berkala 3 bulan &nbsp;·&nbsp; ✓ Privasi data dijaga
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
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

export function welcomeParentText(name: string): string {
  const firstName = name.split(" ")[0] ?? name
  return `Halo, Bunda ${firstName}!

Akun BundaYakin kamu sudah aktif.

Langkah pertama:
1. Isi profil keluarga & preferensi
2. Mulai tes kecocokan dengan nanny
3. Pantau & evaluasi bersama

Mulai sekarang: https://bundayakin.com/dashboard/parent

Karena Si Kecil Layak Dapat yang Terbaik.
— Tim BundaYakin`
}
