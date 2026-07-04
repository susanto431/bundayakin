# UI/UX Review & Rekomendasi Pengembangan
## BundaYakin — Audit dengan ui-ux-pro-max

> Versi 1.0 · Juli 2026 · Dokumen Internal OPDS
> Metode: audit kode aktual `apps/web/src` terhadap checklist prioritas ui-ux-pro-max (accessibility → touch → performance → style → layout). Bukan review visual browser — temuan berbasis kode, perlu verifikasi visual saat implementasi.

---

## 1. Yang Sudah Baik (pertahankan)

| Area | Bukti |
|---|---|
| Bottom navigation disiplin | Parent 4 item, Nanny 5 item — dalam batas ≤5, semua icon + label, `min-h-[56px]` (≥48dp) ✓ |
| Survey autosave | Draft `localStorage` per aspek + server sebagai source of truth saat selesai — sesuai `form-autosave` ✓ |
| Hard rule warna | Tidak ada `yellow-*`/`amber-*` di seluruh `src` — larangan brand dipatuhi ✓ |
| Identitas brand konsisten | Palet ungu/teal + DM Serif Display / Plus Jakarta Sans dipakai konsisten ✓ |
| PWA dasar | `viewport` + `themeColor` benar, install prompt, offline page, service worker ✓ |
| Ikon SVG di navigasi | Bottom nav memakai komponen ikon (bukan emoji) ✓ |

---

## 2. Temuan — Prioritas 1 (CRITICAL: Accessibility & Touch)

### 2.1 Hampir tidak ada focus state & aria-label
- `focus-visible`/`focus:ring` di komponen: **0 kemunculan**; `aria-label` hanya **7** di seluruh app.
- Dampak: navigasi keyboard dan screen reader praktis tidak terlayani; risiko juga untuk SEO/lighthouse score.
- **Rekomendasi:** definisikan focus ring global (`focus-visible:ring-2 ring-[--green] ring-offset-2`) di komponen dasar (button, input, link); tambah `aria-label` di semua tombol icon-only (notifikasi, close drawer, hapus foto).

### 2.2 Teks 12px di halaman nanny (melanggar hard rule sendiri)
- `text-xs` (12px) muncul **8×** di `dashboard/nanny/*` — CLAUDE.md §5 melarang font <16px untuk teks yang dibaca nanny di mobile.
- **Rekomendasi:** audit 8 titik itu; naikkan minimal ke `text-base` untuk konten, `text-sm` hanya untuk metadata non-esensial.

### 2.3 Emoji sebagai elemen visual struktural
- 6 file memakai emoji besar (mis. `🔍` `text-4xl` di empty state direktori, juga di TalentPoolClient, children pages, matching page).
- Emoji tidak konsisten antar-OS dan tidak bisa di-theme. **Rekomendasi:** ganti dengan ikon SVG (set yang sudah dipakai bottom nav) atau ilustrasi brand.

## 3. Temuan — Prioritas 2 (HIGH: Layout Mobile & Loading)

### 3.1 `h-screen`/`100vh` di 28 titik, `dvh` hanya 1
- Di mobile browser Indonesia (mayoritas Chrome Android + address bar dinamis), `100vh` menyebabkan konten terpotong di bawah.
- **Rekomendasi:** migrasi bertahap ke `min-h-dvh`; prioritaskan halaman survey dan auth (alur konversi).

### 3.2 Loading state minim
- Skeleton hanya di **2 file**; operasi berat (AI scoring, upload video, polling status Stream) berisiko terasa "hang".
- **Rekomendasi:** skeleton/shimmer untuk direktori nanny, hasil matching, dan halaman profil; progress eksplisit untuk scoring AI ("Menganalisis 53 jawaban…") karena berlangsung >1 detik.

### 3.3 Safe area belum kelihatan ditangani
- Bottom nav fixed tanpa indikasi `env(safe-area-inset-bottom)` — di iPhone dengan gesture bar, target sentuh bawah tertutup.
- **Rekomendasi:** `pb-[env(safe-area-inset-bottom)]` di kedua BottomNav + padding bawah konten halaman agar tidak tertutup nav.

## 4. Temuan — Prioritas 3 (MEDIUM: Konsistensi Sistem)

### 4.1 shadcn/ui tidak benar-benar dipakai
- `src/components/ui/` **kosong** — padahal CLAUDE.md dan TDD menyebut "Tailwind + shadcn/ui". Semua komponen ditulis custom.
- Konsekuensi: setiap form/dialog/dropdown baru ditulis dari nol → inkonsistensi state (hover/disabled/focus) dan biaya maintenance.
- **Rekomendasi (pilih satu, catat sebagai ADR):**
  - (a) Adopsi shadcn/ui sungguhan dan migrasi komponen dasar secara bertahap, atau
  - (b) Resmikan design system custom: ekstrak Button/Input/Card/Dialog yang ada ke `components/ui` dengan varian terdokumentasi.
  - Jangan biarkan status quo "dokumen bilang shadcn, kode bilang custom".

### 4.2 Token warna belum semantik
- Warna brand didefinisikan sebagai hex di config/CSS var, tapi pemakaian di komponen banyak yang hardcode. **Rekomendasi:** token semantik (`primary`, `surface`, `on-surface`, `danger`) di Tailwind theme supaya siap dark mode dan konsisten.

### 4.3 Notifikasi parent belum ada halamannya
- Nanny punya `dashboard/nanny/notifications`, parent hanya placeholder di settings — asimetri UX yang membingungkan (parent justru pihak yang paling butuh notifikasi evaluasi jatuh tempo).

---

## 5. Roadmap Rekomendasi (urutan pengerjaan)

| Sprint | Paket kerja | Isi |
|---|---|---|
| 1 | Aksesibilitas dasar | Focus ring global, aria-label icon-button, perbaiki 8 titik `text-xs` nanny, ganti emoji → SVG |
| 1 | Mobile viewport | `min-h-dvh` di alur survey + auth, safe-area bottom nav |
| 2 | Loading & feedback | Skeleton direktori/matching/profil, progress AI scoring, submit feedback seragam |
| 2 | Halaman notifikasi parent | Paritas dengan nanny + badge di bottom nav |
| 3 | Konsolidasi design system | Keputusan ADR shadcn vs custom, ekstrak komponen dasar, token semantik |

Definisi selesai tiap paket: lolos checklist ui-ux-pro-max §1–§3 (CRITICAL+HIGH), diuji di 375px + landscape, dan touch target ≥44pt.

---

*Lihat juga: [POC](10_proof_of_concept.md) · [Design System](../../apps/web/docs/DESIGN_SYSTEM.md) · [Feature Registry](05_feature_registry.md)*
