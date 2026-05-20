# SRS — Perbaikan Multi-Child & Placement Flow
**Versi:** 1.0  
**Tanggal:** 20 Mei 2026  
**Referensi PRD:** `PRD_children_placement_fixes.md`  
**Status:** Draft

---

## 1. Gambaran Teknis

Dokumen ini mendeskripsikan spesifikasi teknis untuk setiap perbaikan yang telah diidentifikasi di code review. Setiap item mencantumkan: root cause, file yang diubah, perubahan yang diperlukan, dan acceptance criteria.

---

## 2. P0 — Harus Sebelum Launch

---

### B1. Race condition webhook: assignment tidak dibuat jika `handlePlacementFeeSuccess` gagal

**Root cause:**  
Di `webhook/route.ts`, `prisma.transaction.update({ status: "SUCCESS" })` dipanggil *sebelum* `handlePlacementFeeSuccess`. Keduanya tidak dalam satu DB transaction. Kalau `handlePlacementFeeSuccess` throw (mis. constraint violation, DB timeout), transaction sudah terlanjur `SUCCESS`. Idempotency guard mengecek `transaction.status === "SUCCESS"` → Mayar retry di-skip → assignment tidak pernah terbuat.

**File yang diubah:**
- `apps/web/src/app/api/payment/webhook/route.ts`

**Perubahan yang diperlukan:**

1. Hapus `prisma.transaction.update({ status: "SUCCESS" })` dari blok utama webhook.
2. Pindahkan update tersebut ke *dalam* `prisma.$transaction` di `handlePlacementFeeSuccess`, sebagai operasi pertama.
3. Idempotency guard diubah: alih-alih cek `transaction.status === "SUCCESS"`, cek `matchingRequest.status === "ACCEPTED"` (sudah ada di fungsi tersebut di baris 162–165).
4. Untuk tipe SUBSCRIPTION, pola yang sama diterapkan: update transaction ke SUCCESS dan update subscription dalam satu `prisma.$transaction`.

**Struktur setelah perubahan (pseudocode):**
```
webhook handler:
  if isMayarPaymentSuccess(status):
    if transaction.type === "PLACEMENT_FEE":
      await handlePlacementFeeSuccess(transaction, paidAt)
      // handlePlacementFeeSuccess sekarang bertanggung jawab update transaction juga
    else if transaction.type === "SUBSCRIPTION":
      await handleSubscriptionSuccess(transaction, paidAt)
      // sama, atomic
```

**Acceptance criteria:**
- [ ] Jika `prisma.nannyAssignment.create` throw, seluruh DB transaction rollback dan `transaction.status` tetap `PENDING`
- [ ] Mayar retry → webhook kembali diproses → assignment berhasil dibuat
- [ ] Jika assignment sudah ada (matchingRequest.status === ACCEPTED), webhook return 200 tanpa re-process
- [ ] Log `[WEBHOOK_PLACEMENT] Assignment created` hanya muncul setelah semua operasi berhasil

---

### B2. Nanny notes menimpa catatan orang tua

**Root cause:**  
Field `additionalNotes` dipakai untuk dua hal: (1) "Aturan rumah lainnya" yang ditulis orang tua, dan (2) catatan pengamatan nanny yang di-append via `/api/nanny/child-notes`. Ketika orang tua membuka `ChildDetailClient`, state `additionalNotes` diisi dari data saat page load. Setelah nanny menambahkan catatan, state orang tua tidak ter-refresh. Kalau orang tua klik Simpan, PATCH dikirim dengan state lama → catatan nanny hilang.

**File yang diubah:**
- `apps/web/prisma/schema.prisma` — tambah field `nannyNotes`
- `apps/web/src/app/api/nanny/child-notes/route.ts` — tulis ke `nannyNotes`, bukan `additionalNotes`
- `apps/web/src/app/dashboard/parent/children/[id]/ChildDetailClient.tsx` — tampilkan `nannyNotes` sebagai read-only
- `apps/web/src/app/dashboard/parent/children/[id]/page.tsx` — tambah `nannyNotes` ke select
- `apps/web/src/app/dashboard/nanny/children/page.tsx` — tambah `nannyNotes` ke tampilan
- `apps/web/src/lib/queries/nanny.ts` — tambah `nannyNotes` ke select `getNannyChildren`

**Perubahan yang diperlukan:**

1. **Schema:** Tambah field `nannyNotes String?` ke model `ChildProfile`. Jalankan `prisma db push`.
2. **API nanny:** Tulis ke `nannyNotes` (bukan `additionalNotes`). Format tetap: `[Catatan nanny · {tanggal}]: {isi}\n\n{existing}`.
3. **ChildDetailClient:** Tambah section read-only "Catatan dari nanny" di bawah Section 3. Tampilkan `nannyNotes` sebagai teks non-editable. Orang tua tidak bisa edit, hanya baca. Jika kosong, section tidak ditampilkan.
4. **`ChildDetailClient` PATCH handler:** Pastikan `nannyNotes` tidak dikirim dalam body PATCH dari orang tua (field ini tidak ada di form orang tua).
5. **API PATCH `/api/parent/children/[id]`:** Pastikan `nannyNotes` tidak di-update oleh orang tua (tidak ada di destructured body).
6. **Nanny children page & query:** Tambah `nannyNotes` ke select agar nanny bisa lihat catatan mereka sendiri.

**Acceptance criteria:**
- [ ] Nanny menambah catatan → tersimpan di `nannyNotes`
- [ ] Orang tua buka `/children/[id]`, edit section Aturan Rumah, klik Simpan → `nannyNotes` tidak berubah di DB
- [ ] `nannyNotes` tidak masuk ke body PATCH yang dikirim dari `ChildDetailClient`
- [ ] Section "Catatan dari nanny" tampil di bawah Section 3 kalau `nannyNotes` tidak kosong
- [ ] Nanny masih bisa melihat catatan mereka di `/dashboard/nanny/children`

---

## 3. P1 — Sprint Ini

---

### B3. Webhook catch block return 200 untuk unexpected error

**Root cause:**  
Catch block di webhook return `NextResponse.json({ success: false })` tanpa `status: 500`. Mayar melihat HTTP 200 dan tidak retry. Kalau DB down saat webhook diterima, event hilang permanen.

**File yang diubah:**
- `apps/web/src/app/api/payment/webhook/route.ts`

**Perubahan yang diperlukan:**
- Catch block return `NextResponse.json({ success: false, error: "Internal error" }, { status: 500 })`
- Komentar "Selalu return 200" di baris 120 diubah menjadi lebih spesifik: "Selalu return 200 untuk event yang sudah ter-handle. Error tak terduga return 500 agar Mayar retry."

**Acceptance criteria:**
- [ ] DB timeout saat proses webhook → response HTTP 500
- [ ] Event "testing" dari Mayar → tetap return 200
- [ ] Transaction tidak ditemukan (invoiceId tidak dikenal) → tetap return 200 (bukan error)
- [ ] Payment gagal yang valid (isMayarPaymentFailed) → return 200

---

### B4. Invoice Mayar duplikat bisa dibuat

**Root cause:**  
`POST /api/payment/placement` tidak mengecek apakah sudah ada transaction PENDING untuk `matchingRequestId` yang sama. Double-submit atau back-and-resubmit menghasilkan dua invoice Mayar.

**File yang diubah:**
- `apps/web/src/app/api/payment/placement/route.ts`

**Perubahan yang diperlukan:**

Sebelum memanggil `createMayarInvoice`, tambahkan pengecekan:

```ts
const existingTransaction = await prisma.transaction.findFirst({
  where: {
    parentProfileId: parentProfile.id,
    type: "PLACEMENT_FEE",
    status: "PENDING",
    metadata: { path: ["matchingRequestId"], equals: body.matchingRequestId },
    expiredAt: { gt: new Date() },
  },
  select: { mayarPaymentUrl: true },
})

if (existingTransaction?.mayarPaymentUrl) {
  return NextResponse.json({ success: true, data: { paymentUrl: existingTransaction.mayarPaymentUrl } })
}
```

**Catatan implementasi:** Prisma mendukung JSON path filter (`metadata: { path: [...], equals: ... }`) untuk field `Json?`. Pastikan filter ini didukung oleh PostgreSQL version yang dipakai di Neon.

**Acceptance criteria:**
- [ ] User submit form placement pertama kali → invoice Mayar baru dibuat
- [ ] User submit form yang sama kedua kali dalam 24 jam → `paymentUrl` lama dikembalikan, tidak ada invoice baru
- [ ] Transaction sudah expired → invoice baru dibuat (expiredAt check)
- [ ] Transaction sudah SUCCESS/FAILED → bukan PENDING → invoice baru dibuat

---

### A1. Silent failure saat hapus anak

**Root cause:**  
`handleDelete` di `ChildrenListClient` memanggil `setChildren(prev => prev.filter(...))` tanpa mengecek apakah response dari `DELETE /api/parent/children/[id]` sukses.

**File yang diubah:**
- `apps/web/src/app/dashboard/parent/children/ChildrenListClient.tsx`

**Perubahan yang diperlukan:**

```ts
async function handleDelete(id: string, childName: string) {
  if (!confirm(`Hapus profil ${childName}? Tindakan ini tidak bisa dibatalkan.`)) return
  setDeletingId(id)
  try {
    const res = await fetch(`/api/parent/children/${id}`, { method: "DELETE" })
    const data = await res.json() as { success: boolean; error?: string }
    if (data.success) {
      setChildren(prev => prev.filter(c => c.id !== id))
    } else {
      setError(data.error ?? "Gagal menghapus. Coba lagi.")
    }
  } catch {
    setError("Koneksi bermasalah. Coba lagi.")
  } finally {
    setDeletingId(null)
  }
}
```

Tambahkan state `error` yang sudah ada ke area yang terlihat user (sudah ada `error` state di komponen ini untuk form add).

**Acceptance criteria:**
- [ ] DELETE berhasil (200) → anak hilang dari list
- [ ] DELETE gagal (500/network error) → anak tetap di list, muncul pesan error
- [ ] Error message hilang setelah 3 detik atau saat user interaksi berikutnya

---

### A4. Tidak ada error feedback saat simpan gagal di ChildDetailClient

**Root cause:**  
`handleSaveProfil`, `handleSaveDev`, `handleSaveRules` hanya set `savedX = true` kalau `result.success === true`. Kalau `result.success === false`, tidak ada state yang di-update → user tidak melihat respons apapun.

**File yang diubah:**
- `apps/web/src/app/dashboard/parent/children/[id]/ChildDetailClient.tsx`

**Perubahan yang diperlukan:**

1. Tambah state error per section:
   ```ts
   const [errorProfil, setErrorProfil] = useState<string | null>(null)
   const [errorDev, setErrorDev] = useState<string | null>(null)
   const [errorRules, setErrorRules] = useState<string | null>(null)
   ```

2. Di setiap handler, set error kalau gagal:
   ```ts
   if (result.success) {
     setSavedX(true)
     setTimeout(() => setSavedX(false), 2500)
   } else {
     setErrorX(result.error ?? "Gagal menyimpan. Coba lagi.")
   }
   ```

3. Tampilkan error di atas `SaveButton` masing-masing section:
   ```tsx
   {errorProfil && <p className="text-[12px] text-red-600">{errorProfil}</p>}
   <SaveButton saving={savingProfil} saved={savedProfil} />
   ```

4. Reset error saat user mulai mengedit field di section yang bersangkutan.

**Acceptance criteria:**
- [ ] API return `{ success: false }` → muncul pesan error di bawah section yang gagal
- [ ] API return `{ success: true }` → muncul "Tersimpan ✓", tidak ada error
- [ ] Setelah error, user edit field dan submit ulang → error lama hilang sebelum request baru selesai

---

## 4. P2 — Sprint Ini (Kalau Sempat)

---

### A3. Opsi `≥6 thn` tidak punya representasi DB yang akurat

**Root cause:**  
`AGE_OPTIONS` di `ChildrenListClient` dan `ChildDetailClient` mencantumkan `{ label: "≥6 thn", months: 90 }`. `deriveAgeGroup(dob)` tidak punya case untuk ≥6 tahun — fallthrough ke `PRESCHOOL_3_6Y`. Anak usia 7 tahun tersimpan sebagai `PRESCHOOL_3_6Y` dan ditampilkan sebagai "3–6 thn" saat edit.

**Keputusan desain (dari PRD):** Hapus opsi `≥6 thn`, ubah label `PRESCHOOL_3_6Y` menjadi "3 thn ke atas".

**File yang diubah:**
- `apps/web/src/app/dashboard/parent/children/ChildrenListClient.tsx`
- `apps/web/src/app/dashboard/parent/children/[id]/ChildDetailClient.tsx`
- `apps/web/src/app/dashboard/parent/matching/[id]/placement/PlacementClient.tsx`
- `apps/web/src/app/dashboard/nanny/children/page.tsx`

**Perubahan yang diperlukan:**

1. Di semua `AGE_OPTIONS`: hapus entry `{ label: "≥6 thn", months: 90 }`.
2. Di semua `AGE_GROUP_LABEL` / `AGE_GROUP_SHORT` / `AGE_GROUP_TO_LABEL`: ubah `PRESCHOOL_3_6Y: "3–6 thn"` → `PRESCHOOL_3_6Y: "3 thn ke atas"`.
3. Di `settings/page.tsx`, ternary chain terakhir juga menggunakan label yang sama.

**Acceptance criteria:**
- [ ] Form tambah anak tidak menampilkan opsi "≥6 thn"
- [ ] Anak yang sebelumnya disimpan sebagai `PRESCHOOL_3_6Y` ditampilkan sebagai "3 thn ke atas"
- [ ] Tidak ada label "3–6 thn" yang tersisa di codebase (kecuali kalau ditambahkan enum baru di masa depan)

---

### B5. `childAgeLabel` tampilkan raw enum di nanny dashboard

**Root cause:**  
Di `nanny/page.tsx` baris 77:
```ts
const childAgeLabel = children.length === 1 && firstChild?.ageGroup
  ? ` (${firstChild.ageGroup})`  // TODDLER_1_3Y langsung dipakai
  : ""
```

**File yang diubah:**
- `apps/web/src/app/dashboard/nanny/page.tsx`

**Perubahan yang diperlukan:**

Definisikan mapping lokal atau import dari konstanta bersama (lihat A7):
```ts
const AGE_GROUP_SHORT: Record<string, string> = {
  INFANT_0_6M: "0–6 bln",
  INFANT_6_12M: "6–12 bln",
  TODDLER_1_3Y: "1–3 thn",
  PRESCHOOL_3_6Y: "3 thn ke atas",
}

const childAgeLabel = children.length === 1 && firstChild?.ageGroup
  ? ` (${AGE_GROUP_SHORT[firstChild.ageGroup] ?? firstChild.ageGroup})`
  : ""
```

**Acceptance criteria:**
- [ ] Nanny dashboard menampilkan "Aisyah (1–3 thn)", bukan "Aisyah (TODDLER_1_3Y)"
- [ ] Kalau ageGroup tidak dikenal, fallback ke string asli (bukan crash)

---

## 5. P3 — Backlog (Code Quality)

Issues berikut tidak memengaruhi user secara langsung tapi meningkatkan risiko bug dan menghambat maintenance. Dikerjakan di sprint berikutnya atau saat ada sprint refactor.

---

### A2. Status dot "Profil" selalu hijau

**File:** `ChildrenListClient.tsx:127`  
**Fix:** Ganti `!!child.name` dengan `!!(child.allergies || child.medicalNotes || child.pantangan)` — atau tentukan definisi "profil lengkap" yang lebih bermakna sebelum implementasi.  
**Blocker:** Perlu keputusan produk: field apa yang mendefinisikan "profil lengkap"?

---

### A5. `SaveButton` didefinisikan di dalam component body

**File:** `ChildDetailClient.tsx:136`  
**Fix:** Pindahkan `const SaveButton = ...` ke luar fungsi `ChildDetailClient`, atau jadikan function call biasa (bukan komponen).

---

### A6. Dua DB query terpisah di `children/page.tsx`

**File:** `children/page.tsx`  
**Fix:** Gabungkan `getParentSubscription` dan query `prisma.parentProfile.findUnique` menjadi satu query dengan `include: { subscription: ..., children: ... }`.

---

### A7. Mapping `AGE_GROUP_LABEL` duplikat di 3 tempat

**Files:** `ChildrenListClient.tsx`, `ChildDetailClient.tsx`, `settings/page.tsx`  
**Fix:** Buat `apps/web/src/constants/children.ts` dengan:
```ts
export const AGE_GROUP_LABEL: Record<string, string> = {
  INFANT_0_6M: "0–6 bln",
  INFANT_6_12M: "6–12 bln",
  TODDLER_1_3Y: "1–3 thn",
  PRESCHOOL_3_6Y: "3 thn ke atas",
}
export const AGE_OPTIONS = [...]
```
Import dari sini di semua file yang relevan.

---

### A8. Field `dateOfBirth` tidak digunakan di `ChildDetailClient`

**File:** `ChildDetailClient.tsx`, `[id]/page.tsx`  
**Fix:** Hapus `dateOfBirth` dari tipe `Child` dan dari `select` di server component, kecuali kalau akan digunakan di masa depan.

---

### B6. `PLACEMENT_FEE_IDR` didefinisikan di 2 file

**Files:** `placement/page.tsx:8`, `api/payment/placement/route.ts:6`  
**Fix:** Pindahkan ke `src/constants/pricing.ts`:
```ts
export const PLACEMENT_FEE_IDR = 1_200_000
```
Import di kedua file.

---

### B7. `getNannyChildren` tidak ada `orderBy` di `nannyAssignments`

**File:** `lib/queries/nanny.ts:225`  
**Fix:** Tambahkan `orderBy: { startDate: "desc" }` di dalam `nannyAssignments` query di `getNannyChildren`, konsisten dengan `getNannyDashboard`.

---

### B8. Checkbox T&C tidak accessible via keyboard

**File:** `PlacementClient.tsx:217-232`  
**Fix:** Ganti visual checkbox `<div onClick>` dengan pattern:
```tsx
<label className="flex items-start gap-2.5 cursor-pointer mb-4">
  <input
    type="checkbox"
    checked={agreed}
    onChange={e => setAgreed(e.target.checked)}
    className="sr-only"
  />
  {/* visual indicator tetap sama, gunakan `agreed` untuk styling */}
  ...
</label>
```

---

## 6. Urutan Implementasi yang Disarankan

```
Sprint saat ini:
1. B2 — schema migration (nannyNotes field) + update API nanny + update ChildDetailClient
2. B1 — refactor webhook atomic transaction (bergantung pada B2 selesai karena menyentuh file yang sama)
3. B3 — webhook catch return 500 (1 baris, lakukan bersamaan dengan B1)
4. B4 — idempotency check placement API
5. A1 — fix handleDelete
6. A4 — error feedback ChildDetailClient
7. A3 + B5 — konsistensi label usia (bisa 1 PR karena menyentuh mapping yang sama)

Sprint berikutnya (P3):
8. A7 — buat constants/children.ts, refactor semua import
9. A5, A6, A8, B6, B7, B8 — cleanup sisanya
```

---

## 7. Testing Plan

### Manual testing checklist setelah implementasi P0+P1:

**Placement flow:**
- [ ] Orang tua submit placement → invoice Mayar terbuat → webhook diterima → `NannyAssignment` + 2 checkin + 2 evaluasi + 2 notifikasi terbuat dalam satu DB transaction
- [ ] Simulasi gagal: matikan DB setelah webhook diterima → transaction tetap PENDING, Mayar retry → berhasil di percobaan kedua
- [ ] Double-submit placement dalam 24 jam → 1 invoice saja di DB
- [ ] Webhook test ping dari Mayar dashboard → return 200, tidak ada side effect

**Children management:**
- [ ] Hapus anak → berhasil → hilang dari list
- [ ] Simulasi network error saat hapus → anak tetap di list, muncul error
- [ ] Nanny tambah catatan → orang tua simpan Aturan Rumah → buka DB, `nannyNotes` tidak berubah
- [ ] Simpan profil anak dengan server error → muncul pesan error di bawah section

**Nanny dashboard:**
- [ ] Nanny aktif bekerja → child name ditampilkan dengan label usia dalam Bahasa Indonesia
