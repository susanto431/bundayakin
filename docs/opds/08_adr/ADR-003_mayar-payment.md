# ADR-003 — Mayar sebagai Payment Gateway

**Status:** Accepted  
**Tanggal:** Mei 2026  
**Diperbarui:** 20 Mei 2026  
**Decider:** Apin (bisnis) + Developer (teknis)

---

## Konteks

BundaYakin membutuhkan payment gateway untuk menerima pembayaran:
- Langganan orang tua (Rp 500rb/tahun)
- Placement fee (Rp 600rb / Rp 1.2jt)
- Add-on psikotes, psikolog, track record
- Connection add-on (Rp 100rb)

Kebutuhan spesifik:
- **Model invoice** — bukan recurring subscription otomatis (orang tua bayar manual per tahun)
- **Metode pembayaran Indonesia** — transfer bank, QRIS, e-wallet
- **Webhook** — konfirmasi pembayaran otomatis ke sistem
- **Tidak butuh PKP** — BundaYakin tidak pungut PPN, invoice all-in
- **Mudah dioperasikan** oleh tim kecil tanpa engineer payment khusus

---

## Opsi yang Dipertimbangkan

1. **Mayar** — platform invoice Indonesia, fokus content creator & freelancer
2. **Midtrans** — payment gateway established, dipakai banyak startup Indonesia
3. **Xendit** — API-first, lebih developer-friendly, lebih mahal
4. **Stripe** — international, tidak support metode pembayaran lokal Indonesia dengan baik
5. **Manual transfer** — tidak ada otomasi, tidak scalable

---

## Keputusan

**Dipilih: Mayar**

Alasan:
- **Model invoice yang cocok** — Mayar dirancang untuk invoice satu kali (bukan recurring hanya), pas untuk model BundaYakin
- **Harga kompetitif** — biaya per transaksi lebih rendah dari Midtrans untuk use case invoice sederhana
- **Metode pembayaran lokal** — QRIS, transfer bank, e-wallet Indonesia
- **Webhook tersedia** — konfirmasi pembayaran otomatis via webhook dengan signature verification
- **Tidak butuh MDR tinggi** — sesuai dengan volume transaksi awal BundaYakin yang masih kecil

Kenapa bukan Midtrans:
- Midtrans lebih cocok untuk e-commerce dengan volume transaksi tinggi dan integrasi toko online
- Setup lebih kompleks untuk use case invoice sederhana
- Biaya per transaksi lebih tinggi untuk invoice manual

---

## Konsekuensi

**Positif:**
- Integrasi relatif sederhana — buat invoice → redirect URL → webhook konfirmasi
- QRIS tersedia → penetrasi tinggi di Indonesia
- Invoice bisa dikirim via link tanpa user harus punya akun Mayar

**Negatif / Trade-off:**
- Mayar masih platform yang relatif baru dibanding Midtrans — ekosistem lebih kecil
- ~~Verifikasi akun Mayar belum selesai~~ — **sudah selesai per 20 Mei 2026, production sudah aktif**
- Tidak ada recurring billing otomatis — orang tua harus bayar ulang manual setiap tahun
- Jika Mayar bermasalah (downtime, policy change), perlu migrasi ke alternatif

**Risiko yang perlu dimonitor:**
- Mayar platform risk — tidak sepopuler Midtrans, perlu monitor keberlanjutan layanan
- Webhook reliability — pastikan semua webhook diproses dan ada retry mechanism
- Webhook reliability — pastikan semua webhook diproses dan ada retry mechanism

**Mitigasi:**
- Siapkan abstraksi di `lib/mayar.ts` sehingga mudah diganti gateway lain jika dibutuhkan
- Semua transaksi di-log ke `Transaction` table untuk audit trail yang independen dari Mayar

---

## Catatan

- Integrasi ada di `apps/web/src/lib/mayar.ts`
- Webhook handler ada di `apps/web/src/app/api/webhooks/mayar/route.ts`
- **Akun Mayar sudah terverifikasi (20 Mei 2026)** — payment production sudah bisa berjalan
- Integrasi production sudah diimplementasikan dan berjalan dengan baik
- Model data transaksi tidak coupling dengan Mayar — `Transaction` table menyimpan state sendiri yang diupdate via webhook
