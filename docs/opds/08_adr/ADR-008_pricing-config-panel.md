# ADR-008 — Pricing Config Panel: Harga & Kuota Berbasis Jadwal (Effective-Dated)

**Status:** Accepted
**Tanggal:** 2026-07-05
**Decider:** Kartika (produk) — dieksekusi Claude

---

## Konteks

Semua harga (langganan, placement fee, connection add-on) dan kuota (referral, talent pool) sebelumnya di-hardcode sebagai konstanta di kode (`src/constants/pricing.ts`, angka literal di beberapa route). Mengubah harga berarti mengubah kode dan deploy ulang — tidak bisa dilakukan tim non-teknis, dan tidak ada jejak siapa/kapan/kenapa harga berubah.

Kebutuhan: panel frontend agar harga & kuota bisa diatur sendiri, dengan syarat:
1. Bisa diaudit — histori lengkap perubahan.
2. **Tidak retroaktif** — perubahan harga tidak boleh mempengaruhi pelanggan yang sedang aktif; mereka baru terkena harga baru saat memperpanjang/membayar lagi setelah tanggal berlaku (analogi kenaikan harga Google Workspace).
3. Aman — tidak boleh menambah bug baru di jalur pembayaran yang sudah berjalan.

## Opsi yang Dipertimbangkan

1. **Satu baris config "current value" per key** (tabel `AppSetting` sederhana, overwrite langsung) — mudah dibangun, tapi tidak punya cara alami untuk "jadwalkan perubahan besok" tanpa cron job terpisah, dan histori harus disimpan di tabel log terpisah (dua sumber kebenaran yang bisa tidak sinkron).
2. **Effective-dated entries, insert-only** (dipilih) — setiap perubahan adalah baris baru dengan `effectiveFrom`; nilai efektif pada waktu T = baris ter-terbaru dengan `effectiveFrom <= T`. Tabel yang sama otomatis menjadi log (tidak ada mutasi/hapus pada baris yang sudah berlaku).
3. **Integrasi feature-flag pihak ketiga** (LaunchDarkly dkk) — over-engineering untuk 5 angka konfigurasi, biaya berlangganan tambahan tidak sepadan.

## Keputusan

**Dipilih: Opsi 2 — Effective-dated entries.**

Model `PricingConfigEntry`: `key`, `value`, `effectiveFrom`, `reason` (wajib), `createdByUserId`, `cancelled`/`cancelledAt`/`cancelledByUserId`. Nilai efektif dihitung on-read (bukan disimpan sebagai "current value" terpisah), di-cache 60 detik via `unstable_cache` + tag `pricing-config`, di-revalidate setiap ada perubahan.

**Kenapa ini otomatis memberi "tidak retroaktif" tanpa logika grandfathering khusus per user:** `Transaction.amountIDR` dan `ConnectionQuota.referralLimit/talentPoolLimit` sudah didesain sebagai snapshot — nilainya dikunci permanen saat transaksi/periode dibuat, tidak pernah dihitung ulang. Mengganti config hanya memengaruhi transaksi/periode BARU yang dibuat setelah `effectiveFrom` lewat. Pelanggan aktif tidak tersentuh sampai mereka membayar lagi — persis prinsip yang diminta.

**Item yang dikonfigurasi (mengikuti yang benar-benar di-charge di kode, bukan yang dideskripsikan di marketing):** `SUBSCRIPTION_FEE_IDR`, `PLACEMENT_FEE_IDR` (flat — lihat catatan di bawah), `CONNECTION_ADDON_FEE_IDR`, `REFERRAL_QUOTA`, `TALENT_POOL_QUOTA`. Psikotes/Psikolog/Track Record belum dimasukkan karena checkout-nya belum dibangun (Tahap 2 Tumbuh Kembang) — akan ditambahkan begitu fiturnya ada, supaya tidak ada nilai config yang tidak berefek.

**Akses:** role `ADMIN` (role yang sudah ada di sistem), bukan mekanisme `canSwitchRoles` (backdoor testing). Bisa ditambah admin lain kapan saja dengan mempromosikan role user tersebut — tidak perlu tabel akses terpisah.

**Pembatalan jadwal:** hanya diizinkan selama `effectiveFrom` masih di masa depan — begitu sudah berlaku, baris menjadi riwayat permanen (mencerminkan prinsip tidak retroaktif pada level data, bukan cuma UI).

## Konsekuensi

**Positif:** perubahan harga self-service tanpa deploy; audit trail built-in (tabel = log); tidak ada risiko regresi ke transaksi yang sudah selesai (snapshot pattern sudah ada sebelumnya, hanya dimanfaatkan).

**Negatif / catatan:**
- Beberapa halaman display (dashboard, cari-nanny) punya fallback angka default sebelum `ConnectionQuota` pertama seorang user dibuat — fallback ini sekarang dinamis juga, tapi ada jendela sempit secara teori jika cache 60 detik belum ter-refresh persis saat admin baru saja mengubah nilai.
- **Ditemukan saat implementasi (bukan bug baru dari fitur ini):** halaman `/pricing` publik menampilkan dua tingkat placement fee (Jangka Panjang Rp 1,2jt vs Temporer Rp 600rb), tapi kode pembayaran (`api/payment/placement`) hanya pernah mengenakan **satu** biaya flat. `PLACEMENT_FEE_IDR` di panel ini hanya mengontrol angka yang benar-benar di-charge (Rp 1,2jt); angka "Rp 600.000" di halaman pricing tetap statis karena tidak berkorespondensi dengan logika pembayaran nyata. Perlu keputusan produk terpisah: implementasikan pembedaan harga berdasar `nannyType`, atau perbarui salinan marketing.
