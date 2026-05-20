# PRD — Perbaikan Multi-Child & Placement Flow
**Versi:** 1.0  
**Tanggal:** 20 Mei 2026  
**Status:** Draft — menunggu persetujuan sebelum implementasi

---

## 1. Latar Belakang

Dua fitur besar baru saja selesai diimplementasikan:

1. **Multi-Child Management** — orang tua bisa menambah, mengedit, dan menghapus beberapa profil anak. Flow baru: Settings → `/children` (list) → `/children/[id]` (detail per anak, 3 section).
2. **Placement Flow** — orang tua mengkonfirmasi penerimaan nanny, memilih anak yang akan dirawat, membayar placement fee via Mayar (Rp 1.200.000), dan sistem otomatis membuat `NannyAssignment`, check-in, serta evaluasi terjadwal.

Code review terhadap kedua fitur ini menemukan **16 issues** yang dikelompokkan menjadi:

- **2 bug kritis** yang bisa menyebabkan kehilangan data atau payment sukses tanpa efek di sistem
- **4 bug fungsional** yang langsung memengaruhi pengalaman pengguna
- **10 masalah code quality** yang meningkatkan risiko bug di masa depan

---

## 2. Tujuan

1. **Keandalan data**: Tidak ada payment yang "lolos" tanpa menciptakan assignment.
2. **Integritas catatan anak**: Catatan nanny dan catatan orang tua tidak saling menimpa.
3. **Feedback yang jelas**: User tahu kalau aksi mereka berhasil atau gagal.
4. **Konsistensi UI**: Tidak ada label enum mentah yang muncul di tampilan user.
5. **Maintainability**: Konstanta dan mapping tidak duplikat di banyak file.

---

## 3. Scope

### Dalam scope
Semua issues yang ditemukan di code review berikut, dikelompokkan per area:

**Area A — Children Management** (`/dashboard/parent/children/`)
- A1. Silent failure saat hapus anak
- A2. Status dot "Profil" selalu hijau (misleading)
- A3. Opsi usia `≥6 thn` tidak punya representasi DB
- A4. Tidak ada error feedback saat simpan gagal di `ChildDetailClient`
- A5. `SaveButton` didefinisikan di dalam component body
- A6. Dua DB query terpisah di `children/page.tsx` bisa digabung
- A7. Mapping `AGE_GROUP_LABEL` duplikat di 3 file
- A8. Field `dateOfBirth` tidak digunakan di `ChildDetailClient`

**Area B — Placement & Assignment Flow** (`/dashboard/parent/matching/[id]/placement/` + webhook)
- B1. *(KRITIS)* Race condition webhook: transaction berhasil tapi assignment tidak dibuat
- B2. *(KRITIS)* Nanny notes menimpa catatan orang tua
- B3. Webhook catch block return 200 untuk unexpected error
- B4. Tidak ada idempotency check → invoice Mayar duplikat
- B5. `childAgeLabel` tampilkan raw enum di nanny dashboard
- B6. `PLACEMENT_FEE_IDR` terdefinisi di 2 file berbeda
- B7. `getNannyChildren` tidak ada `orderBy` di `nannyAssignments`
- B8. Checkbox T&C tidak accessible via keyboard

### Di luar scope
- Perubahan schema untuk fitur baru (mis. tabel `NannyNote` terpisah) — memerlukan migrasi DB dan sprint tersendiri
- UI redesign halaman manapun
- Penambahan fitur baru di luar perbaikan bug

---

## 4. User Stories & Dampak

### B1 — Race condition webhook (KRITIS)
**Dampak:** Orang tua sudah bayar Rp 1.200.000, payment dikonfirmasi Mayar, tapi tidak ada assignment yang terbuat. Nanny tidak mendapat notifikasi, check-in tidak terjadwal, orang tua tidak bisa memantau. Data tidak bisa di-recover secara otomatis.

> *Sebagai orang tua yang baru saja membayar placement fee, saya ingin memastikan assignment nanny langsung aktif setelah pembayaran dikonfirmasi, tanpa perlu menghubungi tim support.*

### B2 — Nanny notes menimpa catatan orang tua (KRITIS)
**Dampak:** Nanny menambahkan catatan perkembangan via dashboard. Orang tua kemudian membuka section "Aturan Rumah" di `/children/[id]` dan klik Simpan. Semua catatan nanny terhapus permanen karena form state tidak berisi catatan nanny (yang di-append setelah page load).

> *Sebagai orang tua, saya tidak ingin catatan nanny hilang ketika saya mengedit aturan rumah anak.*
>
> *Sebagai nanny, saya tidak ingin catatan pengamatan saya terhapus tanpa sepengetahuan saya.*

### A1 — Silent failure hapus anak
**Dampak:** Orang tua klik "Hapus", muncul konfirmasi, anak hilang dari list — tapi kalau request gagal, anak masih ada di DB. Saat refresh, anak muncul lagi tanpa penjelasan.

> *Sebagai orang tua, saya ingin tahu kalau penghapusan anak gagal, bukan diam-diam gagal.*

### A3 — Opsi `≥6 thn` tidak punya enum
**Dampak:** Orang tua yang punya anak berusia >6 tahun memilih "≥6 thn", tapi sistem menyimpannya sebagai `PRESCHOOL_3_6Y`. Saat edit, opsi yang aktif menjadi "3–6 thn" — tidak sesuai usia sebenarnya.

> *Sebagai orang tua dengan anak usia sekolah (>6 tahun), saya ingin data usia anak tersimpan dan ditampilkan dengan benar.*

### A4 — Tidak ada error feedback saat simpan
**Dampak:** Kalau koneksi bermasalah atau server error, user klik Simpan dan tidak ada respons — tidak tahu apakah berhasil atau gagal.

> *Sebagai orang tua yang mengisi catatan anak, saya ingin tahu kalau penyimpanan gagal agar bisa mencoba lagi.*

### B4 — Invoice Mayar duplikat
**Dampak:** User double-click tombol bayar, atau kembali ke halaman placement dan bayar lagi → dua invoice Mayar terbuat untuk satu penempatan.

> *Sebagai orang tua, saya tidak ingin tertagih dua kali untuk satu penempatan nanny.*

### B5 — Raw enum di UI nanny
**Dampak:** Nanny melihat "Aisyah (TODDLER_1_3Y)" di dashboard alih-alih "Aisyah (1–3 thn)".

> *Sebagai nanny, saya ingin melihat informasi anak dalam bahasa yang mudah dipahami, bukan kode sistem.*

---

## 5. Priority & Urutan Pengerjaan

| Priority | ID | Issue | Alasan |
|---|---|---|---|
| P0 — Harus sebelum launch | B1 | Webhook race condition | Kehilangan data payment |
| P0 — Harus sebelum launch | B2 | Nanny notes menimpa catatan orang tua | Kehilangan data pengguna |
| P1 — Sprint ini | B3 | Webhook catch return 200 | Payment tidak di-retry jika DB error |
| P1 — Sprint ini | B4 | Invoice Mayar duplikat | Risiko double charge |
| P1 — Sprint ini | A1 | Silent delete failure | UX yang menipu |
| P1 — Sprint ini | A4 | Tidak ada error feedback save | UX yang tidak jelas |
| P2 — Sprint ini (kalau sempat) | A3 | `≥6 thn` tidak punya enum | Data tidak akurat |
| P2 — Sprint ini (kalau sempat) | B5 | Raw enum di UI nanny | Tampilan tidak profesional |
| P3 — Backlog | A2, A5, A6, A7, A8 | Code quality children flow | Tidak memengaruhi user langsung |
| P3 — Backlog | B6, B7, B8 | Code quality placement flow | Tidak memengaruhi user langsung |

---

## 6. Batasan & Keputusan Desain

### Solusi B2 — Nanny notes field terpisah
Solusi *ideal* adalah tabel `NannyNote` tersendiri (childId, nannyId, content, createdAt). Tapi ini membutuhkan migrasi DB dan perubahan schema yang tidak dalam scope sprint ini.

**Solusi pragmatis yang dipilih:** Gunakan field `nannyNotes` baru di `ChildProfile` (type `String?`) — terpisah dari `additionalNotes`. Nanny hanya bisa append ke `nannyNotes`, orang tua hanya bisa edit `additionalNotes`. Keduanya ditampilkan secara terpisah di UI.

Ini membutuhkan satu Prisma migration tapi tidak mengubah relasi tabel yang ada.

### Solusi B1 — Atomicity webhook
Pindahkan `prisma.transaction.update(status: SUCCESS)` ke *dalam* `prisma.$transaction` di `handlePlacementFeeSuccess`. Kalau seluruh operasi (update transaction + create assignment + create checkins + create evaluations + create notifications) gagal, semua di-rollback. Mayar akan retry dan idempotency guard akan menangkap `matchingRequest.status === "ACCEPTED"`.

### Solusi A3 — Enum `≥6 thn`
Dua opsi:
1. Tambah enum `SCHOOL_6_PLUS` di Prisma schema — membutuhkan migrasi
2. Hapus opsi `≥6 thn` dari UI dan gunakan `PRESCHOOL_3_6Y` sebagai catch-all — tidak perlu migrasi

**Keputusan:** Opsi 2 (hapus opsi di UI) untuk sprint ini. `PRESCHOOL_3_6Y` diubah label menjadi "3 tahun ke atas". Penambahan enum proper dilakukan di sprint terpisah kalau diperlukan.

---

## 7. Success Criteria

- [ ] Payment placement berhasil → assignment, checkin, dan evaluasi selalu terbuat (tidak ada exception path)
- [ ] Nanny menambah catatan → orang tua save aturan rumah → catatan nanny tidak hilang
- [ ] DELETE anak gagal di server → user melihat pesan error, anak tidak hilang dari UI
- [ ] Save profil/perkembangan/aturan gagal → user melihat pesan error
- [ ] User double-submit placement → hanya 1 invoice Mayar yang dibuat
- [ ] Nanny dashboard menampilkan "Aisyah (1–3 thn)", bukan "Aisyah (TODDLER_1_3Y)"
- [ ] Pilihan usia di form anak konsisten dengan yang tersimpan di DB
