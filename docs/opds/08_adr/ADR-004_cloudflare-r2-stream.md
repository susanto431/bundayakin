# ADR-004 — Cloudflare R2 + Stream untuk Media Storage

**Status:** Accepted  
**Tanggal:** Mei 2026  
**Decider:** Developer

---

## Konteks

BundaYakin membutuhkan storage untuk:

**Foto:**
- Foto profil orang tua dan nanny
- Foto portfolio nanny (masakan, keahlian)
- Foto portfolio pengalaman kerja
- Foto profil anak

**Video:**
- Video perkenalan nanny (max 3 menit)
- Video keahlian nanny (max 3 menit)

**PDF:**
- Laporan matching (NannyCare Profile™)
- Laporan evaluasi berkala

Kebutuhan spesifik:
- **Biaya egress rendah** — file akan diakses sering oleh user
- **Upload langsung dari browser** (bukan via server) untuk performa
- **Video CDN** — video harus di-stream, bukan di-download langsung
- **Signed URLs** untuk akses terkontrol ke file sensitif (laporan PDF)

---

## Opsi yang Dipertimbangkan

**Untuk foto & PDF:**
1. **Cloudflare R2** — S3-compatible, egress gratis ke Cloudflare network
2. **AWS S3** — mature, biaya egress mahal di luar AWS
3. **Google Cloud Storage** — solid, biaya egress lumayan
4. **Supabase Storage** — bundled dengan Supabase, tidak digunakan
5. **Vercel Blob** — terintegrasi dengan Vercel, masih early access

**Untuk video:**
1. **Cloudflare Stream** — video CDN + transcoding + adaptive bitrate
2. **AWS CloudFront + S3** — DIY video hosting, kompleks
3. **Mux** — video platform matang, lebih mahal
4. **YouTube unlisted** — tidak kontrol, privasi tidak terjamin
5. **Self-host di R2** — tidak ada transcoding, tidak optimal untuk video

---

## Keputusan

**Dipilih: Cloudflare R2 (foto + PDF) + Cloudflare Stream (video)**

Alasan R2:
- **Egress gratis** ke Cloudflare CDN — tidak ada biaya bandwidth untuk file yang diakses user
- **S3-compatible API** — sama dengan AWS S3, mudah diimplementasikan
- **Presigned URLs** — upload langsung dari browser tanpa melalui server (performa lebih baik)
- **Satu vendor dengan Stream** — billing dan management terpusat di Cloudflare

Alasan Stream:
- **Transcoding otomatis** — upload video → Cloudflare transcode ke multiple bitrate
- **Adaptive bitrate streaming** — kualitas video otomatis menyesuaikan koneksi user
- **CDN global** — video di-serve dari edge terdekat
- **Stream UID** — setiap video punya UID unik, mudah di-manage

Kenapa tidak AWS S3 + CloudFront:
- Egress S3 ke internet sangat mahal untuk video dan foto yang sering diakses
- Setup lebih kompleks (S3 + CloudFront + Lambda@Edge untuk signing)

---

## Konsekuensi

**Positif:**
- Biaya bandwidth sangat rendah (egress R2 ke Cloudflare network gratis)
- Upload dari browser langsung ke R2 → tidak membebani server
- Cloudflare Stream handle video transcoding otomatis
- Satu dashboard untuk semua media

**Negatif / Trade-off:**
- Cloudflare vendor lock-in — migrasi ke provider lain butuh effort
- R2 presigned URL punya TTL terbatas — harus generate ulang untuk akses berulang
- Cloudflare Stream punya kuota storage — perlu monitor `storageMB` per nanny
- Video processing setelah upload tidak instan — perlu polling status atau webhook

**Batas yang perlu dimonitor:**
- Video max 3 menit (180 detik) — dikonfirmasi saat upload di server
- Storage R2 dikontrol per file, belum ada global quota enforcement per user
- Cloudflare Stream: biaya per menit video stored

**Struktur key R2:**
```
nanny/{nannyId}/avatar/           ← foto profil
nanny/{nannyId}/media/{mediaId}/  ← foto portfolio
reports/{userId}/{reportId}.pdf   ← laporan PDF
```

---

## Catatan

- Integrasi ada di `apps/web/src/lib/cloudflare.ts`
- Upload flow foto: presigned PUT URL → client upload → confirm ke API → simpan `storageKey`
- Upload flow video: CF Stream direct creator URL → client upload → polling `readyToStream`
- Video UID disimpan di `NannyMedia.storageKey` untuk video, R2 key untuk foto
- Laporan PDF di-upload oleh server (bukan client) setelah digenerate pdf-service
- Signed URL untuk akses file private (laporan PDF): generate on-demand, TTL pendek
