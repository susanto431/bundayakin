# BundaYakin Design System
**Human Care Consulting · v2.1 · Mei 2026**

> Panduan visual lengkap untuk platform kecocokan, pemantauan, dan pengasuhan nanny. Dibangun di atas kepercayaan, kehangatan, dan psikologi.

---

## Daftar Isi

1. [Brand Identity](#1-brand-identity)
2. [Colors](#2-colors)
3. [Typography](#3-typography)
4. [Spacing & Radius](#4-spacing--radius)
5. [Illustrations & Icons](#5-illustrations--icons)
6. [Buttons](#6-buttons)
7. [Form Elements](#7-form-elements)
8. [Badges & Tags](#8-badges--tags)
9. [Alerts & Toasts](#9-alerts--toasts)
10. [Cards](#10-cards)
11. [Matching Flow Pattern](#11-matching-flow-pattern)
12. [Nanny Card Pattern](#12-nanny-card-pattern)
13. [Verdict & Report Pattern](#13-verdict--report-pattern)
14. [Dashboard Stats](#14-dashboard-stats)
15. [Mobile Screens](#15-mobile-screens)
16. [Rules & Prohibitions](#16-rules--prohibitions)

---

## 1. Brand Identity

| Elemen | Detail |
|---|---|
| **Brand Name** | BundaYakin |
| **Tagline** | Online Nanny Assessment |
| **Sub-brand** | *"Karena Si Kecil Layak Dapat yang Terbaik"* |
| **Warna Logo** | Purple `#A97CC4` + Teal `#5BBFB0` |
| **Platform** | Web (Next.js) + Mobile PWA |
| **Target User** | Orang tua (SES B/B+, anak 0–7 th) & Nanny |

### Stack Teknis
- **Framework**: Next.js + Tailwind CSS
- **DB**: Prisma + Neon PostgreSQL
- **Deploy**: Railway
- **Font**: Google Fonts (Plus Jakarta Sans + DM Serif Display)

---

## 2. Colors

### 2.1 Palet Utama — Teal

| Token | Hex | Penggunaan |
|---|---|---|
| `--green` | `#5BBFB0` | Button primary, icon, link, progress bar |
| `--green-dark` | `#2C5F5A` | Hover state, teks kuat di atas teal |
| `--green-deeper` | `#1E4A45` | Header gelap, verdict background |
| `--green-mid` | `#A8DDD8` | Border, accent, chip |
| `--green-light` | `#E5F6F4` | Card background, badge fill |

### 2.2 Palet Sekunder — Purple (Brand)

| Token | Hex | Penggunaan |
|---|---|---|
| `--purple` | `#A97CC4` | Logo sekunder, UI element brand |
| `--purple-dark` | `#5A3A7A` | Sidebar, heading gelap, verdict box |
| `--purple-mid` | `#E0D0F0` | Border card, divider |
| `--purple-light` | `#F3EEF8` | Page background, card bg utama |

### 2.3 Aksen & Semantic

| Token | Hex | Penggunaan |
|---|---|---|
| `--yellow` | `#F9C74F` | Aksen dekoratif kecil (bintik, ornamen) |
| `--orange` | `#E07B39` | CTA button, peringatan agency, energi |
| `--orange-light` | `#FEF0E7` | Alert background warn |
| `--red` | `#C75D5D` | Error, critical, dealbreaker |
| `--red-light` | `#FAEAEA` | Alert background error |
| `--blue` | `#5B7EC9` | Status estimasi/partial/proses |
| `--blue-light` | `#EEF2FC` | Alert background info |

### 2.4 Neutral

| Token | Hex | Penggunaan |
|---|---|---|
| `--ink` | `#5A3A7A` | Teks heading primary (purple deep) |
| `--ink2` | `#666666` | Teks body secondary |
| `--ink3` | `#999AAA` | Placeholder, hint, caption |
| `--bg` | `#FDFBFF` | Page background |
| `--bg2` | `#F3EEF8` | Background section, input idle |
| `--surface` | `#FFFFFF` | Card surface, input background |
| `--border` | `#E0D0F0` | Default border, divider |
| `--border2` | `#C8B8DC` | Border hover, input focus hint |

### 2.5 CSS Variables (Tailwind config / globals.css)

```css
:root {
  --green:        #5BBFB0;
  --green-dark:   #2C5F5A;
  --green-deeper: #1E4A45;
  --green-mid:    #A8DDD8;
  --green-light:  #E5F6F4;
  --purple:       #A97CC4;
  --purple-dark:  #5A3A7A;
  --purple-mid:   #E0D0F0;
  --purple-light: #F3EEF8;
  --yellow:       #F9C74F;
  --orange:       #E07B39;
  --orange-light: #FEF0E7;
  --red:          #C75D5D;
  --red-light:    #FAEAEA;
  --blue:         #5B7EC9;
  --blue-light:   #EEF2FC;
  --ink:          #5A3A7A;
  --ink2:         #666666;
  --ink3:         #999AAA;
  --bg:           #FDFBFF;
  --bg2:          #F3EEF8;
  --surface:      #FFFFFF;
  --border:       #E0D0F0;
  --border2:      #C8B8DC;
}
```

### 2.6 Tailwind Color Mapping

```js
// tailwind.config.js
colors: {
  teal: {
    DEFAULT: '#5BBFB0',
    dark:    '#2C5F5A',
    deeper:  '#1E4A45',
    mid:     '#A8DDD8',
    light:   '#E5F6F4',
  },
  purple: {
    DEFAULT: '#A97CC4',
    dark:    '#5A3A7A',
    mid:     '#E0D0F0',
    light:   '#F3EEF8',
  },
  yellow:  '#F9C74F',
  orange:  '#E07B39',
  ink:     '#5A3A7A',
  ink2:    '#666666',
  ink3:    '#999AAA',
  surface: '#FFFFFF',
  bg:      '#FDFBFF',
}
```

---

## 3. Typography

### 3.1 Typeface

| Font | Source | Dipakai untuk |
|---|---|---|
| **DM Serif Display** | Google Fonts | Display, hero title, verdict, laporan |
| **Plus Jakarta Sans** | Google Fonts | Semua teks UI, body, label, button |

```html
<!-- Di _document.tsx atau layout.tsx -->
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet">
```

### 3.2 Type Scale

| Nama | Font | Size | Weight | Line-height | Dipakai untuk |
|---|---|---|---|---|---|
| **Display** | DM Serif Display | 38–42px | 400 | 1.1 | Hero, verdict header, landing page |
| **H1** | Plus Jakarta Sans | 26–28px | 700 | 1.2 | Page title, dashboard header |
| **H2** | Plus Jakarta Sans | 20–22px | 700 | 1.25 | Section title, card title besar |
| **H3** | Plus Jakarta Sans | 16–17px | 700 | 1.3 | Card title, subsection |
| **Body Large** | Plus Jakarta Sans | 16px | 400 | 1.7 | Konten utama mobile (wajib ≥16px) |
| **Body** | Plus Jakarta Sans | 15px | 400 | 1.6 | Teks penjelasan desktop |
| **Body Small** | Plus Jakarta Sans | 13–13.5px | 400 | 1.6 | Narasi laporan, metadata card |
| **Caption** | Plus Jakarta Sans | 11.5–12px | 400 | 1.5 | Hint, timestamp, footnote |
| **Label / Eyebrow** | Plus Jakarta Sans | 9–10px | 700 | 1 | Uppercase label, section marker |

### 3.3 Aturan Typography

- **Mobile body minimum 16px** — nanny mengakses via HP dengan literasi bervariasi
- **Heading utama pakai DM Serif Display** untuk kesan hangat dan personal
- **Teks laporan psikologis**: Body Small (13px), warna `--ink2`, line-height 1.7
- **Sapaan "Bunda"** selalu pakai DM Serif Display italic untuk nuansa personal
- **Jangan pakai font weight < 400** di body — terlalu tipis untuk mobile

---

## 4. Spacing & Radius

### 4.1 Spacing Scale (basis 4px)

| Token | Nilai | Rem | Dipakai untuk |
|---|---|---|---|
| `sp-1` | 4px | 0.25rem | Icon gap, micro spacing |
| `sp-2` | 8px | 0.5rem | Tag gap, inline items |
| `sp-3` | 12px | 0.75rem | Padding kecil, gap dalam card |
| `sp-4` | 16px | 1rem | Card padding standar, gap umum |
| `sp-5` | 20px | 1.25rem | Form field gap |
| `sp-6` | 24px | 1.5rem | Section inner padding |
| `sp-8` | 32px | 2rem | Section outer, card gap |
| `sp-10` | 40px | 2.5rem | Large section padding |
| `touch` | **48px** | 3rem | **Minimum tinggi semua elemen interaktif** |
| `section` | 64px | 4rem | Jarak antar section besar |

> ⚠️ **Touch target minimum 48×48px adalah WAJIB** — nanny mengakses hanya via HP

### 4.2 Border Radius

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `radius-sm` | 4–6px | Badge kecil, tag pill kecil |
| `radius-md` | 10px | Input, button, chip |
| `radius-lg` | 16px | Card, bottom sheet, modal |
| `radius-xl` | 20–24px | Hero card, verdict box, panel besar |
| `radius-full` | 9999px | Pill badge, radio pill, avatar |

```js
// tailwind.config.js
borderRadius: {
  sm:   '6px',
  md:   '10px',
  lg:   '16px',
  xl:   '24px',
  full: '9999px',
}
```

---

## 5. Illustrations & Icons

### 5.1 Pendekatan

BundaYakin menggunakan **SVG illustration custom** — bukan emoji — untuk konsistensi lintas platform dan aksesibilitas. Gaya: flat geometric, palet terbatas (teal + purple + oranye + putih), strokeless.

### 5.2 Ilustrasi Brand (Dari Asset Kipina)

| Asset | Penggunaan |
|---|---|
| `nanny_illustration_HD.png` (1704×2130px, transparan) | Hero section, landing page, laporan PDF |
| `logo_bundayakin_HD.png` (1024×636px, transparan) | Semua touchpoint digital |
| Logo di background gelap | Tampilkan dalam pill putih `bg-white rounded-xl p-3` |

### 5.3 Mapping Aspek Pengasuhan → Ilustrasi

| Kode | Nama Aspek | Sumber Alat Ukur | Konsep Ilustrasi |
|---|---|---|---|
| **A0** | Daya Tangkap | IQ Test HCC | Kepala dengan bintang/cahaya (kecerdasan) |
| **A1** | Tanggung Jawab | PAPI Kostick | Clipboard dengan centang |
| **A2** | Inisiatif | PAPI Kostick | Bintang dengan lingkaran aksi |
| **A3** | Kemandirian | PAPI Kostick | Figur tunggal dengan badge centang |
| **A4** | Ikuti Arahan | PAPI Kostick | Dokumen + centang hijau |
| **A5** | Fleksibilitas | PAPI Kostick | Gelombang adaptif |
| **A6** | Komunikasi | PAPI Kostick | Dua chat bubble (teal + oranye) |
| **A7** | Relasi ke Anak | Tes Grafis | Dua figur berpasangan (nanny + anak) |
| **A8** | Relasi ke Sekitar | Tes Grafis | Network of people |

> **Catatan**: A0 Daya Tangkap dari IQ Test HCC bukan PAPI Kostick. A7 & A8 dari Tes Grafis (bukan PAPI) sehingga bersifat estimasi psikolog.

### 5.4 Status Illustrations

| Status | Warna | Bentuk | Kondisi |
|---|---|---|---|
| **OK / Aman** | Teal `#5BBFB0` | Lingkaran + centang | Aspek memenuhi standar ideal |
| **Warn / Perlu Dibantu** | Oranye `#E07B39` | Segitiga + tanda seru | Aspek di bawah ideal, ada catatan |
| **Partial / Estimasi** | Biru `#5B7EC9` | Setengah lingkaran | Data dari grafis, masih estimasi |
| **Critical / Dealbreaker** | Merah `#C75D5D` | Lingkaran + X | Gagal non-negotiable |

### 5.5 Larangan Icon

- ❌ Jangan pakai emoji di komponen UI teknis (button, badge, nav)
- ❌ Jangan mix emoji + SVG illustration dalam satu komponen
- ✅ Emoji boleh hanya di teks narasi laporan orang tua (informal)

---

## 6. Buttons

### 6.1 Variants

| Variant | Background | Text | Dipakai untuk |
|---|---|---|---|
| **Primary** | `#5BBFB0` | White | Aksi utama halaman |
| **CTA** | `#E07B39` | White | Konversi — upgrade, daftar, mulai |
| **Secondary** | `#E5F6F4` | `#1E4A45` | Aksi sekunder, simpan draft |
| **Ghost** | Transparent | `#666666` | Aksi tersier, batal, kembali |
| **Danger** | `#FAEAEA` | `#C75D5D` | Hapus, batalkan, destructive |

### 6.2 Sizes

| Size | Height | Padding H | Font | Dipakai untuk |
|---|---|---|---|---|
| **Large** | 48px | 24px | 15px | CTA utama halaman, mobile primary action |
| **Medium** | 44px | 20px | 13.5px | Button umum |
| **Small** | 36px | 14px | 12px | Inline action, card action |

> ⚠️ **Minimum height 48px untuk semua button di mobile**

### 6.3 States

```
Default → Hover (darken 10%) → Active (scale 0.97) → Disabled (opacity 0.4)
```

### 6.4 Tailwind Classes

```jsx
// Primary
<button className="bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold
                   px-5 py-3 rounded-[10px] min-h-[48px] transition-all">
  Lihat Hasil Matching
</button>

// CTA Orange
<button className="bg-[#E07B39] hover:bg-[#CC6B2A] text-white font-semibold
                   px-5 py-3 rounded-[10px] min-h-[48px]">
  Mulai Gratis 7 Hari
</button>

// Ghost
<button className="border border-[#C8B8DC] text-[#666666] hover:bg-[#F3EEF8]
                   font-semibold px-5 py-2.5 rounded-[10px] min-h-[44px]">
  Batal
</button>
```

---

## 7. Form Elements

### 7.1 Text Input

```jsx
<div className="mb-4">
  <label className="block text-sm font-semibold text-[#5A3A7A] mb-1.5">
    Nama Lengkap
  </label>
  <input
    type="text"
    placeholder="Cth: Sri Wahyuni"
    className="w-full px-3.5 py-2.5 text-sm text-[#5A3A7A] bg-white
               border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[44px]
               focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/20
               placeholder:text-[#999AAA] outline-none transition-all"
  />
  <p className="text-xs text-[#999AAA] mt-1">Sesuai KTP atau dokumen identitas</p>
</div>
```

### 7.2 Radio Pills (Dominan di Mobile)

Gunakan radio pills — bukan radio button standar — untuk semua pilihan ganda nanny.

```jsx
// Radio Pill Group
<div className="flex flex-wrap gap-2">
  {options.map(opt => (
    <label key={opt.value} className="cursor-pointer">
      <input type="radio" name="group" value={opt.value} className="hidden peer" />
      <span className="flex items-center px-4 py-2.5 text-sm font-medium
                       text-[#666666] bg-white border-[1.5px] border-[#C8B8DC]
                       rounded-full min-h-[44px] transition-all
                       peer-checked:bg-[#E5F6F4] peer-checked:text-[#1E4A45]
                       peer-checked:border-[#5BBFB0] peer-checked:font-semibold">
        {opt.label}
      </span>
    </label>
  ))}
</div>
```

### 7.3 Prinsip Form

| Prinsip | Detail |
|---|---|
| **Pilihan ganda dominan** | Nanny mengisi via HP, literasi bervariasi |
| **Bahasa sangat sederhana** | Tidak ada istilah psikologi di form nanny |
| **Min touch target 44px** | Semua input, select, checkbox |
| **Error state** | Border `#C75D5D` + pesan merah di bawah |
| **Progress indicator** | Tampilkan progress bar di form panjang (53 pertanyaan) |
| **Dealbreaker checkbox** | Selalu sediakan opsi "Ini dealbreaker bagi saya" di pertanyaan kritis |

### 7.4 Progress Bar

```jsx
<div className="bg-[#F3EEF8] rounded-full h-2 overflow-hidden">
  <div
    className="h-full rounded-full bg-[#5BBFB0] transition-all duration-400"
    style={{ width: `${progress}%` }}
  />
</div>
```

---

## 8. Badges & Tags

### 8.1 Status Badges

| Variant | Background | Text Color | Dipakai untuk |
|---|---|---|---|
| **Green** | `#E5F6F4` | `#2C5F5A` | Aktif, lengkap, aman, ok |
| **Orange** | `#FEF0E7` | `#9A4A0E` | Dalam review, peringatan |
| **Red** | `#FAEAEA` | `#C75D5D` | Tidak aktif, error, critical |
| **Blue** | `#EEF2FC` | `#2E4CA0` | Estimasi, partial, proses |
| **Gray** | `#F3EEF8` | `#666666` | Draft, netral |

```jsx
// Badge component
const Badge = ({ variant, children }) => {
  const styles = {
    green:  'bg-[#E5F6F4] text-[#2C5F5A]',
    orange: 'bg-[#FEF0E7] text-[#9A4A0E]',
    red:    'bg-[#FAEAEA] text-[#C75D5D]',
    blue:   'bg-[#EEF2FC] text-[#2E4CA0]',
    gray:   'bg-[#F3EEF8] text-[#666666]',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold
                      px-2.5 py-0.5 rounded-full ${styles[variant]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {children}
    </span>
  )
}
```

### 8.2 Priority Tags (PRD / Backlog)

| Tag | Warna | Arti |
|---|---|---|
| `P0 — Must Have` | Red | Wajib ada di MVP |
| `P1 — Should Have` | Orange | Penting, bisa menyusul |
| `P2 — Nice to Have` | Gray | Fase berikutnya |

### 8.3 Verdict Badges

```
✓ Sangat Direkomendasikan     → Green badge
⚠ Direkomendasikan dg Catatan → Orange badge  
✗ Tidak Direkomendasikan      → Red badge
```

---

## 9. Alerts & Toasts

### 9.1 Alert Variants

```jsx
// Alert structure
<div className={`flex gap-3 p-3.5 rounded-[10px] text-sm border-l-[3px] ${variantClass}`}>
  <IllustrationIcon className="flex-shrink-0 w-6 h-6" />
  <div>
    <p className="font-bold mb-0.5">{title}</p>
    <p>{message}</p>
  </div>
</div>
```

| Variant | Bg | Border-left | Dipakai untuk |
|---|---|---|---|
| **Success** | `#E5F6F4` | `#5BBFB0` | Profil lengkap, laporan tersimpan |
| **Warning** | `#FEF0E7` | `#E07B39` | Dealbreaker belum match, catatan penting |
| **Error** | `#FAEAEA` | `#C75D5D` | Perlu review mendalam, aspek kritis |
| **Info** | `#EEF2FC` | `#5B7EC9` | Data estimasi, proses review psikolog |

### 9.2 Toast Messages

```jsx
// Toast — muncul dari bawah layar, auto-dismiss 3s
<div className="inline-flex items-center gap-2.5 bg-[#5A3A7A] text-white
                px-4 py-3 rounded-[14px] text-sm font-medium shadow-lg">
  <CheckIcon className="text-[#A8DDD8]" />
  Laporan berhasil disimpan
</div>
```

---

## 10. Cards

### 10.1 Base Card

```jsx
<div className="bg-white border border-[#E0D0F0] rounded-[16px] p-5">
  {/* content */}
</div>
```

### 10.2 Card Variants

| Variant | Background | Border | Dipakai untuk |
|---|---|---|---|
| **Default** | `#FFFFFF` | `#E0D0F0` | Card umum, profil |
| **Green / Teal** | `#E5F6F4` | `#A8DDD8` | Catatan positif, tips, status ok |
| **Purple** | `#F3EEF8` | `#E0D0F0` | Catatan psikolog, rekomendasi |
| **Elevated** | `#FFFFFF` | `#E0D0F0` | + `shadow-md` untuk card penting |

### 10.3 Aspek Card (Laporan)

Struktur card per aspek di laporan NannyCare Profile:

```
[Illustration Icon 44px]  [Nama Aspek]           [Badge Status]
                          [Progress Bar]
                          [Narasi untuk Bunda — bahasa awam]
```

- **Narasi wajib dalam bahasa awam** — tidak ada istilah PAPI/psikologi
- **Badge status**: OK (teal) / Warn (oranye) / Partial (biru)
- **Progress bar** menunjukkan skor vs ideal (bukan skor absolut)

---

## 11. Matching Flow Pattern

### 11.1 Arsitektur 3 Layer

```
Layer 1 — Survey Kecocokan (GRATIS dalam langganan)
  ├── 53 pertanyaan paralel (orang tua + nanny)
  ├── Domain A: Kondisi Kerja
  ├── Domain B: Nilai & Gaya Hidup  
  ├── Domain C: Pengalaman & Kemampuan
  └── Output: overall_score + score_per_domain + dealbreaker_flags + tips

Layer 2 — + Psikotes (+Rp 300.000/kandidat)
  ├── IQ Test HCC → Daya Tangkap (A0)
  ├── PAPI Kostick → Aspek A1–A6
  └── Output: NannyCare Profile™ PDF

Layer 3 — + Review Psikolog (+Rp 1–1,5 juta)
  ├── Interview privat
  ├── Tes Grafis → A7 Relasi Anak + A8 Relasi Sekitar
  ├── DISC Assessment → dimensi tambahan
  └── Output: Catatan klinis + verdict + rekomendasi penempatan
```

### 11.2 AI Matching Output Schema

```json
{
  "overall_score": 78,
  "score_per_domain": {
    "A": 85,
    "B": 72,
    "C": 80
  },
  "match_areas": ["Kondisi kerja", "Jadwal"],
  "dealbreaker_flags": [],
  "tips_for_parent": [
    "Tanyakan kabar anak setiap malam",
    "Buat jadwal harian tertulis"
  ]
}
```

### 11.3 Alur Kerja Psikolog (Layer 2 & 3)

```
Upload PDF PAPI Kostick
  ↓
Sistem ekstrak 20 dimensi raw score
  ↓
Hitung 8 aspek pengasuhan (A0–A8)
  ↓
Psikolog input:
  • Hasil tes grafis → A7 & A8 (level + narasi)
  • Catatan klinis → status + pesan orang tua
  • Verdict & rekomendasi akhir
  ↓
Generate PDF NannyCare Profile™
```

---

## 12. Nanny Card Pattern

Komponen utama di dashboard orang tua. Klik → buka laporan lengkap.

### 12.1 Struktur

```
┌─────────────────────────────────────────┐
│ [Avatar]  Nama Nanny           [78%]    │
│           Usia · Pendidikan    Cocok    │
│           Kota asal                     │
├─────────────────────────────────────────│
│ [Progress Bar Domain Terbaik]           │
├─────────────────────────────────────────│
│ [Tag Aspek 1] [Tag Aspek 2] [Tag Warn]  │
├─────────────────────────────────────────│
│ [Button: Lihat Laporan Lengkap →]       │
└─────────────────────────────────────────┘
```

### 12.2 Match Score Color Coding

| Score | Warna | Label |
|---|---|---|
| 85–100% | Teal `#5BBFB0` | Sangat Cocok |
| 70–84% | Teal `#5BBFB0` | Cocok |
| 55–69% | Orange `#E07B39` | Cukup Cocok |
| < 55% | Red `#C75D5D` | Kurang Cocok |

### 12.3 Hover State

```css
.nanny-card:hover {
  box-shadow: 0 6px 20px rgba(91, 191, 176, 0.18);
  transform: translateY(-2px);
}
```

---

## 13. Verdict & Report Pattern

### 13.1 Verdict Box

```jsx
<div className="bg-[#5A3A7A] rounded-[20px] p-8 relative overflow-hidden">
  <p className="text-[9px] font-bold tracking-[2px] uppercase text-[#A8DDD8] mb-2">
    Rekomendasi Psikolog HCC · {bulan} {tahun}
  </p>
  <h2 className="font-serif text-2xl text-white mb-2">{verdictTitle}</h2>
  <p className="text-sm text-white/80 mb-6">{namaKandidat} · {namaPsikolog}</p>
  <p className="text-sm text-white/85 leading-relaxed mb-6">{pesanPsikolog}</p>
  <div className="flex flex-wrap gap-2.5">
    {verdictPills.map(pill => (
      <div className="bg-purple-500/15 border border-white/20 rounded-[10px] px-4 py-2.5">
        <p className="text-sm font-bold text-white">{pill.value}</p>
        <p className="text-[10px] text-white/50 mt-0.5">{pill.label}</p>
      </div>
    ))}
  </div>
</div>
```

### 13.2 Tier Verdict

| Tier | Label | Warna | Kondisi |
|---|---|---|---|
| 1 | **Sangat Direkomendasikan** | Green badge | Skor ≥ 80%, 0 catatan kritis |
| 2 | **Direkomendasikan** | Green badge | Skor 65–79%, max 1 catatan |
| 3 | **Direkomendasikan dengan Catatan** | Orange badge | Skor 50–64%, ada catatan spesifik |
| 4 | **Tidak Direkomendasikan** | Red badge | Skor < 50% atau ada dealbreaker |

### 13.3 Non-Negotiable Checklist (Automatic Disqualification)

Kandidat otomatis **tidak direkomendasikan** jika gagal satu dari enam ini:

1. Riwayat kekerasan terhadap anak
2. Riwayat pelecehan seksual
3. Kondisi kesehatan mental yang tidak terkontrol
4. Tidak jujur pada tes kepribadian (lie scale tinggi)
5. Menolak tinggal sesuai perjanjian (live-in) yang sudah disepakati
6. Tidak bisa baca instruksi tertulis (literacy check)

> ⚠️ **Psikolog memiliki override authority penuh** di semua level verdict. Sistem AI hanya memberikan saran — keputusan akhir tetap di psikolog.

### 13.4 Breakdown 8 Aspek

```
Aspek             Bar (0–80 ideal)          Skor
─────────────────────────────────────────────────
A0 Daya Tangkap   ████████████░░░░░░░░░░░░  60
A1 Tanggung Jwb   ████████████████████░░░░  70  ← OK
A2 Inisiatif      █████████████████████░░░  72  ← OK
A3 Kemandirian    ████████████████████████  76  ← OK
A4 Ikuti Arahan   ████████████████████░░░░  65  ← WARN
A5 Fleksibilitas  ████████████████████████  78  ← OK
A6 Komunikasi     █████████████░░░░░░░░░░░  42  ← CRITICAL
A7 Relasi Anak*   ████████████████████░░░░  68  ← ESTIMASI
A8 Relasi Sekitar*████████████████████░░░░  60  ← ESTIMASI
─────────────────────────────────────────────────
* Dari Tes Grafis — estimasi psikolog
```

### 13.5 Aturan Narasi Laporan

- Bahasa Indonesia yang **hangat dan mudah dipahami**
- **Tidak ada istilah psikologi** di konten yang dibaca orang tua
- Sapaan **"Bunda"** di seluruh narasi
- Pesan psikolog di catatan klinis **tidak boleh diubah satu kata pun** oleh sistem
- Nama instrumen (PAPI Kostick, DISC, dsb) **tidak ditampilkan** di header laporan

---

## 14. Dashboard Stats

### 14.1 Stat Card

```jsx
<div className="bg-white border border-[#E0D0F0] rounded-[14px] p-5">
  <p className="text-[10px] font-semibold tracking-wide uppercase text-[#999AAA] mb-1.5">
    {label}
  </p>
  <p className="font-serif text-3xl text-[#5A3A7A] leading-none mb-1.5">
    {value}
  </p>
  <p className="text-xs text-[#999AAA]">
    <span className="text-[#5BBFB0] font-semibold">{trend}</span> {description}
  </p>
</div>
```

### 14.2 KPI Targets (Phase 1)

| Metric | Target | Cara Ukur |
|---|---|---|
| Retention Rate | > 60% | Perpanjang langganan tahun ke-2 |
| Add-on Conversion | > 20% | Layer 2 atau Layer 3 dari subscriber |
| NPS Score | > 30 | Survey post-placement (orang tua) |
| Profile Completion Nanny | > 70% | % nanny dengan profil ≥ 70% |
| Time to Match | < 7 hari | Submit sampai ada nanny cocok |

---

## 15. Mobile Screens

### 15.1 Viewport Targets

| User | Device | Viewport | Catatan |
|---|---|---|---|
| **Nanny** | HP Android (mid-range) | 360–414px | **HANYA mobile** — tidak ada desktop |
| **Orang Tua** | HP + tablet | 360–768px | Mobile-first, tablet sebagai bonus |
| **Admin HCC** | Desktop + laptop | 1024px+ | Dashboard admin boleh desktop-only |

### 15.2 Mobile-Specific Rules

- **Font minimum 16px** di semua teks yang dibaca nanny
- **Touch target minimum 48px** untuk semua elemen interaktif
- **Pilihan ganda (radio pills) dominan** — hindari input teks bebas di form nanny
- **Bottom sheet** untuk modal/action — bukan centered modal
- **Full-width button** untuk primary CTA di mobile
- **Progress bar** wajib di form panjang (nanny form = 53 pertanyaan)

### 15.3 Screen Priorities untuk MVP

| Screen | User | Priority |
|---|---|---|
| Landing page | Semua | P0 |
| Onboarding / registrasi | Nanny + OT | P0 |
| Form matching (nanny) | Nanny | P0 |
| Form matching (orang tua) | OT | P0 |
| Dashboard orang tua | OT | P0 |
| Nanny card list | OT | P0 |
| Laporan kecocokan | OT | P0 |
| Profil nanny (edit) | Nanny | P1 |
| Log harian | Nanny + OT | P2 |
| Dashboard admin | HCC | P1 |

---

## 16. Rules & Prohibitions

### 16.1 Warna — Larangan Mutlak

```
❌ DILARANG KERAS: Kuning (#FFFF00, #F5E642, #FFD700, dsb)
   → Tidak boleh dipakai sebagai background, teks, border, atau ikon
   → Dalam kondisi apapun
   → Kecuali: aksen dekoratif SANGAT kecil (#F9C74F dari brand Kipina — max 6px dot)
```

### 16.2 Konten — Larangan

```
❌ Istilah psikologi di konten yang dibaca orang tua
   (PAPI, raw score, dimensi, percentile, stanine, dsb)

❌ Narasi yang menyudutkan atau mempermalukan working mother

❌ Pesan psikolog diubah atau diparafrase oleh sistem

❌ Nama instrumen tes ditampilkan di header laporan

❌ Logo BundaYakin tanpa background saat di atas surface gelap
   (selalu bungkus dengan pill putih atau bg putih)
```

### 16.3 Psikolog Override Authority

> Sistem AI BundaYakin hanya menghasilkan **saran otomatis**. Psikolog memiliki **hak override penuh** di setiap level:
> - Mengubah verdict yang dihasilkan AI
> - Menambah / menghapus catatan aspek
> - Menulis ulang narasi laporan
> - Menganulir hasil matching Layer 1

### 16.4 Data & Privasi

- Laporan NannyCare Profile™ bersifat **RAHASIA** — hanya untuk keluarga dan agency
- Psikolog yang menginterpretasi wajib tercantum di footer laporan
- Footer laporan: *"diinterpretasikan oleh psikolog"* — bukan "berlisensi HCC"
- Data kandidat tidak boleh dibagikan ke pihak ketiga tanpa consent

---

## Appendix: Alat Ukur Psikologis

| Instrumen | Publisher | Dimensi | Aspek yang Diukur |
|---|---|---|---|
| **IQ Test HCC** | Human Care Consulting (proprietary) | 1 (IQ score) | A0 Daya Tangkap |
| **PAPI Kostick** | Cubiks / PA Consulting | 20 dimensi | A1–A6 (pengasuhan) |
| **Tes Grafis** (DAM/BAUM) | Interpretasi psikolog | Kualitatif | A7 Relasi Anak, A8 Relasi Sekitar |
| **DISC** | Various | 4 dimensi (D-I-S-C) | TBD — mapping ke aspek sedang dikembangkan |

---

*BundaYakin Design System v2.1 · Human Care Consulting · Mei 2026*  
*Dibuat untuk digunakan di platform Next.js + Tailwind CSS*  
*Untuk pertanyaan: tim psikolog & produk HCC*
