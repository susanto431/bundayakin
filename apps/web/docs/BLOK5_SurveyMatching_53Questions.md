# Blok 5 — Survey Matching Layer 1
**BundaYakin · Human Care Consulting**
Versi: 1.0 (Post-Review) · Mei 2026

> Dokumentasi ini adalah source of truth untuk implementasi form survey Layer 1.
> Copy file ini ke Claude Code dan gunakan sebagai referensi saat build `src/components/survey/`.

---

## Struktur Data

Setiap pertanyaan memiliki struktur:
```ts
type SurveyQuestion = {
  id: string;              // e.g. "A1.1"
  domain: string;          // e.g. "A" | "B" | "C"
  subdomain: string;       // e.g. "A1" | "B3" | "C2"
  subdomainLabel: string;  // e.g. "Gaji, Libur & Fasilitas"
  weight: "Tinggi" | "Menengah" | "Rendah";
  layer: "L1" | "L2" | "L2/L3";
  forNanny: {
    question: string;
    options: { value: string; label: string }[];
    hasFreeText?: boolean;   // jika ada opsi yang membutuhkan free text
    freeTextTrigger?: string; // value opsi yang memicu free text
  };
  forParent: {
    question: string;
    options: { value: string; label: string }[];
    hasFreeText?: boolean;
    freeTextTrigger?: string;
  } | null;  // null = hanya untuk Nanny
  canBeDealbreaker: boolean;  // selalu true di Layer 1
  popupFollowUp?: PopupFollowUp[];  // pertanyaan lanjutan kondisional
};

type PopupFollowUp = {
  trigger: string;   // value opsi yang memicu popup
  questions: {
    question: string;
    options: { value: string; label: string }[];
  }[];
};
```

---

## Domain A — Kondisi Kerja & Ekspektasi Praktis

### A1 — Gaji, Libur & Fasilitas (Bobot: Tinggi)

---

**A1.1 — Gaji**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Berapa gaji yang kamu harapkan per bulan? | A. Di bawah Rp 2 juta · B. Rp 2–3 juta · C. Rp 3–4 juta · D. Rp 4–5 juta · E. Di atas Rp 5 juta |
| **Ortu** | Berapa budget gaji nanny per bulan? | A. Di bawah Rp 2 juta · B. Rp 2–3 juta · C. Rp 3–4 juta · D. Rp 4–5 juta · E. Di atas Rp 5 juta |

```ts
{
  id: "A1.1",
  domain: "A",
  subdomain: "A1",
  subdomainLabel: "Gaji, Libur & Fasilitas",
  weight: "Tinggi",
  layer: "L1",
  forNanny: {
    question: "Berapa gaji yang kamu harapkan per bulan?",
    options: [
      { value: "a", label: "Di bawah Rp 2 juta" },
      { value: "b", label: "Rp 2–3 juta" },
      { value: "c", label: "Rp 3–4 juta" },
      { value: "d", label: "Rp 4–5 juta" },
      { value: "e", label: "Di atas Rp 5 juta" },
    ],
  },
  forParent: {
    question: "Berapa budget gaji nanny per bulan?",
    options: [
      { value: "a", label: "Di bawah Rp 2 juta" },
      { value: "b", label: "Rp 2–3 juta" },
      { value: "c", label: "Rp 3–4 juta" },
      { value: "d", label: "Rp 4–5 juta" },
      { value: "e", label: "Di atas Rp 5 juta" },
    ],
  },
  canBeDealbreaker: true,
}
```

---

**A1.2 — Tinggal di Rumah**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Apakah kamu mau tinggal di rumah majikan? | A. Ya, mau tinggal di sana · B. Tidak, mau pulang setiap hari |
| **Ortu** | Nanny harus tinggal di rumah? | A. Ya, harus tinggal · B. Boleh pulang setiap hari · C. Bebas |

```ts
{
  id: "A1.2",
  forNanny: {
    question: "Apakah kamu mau tinggal di rumah majikan?",
    options: [
      { value: "a", label: "Ya, mau tinggal di sana" },
      { value: "b", label: "Tidak, mau pulang setiap hari" },
    ],
  },
  forParent: {
    question: "Nanny harus tinggal di rumah?",
    options: [
      { value: "a", label: "Ya, harus tinggal" },
      { value: "b", label: "Boleh pulang setiap hari" },
      { value: "c", label: "Bebas" },
    ],
  },
}
```

---

**A1.3 — Fasilitas Tempat Tidur** *(diletakkan langsung setelah A1.2 — topik related)*

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kalau tinggal di rumah — kamu butuh kamar sendiri? | A. Ya, harus kamar sendiri · B. Tidak masalah berbagi kamar dengan rekan kerja (ART/Nanny lain) · C. Tidak masalah tidur sekamar dengan anak · D. Tidak tinggal di sana |
| **Ortu** | Untuk area tidur, nanny mendapat fasilitas: | A. Kamar sendiri · B. Berbagi kamar dengan rekan kerja (ART/Nanny lain) · C. Tidur sekamar dengan anak · D. Tidak tinggal di rumah |

> 📌 *Catatan implementasi: A1.3 ditampilkan langsung setelah A1.2, bukan di posisi A1.8 seperti draft awal.*

```ts
{
  id: "A1.3",
  forNanny: {
    question: "Kalau tinggal di rumah — kamu butuh kamar sendiri?",
    options: [
      { value: "a", label: "Ya, harus kamar sendiri" },
      { value: "b", label: "Tidak masalah berbagi kamar dengan rekan kerja (ART/Nanny lain)" },
      { value: "c", label: "Tidak masalah tidur sekamar dengan anak" },
      { value: "d", label: "Tidak tinggal di sana" },
    ],
  },
  forParent: {
    question: "Untuk area tidur, nanny mendapat fasilitas:",
    options: [
      { value: "a", label: "Kamar sendiri" },
      { value: "b", label: "Berbagi kamar dengan rekan kerja (ART/Nanny lain)" },
      { value: "c", label: "Tidur sekamar dengan anak" },
      { value: "d", label: "Tidak tinggal di rumah" },
    ],
  },
}
```

---

**A1.4 — Libur per Bulan**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Seberapa sering kamu ingin libur tiap bulan? | A. Tidak perlu libur · B. 1 hari · C. 2 hari · D. 3 hari · E. 4 hari (seminggu sekali) · F. Lain-lain (free text) |
| **Ortu** | Seberapa sering nanny boleh libur tiap bulan? | A. Tidak ada libur · B. 1 hari · C. 2 hari · D. 3 hari · E. 4 hari (seminggu sekali) |

> 📌 *Catatan implementasi: A1.3 (libur) dan A1.4 (cuti) dari draft awal digabung menjadi 1 pertanyaan ini. Pertanyaan cuti terpisah dihapus.*

```ts
{
  id: "A1.4",
  forNanny: {
    question: "Seberapa sering kamu ingin libur tiap bulan?",
    options: [
      { value: "a", label: "Tidak perlu libur" },
      { value: "b", label: "1 hari" },
      { value: "c", label: "2 hari" },
      { value: "d", label: "3 hari" },
      { value: "e", label: "4 hari (seminggu sekali)" },
      { value: "f", label: "Lain-lain" },
    ],
    hasFreeText: true,
    freeTextTrigger: "f",
  },
  forParent: {
    question: "Seberapa sering nanny boleh libur tiap bulan?",
    options: [
      { value: "a", label: "Tidak ada libur" },
      { value: "b", label: "1 hari" },
      { value: "c", label: "2 hari" },
      { value: "d", label: "3 hari" },
      { value: "e", label: "4 hari (seminggu sekali)" },
    ],
  },
}
```

---

**A1.5 — Jam Kerja**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Bagaimana jam kerja yang kamu harapkan? | A. Shift kerja 8 jam sehari · B. Shift kerja 12 jam · C. Menyesuaikan jadwal anak (bangun hingga tidur) · D. Kerja sepanjang hari termasuk tidur bersama anak |
| **Ortu** | Jam kerja nanny yang diharapkan: | A. Shift kerja 8 jam sehari · B. Shift kerja 12 jam · C. Menyesuaikan jadwal anak (bangun hingga tidur) · D. Kerja sepanjang hari termasuk tidur bersama anak |

```ts
{
  id: "A1.5",
  forNanny: {
    question: "Bagaimana jam kerja yang kamu harapkan?",
    options: [
      { value: "a", label: "Shift kerja 8 jam sehari" },
      { value: "b", label: "Shift kerja 12 jam" },
      { value: "c", label: "Menyesuaikan jadwal anak (dari bangun hingga tidur)" },
      { value: "d", label: "Kerja sepanjang hari termasuk tidur bersama anak" },
    ],
  },
  forParent: {
    question: "Jam kerja nanny yang diharapkan:",
    options: [
      { value: "a", label: "Shift kerja 8 jam sehari" },
      { value: "b", label: "Shift kerja 12 jam" },
      { value: "c", label: "Menyesuaikan jadwal anak (dari bangun hingga tidur)" },
      { value: "d", label: "Kerja sepanjang hari termasuk tidur bersama anak" },
    ],
  },
}
```

---

**A1.6 — Lembur**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Apakah kamu mau lembur kalau diminta? | A. Ya, tidak masalah · B. Mau sesekali (free text: "sesekali seperti apa?") · C. Tidak mau |
| **Ortu** | Ada kemungkinan nanny diminta lembur? | A. Ya, sering (free text: keterangan) · B. Kadang-kadang (free text: keterangan) · C. Tidak pernah |

```ts
{
  id: "A1.6",
  forNanny: {
    question: "Apakah kamu mau lembur kalau diminta?",
    options: [
      { value: "a", label: "Ya, tidak masalah" },
      { value: "b", label: "Mau sesekali" },
      { value: "c", label: "Tidak mau" },
    ],
    hasFreeText: true,
    freeTextTrigger: "b",
  },
  forParent: {
    question: "Ada kemungkinan nanny diminta lembur?",
    options: [
      { value: "a", label: "Ya, sering" },
      { value: "b", label: "Kadang-kadang" },
      { value: "c", label: "Tidak pernah" },
    ],
    hasFreeText: true,
    freeTextTrigger: "a,b", // trigger untuk kedua opsi
  },
}
```

---

**A1.7 — THR**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu mau dapat THR? | A. Ya, wajib · B. Tidak masalah kalau tidak ada |
| **Ortu** | Kamu kasih THR ke nanny? | A. Ya · B. Tidak |

```ts
{
  id: "A1.7",
  forNanny: {
    question: "Kamu mau dapat THR?",
    options: [
      { value: "a", label: "Ya, wajib" },
      { value: "b", label: "Tidak masalah kalau tidak ada" },
    ],
  },
  forParent: {
    question: "Kamu kasih THR ke nanny?",
    options: [
      { value: "a", label: "Ya" },
      { value: "b", label: "Tidak" },
    ],
  },
}
```

---

**A1.8 — BPJS Kesehatan**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu mau didaftarkan BPJS Kesehatan? | A. Ya, wajib · B. Tidak masalah |
| **Ortu** | Kamu daftarkan nanny ke BPJS? | A. Ya · B. Tidak |

```ts
{
  id: "A1.8",
  forNanny: {
    question: "Kamu mau didaftarkan BPJS Kesehatan?",
    options: [
      { value: "a", label: "Ya, wajib" },
      { value: "b", label: "Tidak masalah" },
    ],
  },
  forParent: {
    question: "Kamu daftarkan nanny ke BPJS Kesehatan?",
    options: [
      { value: "a", label: "Ya" },
      { value: "b", label: "Tidak" },
    ],
  },
}
```

---

**A1.9 — Fasilitas Kebutuhan Harian**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu mau fasilitas kebutuhan sehari-hari disediakan? (sabun, shampo, odol, dll) | A. Ya, wajib · B. Tidak masalah atur sendiri · C. Tidak masalah keduanya |
| **Ortu** | Apakah kamu menyediakan kebutuhan sehari-hari nanny? (sabun, shampo, odol, dll) | A. Ya, disediakan · B. Tidak, nanny atur sendiri |

> 📌 *Catatan implementasi: Pertanyaan soal makan dari draft awal (A1.9) dihapus karena common practice sudah makan dari dapur rumah. Diganti pertanyaan fasilitas kebutuhan harian.*

```ts
{
  id: "A1.9",
  forNanny: {
    question: "Kamu mau fasilitas kebutuhan sehari-hari disediakan? (sabun, shampo, odol, pembalut, dll)",
    options: [
      { value: "a", label: "Ya, wajib disediakan" },
      { value: "b", label: "Tidak masalah atur sendiri" },
      { value: "c", label: "Tidak masalah keduanya" },
    ],
  },
  forParent: {
    question: "Apakah kamu menyediakan kebutuhan sehari-hari nanny? (sabun, shampo, odol, dll)",
    options: [
      { value: "a", label: "Ya, disediakan" },
      { value: "b", label: "Tidak, nanny atur sendiri" },
    ],
  },
}
```

---

**A1.10 — Rencana Durasi Kerja**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu berencana bekerja sebagai nanny berapa lama? | A. 1 bulan · B. 3 bulan · C. 6 bulan · D. 1 tahun · E. Belum ditentukan · F. Lain-lain (free text) |
| **Ortu** | Kontrak kerja yang kamu tawarkan ke nanny berapa lama? | A. 1 bulan · B. 3 bulan · C. 6 bulan · D. 1 tahun · E. Belum ditentukan · F. Lain-lain (free text) |

```ts
{
  id: "A1.10",
  forNanny: {
    question: "Kamu berencana bekerja sebagai nanny berapa lama?",
    options: [
      { value: "a", label: "1 bulan" },
      { value: "b", label: "3 bulan" },
      { value: "c", label: "6 bulan" },
      { value: "d", label: "1 tahun" },
      { value: "e", label: "Belum ditentukan" },
      { value: "f", label: "Lain-lain" },
    ],
    hasFreeText: true,
    freeTextTrigger: "f",
  },
  forParent: {
    question: "Kontrak kerja yang kamu tawarkan ke nanny berapa lama?",
    options: [
      { value: "a", label: "1 bulan" },
      { value: "b", label: "3 bulan" },
      { value: "c", label: "6 bulan" },
      { value: "d", label: "1 tahun" },
      { value: "e", label: "Belum ditentukan" },
      { value: "f", label: "Lain-lain" },
    ],
    hasFreeText: true,
    freeTextTrigger: "f",
  },
}
```

---

### A2 — Lingkup & Tugas Kerja (Bobot: Tinggi)

---

**A2.1 — Masak**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu mau bantu masak? | A. Ya, masak untuk semua anggota keluarga · B. Hanya masak untuk anak · C. Tidak mau / tidak bisa masak |
| **Ortu** | Nanny perlu bantu masak? | A. Ya, untuk semua anggota keluarga · B. Hanya untuk anak · C. Tidak perlu |

```ts
{
  id: "A2.1",
  forNanny: {
    question: "Kamu mau bantu masak?",
    options: [
      { value: "a", label: "Ya, masak untuk semua anggota keluarga" },
      { value: "b", label: "Hanya masak untuk anak" },
      { value: "c", label: "Tidak mau / tidak bisa masak" },
    ],
  },
  forParent: {
    question: "Nanny perlu bantu masak?",
    options: [
      { value: "a", label: "Ya, untuk semua anggota keluarga" },
      { value: "b", label: "Hanya untuk anak" },
      { value: "c", label: "Tidak perlu" },
    ],
  },
}
```

---

**A2.2 — Cuci Baju**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu mau bantu cuci baju? | A. Ya · B. Tidak |
| **Ortu** | Nanny perlu cuci baju? | A. Ya · B. Tidak |

```ts
{
  id: "A2.2",
  forNanny: {
    question: "Kamu mau bantu cuci baju?",
    options: [{ value: "a", label: "Ya" }, { value: "b", label: "Tidak" }],
  },
  forParent: {
    question: "Nanny perlu cuci baju?",
    options: [{ value: "a", label: "Ya" }, { value: "b", label: "Tidak" }],
  },
}
```

---

**A2.3 — Bersih-bersih Rumah**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu mau bantu bersih-bersih rumah? | A. Ya, seluruh bagian rumah · B. Hanya kamar dan area/ruang bermain anak · C. Tidak mau |
| **Ortu** | Nanny perlu bersih-bersih rumah? | A. Ya, seluruh bagian rumah · B. Hanya kamar dan area/ruang bermain anak · C. Tidak perlu |

```ts
{
  id: "A2.3",
  forNanny: {
    question: "Kamu mau bantu bersih-bersih rumah?",
    options: [
      { value: "a", label: "Ya, seluruh bagian rumah" },
      { value: "b", label: "Hanya kamar dan area/ruang bermain anak" },
      { value: "c", label: "Tidak mau" },
    ],
  },
  forParent: {
    question: "Nanny perlu bersih-bersih rumah?",
    options: [
      { value: "a", label: "Ya, seluruh bagian rumah" },
      { value: "b", label: "Hanya kamar dan area/ruang bermain anak" },
      { value: "c", label: "Tidak perlu" },
    ],
  },
}
```

---

**A2.4 — Setrika**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu mau bantu setrika? | A. Ya · B. Tidak |
| **Ortu** | Nanny perlu setrika? | A. Ya · B. Tidak |

```ts
{
  id: "A2.4",
  forNanny: {
    question: "Kamu mau bantu setrika?",
    options: [{ value: "a", label: "Ya" }, { value: "b", label: "Tidak" }],
  },
  forParent: {
    question: "Nanny perlu setrika?",
    options: [{ value: "a", label: "Ya" }, { value: "b", label: "Tidak" }],
  },
}
```

---

**A2.5 — Kerja Bareng ART Lain**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu nyaman kerja bareng ART lain di rumah yang sama? | A. Ya, tidak masalah · B. Lebih suka kerja sendiri · C. Tidak ada pendapat |
| **Ortu** | Di rumah ada ART lain selain nanny? | A. Ya · B. Tidak |

```ts
{
  id: "A2.5",
  forNanny: {
    question: "Kamu nyaman kerja bareng ART lain di rumah yang sama?",
    options: [
      { value: "a", label: "Ya, tidak masalah" },
      { value: "b", label: "Lebih suka kerja sendiri" },
      { value: "c", label: "Tidak ada pendapat" },
    ],
  },
  forParent: {
    question: "Di rumah ada ART lain selain nanny?",
    options: [{ value: "a", label: "Ya" }, { value: "b", label: "Tidak" }],
  },
}
```

---

**A2.6 — Jumlah Anak yang Dijaga**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu mau jaga lebih dari 1 anak? | A. Ya, tidak masalah · B. Maksimal 2 anak · C. Lebih suka 1 anak saja |
| **Ortu** | Berapa anak yang perlu dijaga? | A. 1 anak · B. 2 anak · C. Lebih dari 2 anak |

```ts
{
  id: "A2.6",
  forNanny: {
    question: "Kamu mau jaga lebih dari 1 anak?",
    options: [
      { value: "a", label: "Ya, tidak masalah" },
      { value: "b", label: "Maksimal 2 anak" },
      { value: "c", label: "Lebih suka 1 anak saja" },
    ],
  },
  forParent: {
    question: "Berapa anak yang perlu dijaga?",
    options: [
      { value: "a", label: "1 anak" },
      { value: "b", label: "2 anak" },
      { value: "c", label: "Lebih dari 2 anak" },
    ],
  },
}
```

---

## Domain B — Nilai, Kepercayaan & Gaya Hidup

### B1 — Agama & Kepercayaan (Bobot: Tinggi)

---

**B1.1 — Agama**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Agama kamu apa? | A. Islam · B. Kristen · C. Katolik · D. Hindu · E. Budha · F. Lainnya |
| **Ortu** | Agama keluarga apa? | A. Islam · B. Kristen · C. Katolik · D. Hindu · E. Budha · F. Lainnya |

```ts
{
  id: "B1.1",
  domain: "B",
  subdomain: "B1",
  subdomainLabel: "Agama & Kepercayaan",
  weight: "Tinggi",
  forNanny: {
    question: "Agama kamu apa?",
    options: [
      { value: "a", label: "Islam" },
      { value: "b", label: "Kristen" },
      { value: "c", label: "Katolik" },
      { value: "d", label: "Hindu" },
      { value: "e", label: "Budha" },
      { value: "f", label: "Lainnya" },
    ],
  },
  forParent: {
    question: "Agama keluarga apa?",
    options: [
      { value: "a", label: "Islam" },
      { value: "b", label: "Kristen" },
      { value: "c", label: "Katolik" },
      { value: "d", label: "Hindu" },
      { value: "e", label: "Budha" },
      { value: "f", label: "Lainnya" },
    ],
  },
}
```

---

**B1.2 — Ibadah di Jam Kerja**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu perlu waktu khusus untuk ibadah di jam kerja? | A. Ya, perlu · B. Tidak perlu |
| **Ortu** | Kamu izinkan nanny ibadah di jam kerja? | A. Ya, boleh · B. Tidak, harus di luar jam kerja |

```ts
{
  id: "B1.2",
  forNanny: {
    question: "Kamu perlu waktu khusus untuk ibadah di jam kerja?",
    options: [{ value: "a", label: "Ya, perlu" }, { value: "b", label: "Tidak perlu" }],
  },
  forParent: {
    question: "Kamu izinkan nanny ibadah di jam kerja?",
    options: [
      { value: "a", label: "Ya, boleh" },
      { value: "b", label: "Tidak, harus di luar jam kerja" },
    ],
  },
}
```

---

**B1.3 — Makanan Tidak Halal**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu mau masak atau menyuapi anak makanan yang tidak halal? | A. Ya, tidak masalah · B. Masak boleh, tapi tidak menyuapi · C. Tidak mau sama sekali · D. Tergantung jenis makanannya |
| **Ortu** | Di rumah ada makanan tidak halal yang perlu dimasak atau disiapkan nanny? | A. Ya · B. Tidak |

```ts
{
  id: "B1.3",
  forNanny: {
    question: "Kamu mau masak atau menyuapi anak makanan yang tidak halal?",
    options: [
      { value: "a", label: "Ya, tidak masalah" },
      { value: "b", label: "Masak boleh, tapi tidak mau menyuapi" },
      { value: "c", label: "Tidak mau sama sekali" },
      { value: "d", label: "Tergantung jenis makanannya" },
    ],
  },
  forParent: {
    question: "Di rumah ada makanan tidak halal yang perlu dimasak atau disiapkan nanny?",
    options: [{ value: "a", label: "Ya" }, { value: "b", label: "Tidak" }],
  },
}
```

---

**B1.4 — Dampingi ke Tempat Ibadah Beda Agama**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu mau dampingi anak ke tempat ibadah yang berbeda agama? | A. Ya, siap · B. Tidak mau · C. Bisa, tapi tidak ikut masuk ke dalam |
| **Ortu** | Nanny perlu dampingi anak ke tempat ibadah? | A. Ya, sering · B. Kadang-kadang · C. Tidak pernah |

```ts
{
  id: "B1.4",
  forNanny: {
    question: "Kamu mau dampingi anak ke tempat ibadah yang berbeda agama?",
    options: [
      { value: "a", label: "Ya, siap" },
      { value: "b", label: "Tidak mau" },
      { value: "c", label: "Bisa, tapi tidak ikut masuk ke dalam" },
    ],
  },
  forParent: {
    question: "Nanny perlu dampingi anak ke tempat ibadah?",
    options: [
      { value: "a", label: "Ya, sering" },
      { value: "b", label: "Kadang-kadang" },
      { value: "c", label: "Tidak pernah" },
    ],
  },
}
```

---

### B2 — Pakaian & Penampilan (Bobot: Menengah)

---

**B2.1 — Hijab**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu biasa pakai hijab? | A. Ya, selalu · B. Tergantung situasi (saat keluar saja) · C. Tidak |
| **Ortu** | Nanny diharapkan pakai hijab? | A. Ya, harus · B. Tidak masalah pakai atau tidak · C. Lebih suka tidak pakai hijab |

```ts
{
  id: "B2.1",
  domain: "B",
  subdomain: "B2",
  subdomainLabel: "Pakaian & Penampilan",
  weight: "Menengah",
  forNanny: {
    question: "Kamu biasa pakai hijab?",
    options: [
      { value: "a", label: "Ya, selalu" },
      { value: "b", label: "Tergantung situasi (saat keluar saja)" },
      { value: "c", label: "Tidak" },
    ],
  },
  forParent: {
    question: "Nanny diharapkan pakai hijab?",
    options: [
      { value: "a", label: "Ya, harus" },
      { value: "b", label: "Tidak masalah pakai atau tidak" },
      { value: "c", label: "Lebih suka tidak pakai hijab" },
    ],
  },
}
```

---

**B2.2 — Lepas Hijab di Dalam Rumah**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kalau diminta lepas hijab di dalam rumah, kamu keberatan? | A. Ya, keberatan · B. Tidak masalah · C. Saya tidak pakai hijab |
| **Ortu** | Kamu mengharapkan nanny lepas hijab di dalam rumah? | A. Ya · B. Tidak · C. Tidak masalah |

```ts
{
  id: "B2.2",
  forNanny: {
    question: "Kalau diminta lepas hijab di dalam rumah, kamu keberatan?",
    options: [
      { value: "a", label: "Ya, keberatan" },
      { value: "b", label: "Tidak masalah" },
      { value: "c", label: "Saya tidak pakai hijab" },
    ],
  },
  forParent: {
    question: "Kamu mengharapkan nanny lepas hijab di dalam rumah?",
    options: [
      { value: "a", label: "Ya" },
      { value: "b", label: "Tidak" },
      { value: "c", label: "Tidak masalah" },
    ],
  },
}
```

---

**B2.3 — Seragam Kerja**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu nyaman pakai seragam kerja? | A. Ya, tidak masalah · B. Lebih suka baju sendiri · C. Tidak masalah keduanya |
| **Ortu** | Apakah kamu menyediakan seragam untuk nanny? | A. Ya, wajib pakai seragam · B. Tidak, bebas rapi · C. Tidak wajib tapi disediakan |

```ts
{
  id: "B2.3",
  forNanny: {
    question: "Kamu nyaman pakai seragam kerja?",
    options: [
      { value: "a", label: "Ya, tidak masalah" },
      { value: "b", label: "Lebih suka baju sendiri" },
      { value: "c", label: "Tidak masalah keduanya" },
    ],
  },
  forParent: {
    question: "Apakah kamu menyediakan seragam untuk nanny?",
    options: [
      { value: "a", label: "Ya, wajib pakai seragam" },
      { value: "b", label: "Tidak, bebas rapi" },
      { value: "c", label: "Tidak wajib tapi disediakan" },
    ],
  },
}
```

---

**B2.4 — Aturan Berpakaian di Dalam Rumah**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Jenis pakaian apa yang ingin kamu gunakan sehari-hari saat bekerja di dalam rumah? | A. Celana pendek dan/atau tank top · B. Kaos dan celana panjang longgar · C. Mengikuti aturan berpakaian majikan |
| **Ortu** | Nanny boleh pakai celana pendek di dalam rumah? | A. Ya, boleh · B. Tidak boleh · C. Tidak masalah |

```ts
{
  id: "B2.4",
  forNanny: {
    question: "Jenis pakaian apa yang ingin kamu gunakan sehari-hari saat bekerja di dalam rumah?",
    options: [
      { value: "a", label: "Celana pendek dan/atau tank top" },
      { value: "b", label: "Kaos dan celana panjang longgar" },
      { value: "c", label: "Mengikuti aturan berpakaian majikan" },
    ],
  },
  forParent: {
    question: "Aturan berpakaian nanny di dalam rumah:",
    options: [
      { value: "a", label: "Bebas, termasuk celana pendek / tank top" },
      { value: "b", label: "Harus berpakaian sopan dan tertutup" },
      { value: "c", label: "Tidak masalah selama rapi" },
    ],
  },
}
```

---

**B2.5 — Pakaian Saat Keluar Rumah Bersama Anak**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Waktu keluar rumah bersama anak, kamu ingin berpakaian seperti apa? | A. Bebas rapi · B. Pakai seragam · C. Tertutup/sopan · D. Sesuai permintaan majikan |
| **Ortu** | Waktu keluar rumah bersama anak, nanny diharapkan berpakaian seperti apa? | A. Bebas rapi · B. Pakai seragam · C. Harus tertutup · D. Terserah nanny |

```ts
{
  id: "B2.5",
  forNanny: {
    question: "Waktu keluar rumah bersama anak, kamu ingin berpakaian seperti apa?",
    options: [
      { value: "a", label: "Bebas rapi" },
      { value: "b", label: "Pakai seragam" },
      { value: "c", label: "Tertutup/sopan" },
      { value: "d", label: "Sesuai permintaan majikan" },
    ],
  },
  forParent: {
    question: "Waktu keluar rumah bersama anak, nanny diharapkan berpakaian seperti apa?",
    options: [
      { value: "a", label: "Bebas rapi" },
      { value: "b", label: "Pakai seragam" },
      { value: "c", label: "Harus tertutup" },
      { value: "d", label: "Terserah nanny" },
    ],
  },
}
```

---

### B3 — Gaya Pengasuhan (Bobot: Tinggi)

---

**B3.1 — Respons saat Anak Menangis**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kalau anak nangis, kamu bagaimana? | A. Langsung gendong/peluk · B. Tunggu sebentar, lihat situasi · C. Tergantung kenapa nangisnya |
| **Ortu** | Kalau anak nangis, kamu mau nanny bagaimana? | A. Langsung gendong/peluk · B. Tunggu sebentar dulu · C. Tergantung situasi |

```ts
{
  id: "B3.1",
  domain: "B",
  subdomain: "B3",
  subdomainLabel: "Gaya Pengasuhan",
  weight: "Tinggi",
  forNanny: {
    question: "Kalau anak nangis, kamu bagaimana?",
    options: [
      { value: "a", label: "Langsung gendong/peluk" },
      { value: "b", label: "Tunggu sebentar, lihat situasi dulu" },
      { value: "c", label: "Tergantung kenapa nangisnya" },
    ],
  },
  forParent: {
    question: "Kalau anak nangis, kamu mau nanny bagaimana?",
    options: [
      { value: "a", label: "Langsung gendong/peluk" },
      { value: "b", label: "Tunggu sebentar dulu" },
      { value: "c", label: "Tergantung situasi" },
    ],
  },
}
```

---

**B3.2 — HP / TV untuk Anak**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu setuju anak boleh lihat HP/TV? | A. Boleh, tidak dibatasi · B. Boleh tapi dibatasi waktunya · C. Tidak boleh sama sekali |
| **Ortu** | Di rumah, anak boleh lihat HP/TV? | A. Boleh bebas · B. Boleh tapi dibatasi · C. Tidak boleh |

```ts
{
  id: "B3.2",
  forNanny: {
    question: "Kamu setuju anak boleh lihat HP/TV?",
    options: [
      { value: "a", label: "Boleh, tidak dibatasi" },
      { value: "b", label: "Boleh tapi dibatasi waktunya" },
      { value: "c", label: "Tidak boleh sama sekali" },
    ],
  },
  forParent: {
    question: "Di rumah, anak boleh lihat HP/TV?",
    options: [
      { value: "a", label: "Boleh bebas" },
      { value: "b", label: "Boleh tapi dibatasi" },
      { value: "c", label: "Tidak boleh" },
    ],
  },
}
```

---

**B3.3 — Penanganan Anak Susah Makan**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kalau anak tidak mau makan, kamu bagaimana? | A. Bujuk pelan-pelan sampai mau · B. Batasi waktu makan (20–30 menit), tunggu waktu makan berikutnya · C. Tunggu sampai lapar sendiri · D. Ikuti mau anak · E. Langsung lapor ke orang tua |
| **Ortu** | Kalau anak susah makan, kamu mau nanny bagaimana? | A. Bujuk pelan-pelan · B. Batasi waktu makan, tunggu jadwal berikutnya · C. Tunggu lapar sendiri · D. Lapor ke orang tua |

```ts
{
  id: "B3.3",
  forNanny: {
    question: "Kalau anak tidak mau makan, kamu bagaimana?",
    options: [
      { value: "a", label: "Bujuk pelan-pelan sampai mau" },
      { value: "b", label: "Batasi waktu makan (20–30 menit), tunggu waktu makan berikutnya" },
      { value: "c", label: "Tunggu sampai lapar sendiri" },
      { value: "d", label: "Ikuti mau anak" },
      { value: "e", label: "Langsung lapor ke orang tua" },
    ],
  },
  forParent: {
    question: "Kalau anak susah makan, kamu mau nanny bagaimana?",
    options: [
      { value: "a", label: "Bujuk pelan-pelan" },
      { value: "b", label: "Batasi waktu makan, tunggu jadwal berikutnya" },
      { value: "c", label: "Tunggu lapar sendiri" },
      { value: "d", label: "Lapor ke orang tua" },
    ],
  },
}
```

---

**B3.4 — Batas Disiplin ke Anak**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu pernah cubit atau marahi anak keras kalau nakal? | A. Tidak pernah · B. Pernah tapi sangat jarang · C. Kadang-kadang |
| **Ortu** | Batas disiplin nanny ke anak yang kamu izinkan: | A. Tegur dengan suara biasa saja · B. Boleh tegur keras · C. Tidak boleh ada hukuman apapun |

```ts
{
  id: "B3.4",
  forNanny: {
    question: "Kamu pernah cubit atau marahi anak keras kalau nakal?",
    options: [
      { value: "a", label: "Tidak pernah" },
      { value: "b", label: "Pernah tapi sangat jarang" },
      { value: "c", label: "Kadang-kadang" },
    ],
  },
  forParent: {
    question: "Batas disiplin nanny ke anak yang kamu izinkan:",
    options: [
      { value: "a", label: "Tegur dengan suara biasa saja" },
      { value: "b", label: "Boleh tegur keras" },
      { value: "c", label: "Tidak boleh ada hukuman apapun" },
    ],
  },
}
```

---

**B3.5 — Tidur Bersama Anak**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu mau tidur bersama anak? | A. Siap tidur bersama anak setiap malam · B. Sehari-hari bersama anak, sesekali anak tidur dengan orang tua · C. Sehari-hari anak tidur dengan orang tua, siap kalau kondisi khusus · D. Menemani tidur siang saja, malam terpisah |
| **Ortu** | Kamu mau nanny tidur bersama anak? | A. Ya, setiap malam · B. Kebanyakan bersama nanny, sesekali dengan orang tua · C. Kebanyakan dengan orang tua, sesekali dengan nanny · D. Tidak perlu, anak tidur dengan orang tua |

```ts
{
  id: "B3.5",
  forNanny: {
    question: "Kamu mau tidur bersama anak?",
    options: [
      { value: "a", label: "Siap tidur bersama anak setiap malam" },
      { value: "b", label: "Sehari-hari bersama anak, sesekali anak tidur dengan orang tua" },
      { value: "c", label: "Sehari-hari anak tidur dengan orang tua, siap kalau kondisi khusus" },
      { value: "d", label: "Menemani tidur siang saja, malam terpisah" },
    ],
  },
  forParent: {
    question: "Kamu mau nanny tidur bersama anak?",
    options: [
      { value: "a", label: "Ya, setiap malam" },
      { value: "b", label: "Kebanyakan bersama nanny, sesekali dengan orang tua" },
      { value: "c", label: "Kebanyakan dengan orang tua, sesekali dengan nanny" },
      { value: "d", label: "Tidak perlu, anak tidur dengan orang tua" },
    ],
  },
}
```

---

**B3.6 — Ajak Anak Main & Belajar**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu mau aktif ajak anak main dan belajar, bukan cuma dijaga? | A. Ya, senang melakukannya · B. Bisa, kalau diminta · C. Lebih nyaman jaga saja |
| **Ortu** | Nanny diharapkan aktif ajak anak main dan belajar? | A. Ya, wajib · B. Kalau ada waktu saja · C. Tidak perlu, cukup dijaga |

```ts
{
  id: "B3.6",
  forNanny: {
    question: "Kamu mau aktif ajak anak main dan belajar, bukan cuma dijaga?",
    options: [
      { value: "a", label: "Ya, senang melakukannya" },
      { value: "b", label: "Bisa, kalau diminta" },
      { value: "c", label: "Lebih nyaman jaga saja" },
    ],
  },
  forParent: {
    question: "Nanny diharapkan aktif ajak anak main dan belajar?",
    options: [
      { value: "a", label: "Ya, wajib" },
      { value: "b", label: "Kalau ada waktu saja" },
      { value: "c", label: "Tidak perlu, cukup dijaga" },
    ],
  },
}
```

---

## Domain C — Pengalaman & Kemampuan Nanny

> Sebagian besar pertanyaan di Domain C hanya untuk Nanny. Kolom Orang Tua berisi ekspektasi terkait.

### C1 — Rekam Jejak Pengalaman (Bobot: Tinggi)

> 📌 *Implementasi: Domain C1 diisi bertahap seperti CV. Setiap entri pengalaman memunculkan pertanyaan lanjutan otomatis (pop-up/conditional block) sesuai usia anak yang pernah dijaga.*

---

**C1.1 — Pernah Jadi Nanny**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu pernah jadi nanny atau pengasuh sebelumnya? | A. Ya · B. Tidak (→ langsung ke C2) |
| **Ortu** | Pengalaman minimum yang kamu harapkan: | A. Tidak ada pengalaman pun tidak masalah · B. Minimal 1 tahun · C. Minimal 3 tahun |

```ts
{
  id: "C1.1",
  domain: "C",
  subdomain: "C1",
  subdomainLabel: "Rekam Jejak Pengalaman",
  weight: "Tinggi",
  forNanny: {
    question: "Kamu pernah jadi nanny atau pengasuh sebelumnya?",
    options: [
      { value: "a", label: "Ya" },
      { value: "b", label: "Tidak" },
    ],
  },
  forParent: {
    question: "Pengalaman minimum yang kamu harapkan dari nanny:",
    options: [
      { value: "a", label: "Tidak ada pengalaman pun tidak masalah" },
      { value: "b", label: "Minimal 1 tahun" },
      { value: "c", label: "Minimal 3 tahun" },
    ],
  },
  // Jika nanny pilih "b" (Tidak) → skip ke C2
}
```

---

**C1.2 — Usia Anak yang Pernah Dijaga**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Anak yang kamu jaga waktu itu usianya berapa? | A. 0–6 bulan · B. 6–12 bulan · C. 1–3 tahun · D. 3–6 tahun · E. 6 tahun ke atas |
| **Ortu** | Perlu punya pengalaman mengasuh anak dalam rentang usia anak yang akan dijaga? | A. Ya, wajib · B. Lebih baik pernah · C. Tidak perlu |

```ts
{
  id: "C1.2",
  forNanny: {
    question: "Anak yang kamu jaga waktu itu usianya berapa?",
    options: [
      { value: "a", label: "0–6 bulan" },
      { value: "b", label: "6–12 bulan" },
      { value: "c", label: "1–3 tahun" },
      { value: "d", label: "3–6 tahun" },
      { value: "e", label: "6 tahun ke atas" },
    ],
  },
  forParent: {
    question: "Nanny perlu punya pengalaman mengasuh anak dalam rentang usia yang sama?",
    options: [
      { value: "a", label: "Ya, wajib pernah" },
      { value: "b", label: "Lebih baik pernah, tapi tidak wajib" },
      { value: "c", label: "Tidak perlu" },
    ],
  },
  // Pop-up follow-up kondisional berdasarkan pilihan usia — lihat bagian POPUP di bawah
}
```

---

**C1.3 — Jenis Kelamin Anak yang Dijaga**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Anak yang dulu kamu jaga — laki-laki atau perempuan? | A. Laki-laki · B. Perempuan |
| **Ortu** | Perlu punya pengalaman mengasuh anak dengan jenis kelamin yang sama? | A. Ya, wajib · B. Lebih baik pernah · C. Tidak perlu |

```ts
{
  id: "C1.3",
  forNanny: {
    question: "Anak yang dulu kamu jaga — laki-laki atau perempuan?",
    options: [
      { value: "a", label: "Laki-laki" },
      { value: "b", label: "Perempuan" },
    ],
  },
  forParent: {
    question: "Nanny perlu punya pengalaman mengasuh anak dengan jenis kelamin yang sama?",
    options: [
      { value: "a", label: "Ya, wajib pernah" },
      { value: "b", label: "Lebih baik pernah, tapi tidak wajib" },
      { value: "c", label: "Tidak perlu" },
    ],
  },
}
```

---

**C1.4 — Durasi Kerja di Majikan Sebelumnya**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu kerja di sana berapa lama? | A. Kurang dari 3 bulan · B. 3–6 bulan · C. 6–12 bulan · D. Lebih dari 1 tahun |
| **Ortu** | — |

```ts
{
  id: "C1.4",
  forNanny: {
    question: "Kamu kerja di sana berapa lama?",
    options: [
      { value: "a", label: "Kurang dari 3 bulan" },
      { value: "b", label: "3–6 bulan" },
      { value: "c", label: "6–12 bulan" },
      { value: "d", label: "Lebih dari 1 tahun" },
    ],
  },
  forParent: null,
}
```

---

**C1.5 — Alasan Berhenti**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu berhenti dari sana karena apa? | A. Kontrak selesai · B. Pindah kota · C. Gaji kurang · D. Tidak cocok dengan keluarga · E. Alasan keluarga sendiri · F. Lainnya (free text) |
| **Ortu** | — |

```ts
{
  id: "C1.5",
  forNanny: {
    question: "Kamu berhenti dari sana karena apa?",
    options: [
      { value: "a", label: "Kontrak selesai" },
      { value: "b", label: "Pindah kota" },
      { value: "c", label: "Gaji kurang" },
      { value: "d", label: "Tidak cocok dengan keluarga" },
      { value: "e", label: "Alasan keluarga sendiri" },
      { value: "f", label: "Lainnya" },
    ],
    hasFreeText: true,
    freeTextTrigger: "f",
  },
  forParent: null,
}
```

---

**C1.6 — Referensi dari Majikan Lama**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Boleh kami hubungi majikan lama kamu sebagai referensi? | A. Ya, boleh · B. Tidak |
| **Ortu** | — |

```ts
{
  id: "C1.6",
  forNanny: {
    question: "Boleh kami hubungi majikan lama kamu sebagai referensi?",
    options: [
      { value: "a", label: "Ya, boleh" },
      { value: "b", label: "Tidak" },
    ],
  },
  forParent: null,
}
```

---

#### 🔔 Pop-up Kondisional — C1.2

Pop-up muncul **otomatis setelah nanny memilih rentang usia** di C1.2.

**Trigger: Nanny pilih "0–6 bulan"**
```ts
popupFollowUp: [
  {
    trigger: "a", // 0–6 bulan
    questions: [
      { question: "Kamu bisa buat atau panaskan susu formula?", options: [{ value: "ya", label: "Ya" }, { value: "tidak", label: "Tidak" }] },
      { question: "Kamu bisa mandikan bayi?", options: [{ value: "ya", label: "Ya" }, { value: "tidak", label: "Tidak" }] },
      { question: "Kamu bisa ganti popok?", options: [{ value: "ya", label: "Ya" }, { value: "tidak", label: "Tidak" }] },
      { question: "Kamu pernah tangani bayi yang kolik atau sering nangis malam?", options: [{ value: "ya", label: "Ya" }, { value: "tidak", label: "Tidak" }] },
    ],
  },
  {
    trigger: "b", // 6–12 bulan
    questions: [
      { question: "Kamu bisa buat MPASI (makanan pendamping ASI)?", options: [{ value: "ya", label: "Ya" }, { value: "tidak", label: "Tidak" }] },
      { question: "Kamu bisa bantu anak belajar duduk atau merangkak?", options: [{ value: "ya", label: "Ya" }, { value: "tidak", label: "Tidak" }] },
    ],
  },
  {
    trigger: "c", // 1–3 tahun
    questions: [
      { question: "Kamu bisa bantu latih anak toilet training?", options: [{ value: "ya", label: "Ya" }, { value: "tidak", label: "Tidak" }] },
      { question: "Kamu bisa ajak anak main sesuai usianya?", options: [{ value: "ya", label: "Ya" }, { value: "tidak", label: "Tidak" }] },
      { question: "Kamu bisa antar jemput anak ke sekolah atau les? (naik apa?)", options: [
          { value: "sepeda", label: "Sepeda" },
          { value: "sepeda_listrik", label: "Sepeda listrik" },
          { value: "motor", label: "Motor" },
          { value: "mobil", label: "Mobil" },
          { value: "tidak", label: "Tidak bisa antar jemput" },
      ]},
    ],
  },
  {
    trigger: "d", // 3–6 tahun
    questions: [
      { question: "Kamu bisa bantu anak belajar baca atau tulis dasar?", options: [{ value: "ya", label: "Ya" }, { value: "tidak", label: "Tidak" }] },
      { question: "Kamu bisa antar jemput anak ke sekolah atau les? (naik apa?)", options: [
          { value: "sepeda", label: "Sepeda" },
          { value: "sepeda_listrik", label: "Sepeda listrik" },
          { value: "motor", label: "Motor" },
          { value: "mobil", label: "Mobil" },
          { value: "tidak", label: "Tidak bisa antar jemput" },
      ]},
    ],
  },
]
```

---

### C2 — Kemampuan Praktis (Bobot: Tinggi)

---

**C2.1 — Kendaraan yang Bisa Dikendarai**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kendaraan apa yang kamu bisa naiki? | A. Sepeda · B. Sepeda listrik · C. Motor · D. Mobil · E. Tidak bisa mengendarai apapun |
| **Ortu** | Nanny perlu bisa mengendarai: | A. Motor (wajib) · B. Mobil (wajib) · C. Tidak perlu |

> 📌 *C2.1 dan C2.2 (SIM) digabung ke satu topik "Kendaraan" dan didekatkan dengan konteks antar jemput.*

```ts
{
  id: "C2.1",
  domain: "C",
  subdomain: "C2",
  subdomainLabel: "Kemampuan Praktis",
  weight: "Tinggi",
  forNanny: {
    question: "Kendaraan apa yang kamu bisa naiki?",
    options: [
      { value: "a", label: "Sepeda" },
      { value: "b", label: "Sepeda listrik" },
      { value: "c", label: "Motor" },
      { value: "d", label: "Mobil" },
      { value: "e", label: "Tidak bisa mengendarai apapun" },
    ],
  },
  forParent: {
    question: "Nanny perlu bisa mengendarai:",
    options: [
      { value: "a", label: "Motor (wajib)" },
      { value: "b", label: "Mobil (wajib)" },
      { value: "c", label: "Tidak perlu" },
    ],
  },
}
```

---

**C2.2 — SIM**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu punya SIM? | A. Ya, SIM A (mobil) · B. Ya, SIM C (motor) · C. Keduanya · D. Tidak punya |
| **Ortu** | Nanny perlu punya SIM? | A. Ya · B. Tidak perlu |

```ts
{
  id: "C2.2",
  forNanny: {
    question: "Kamu punya SIM?",
    options: [
      { value: "a", label: "Ya, SIM A (mobil)" },
      { value: "b", label: "Ya, SIM C (motor)" },
      { value: "c", label: "Keduanya" },
      { value: "d", label: "Tidak punya" },
    ],
  },
  forParent: {
    question: "Nanny perlu punya SIM?",
    options: [
      { value: "a", label: "Ya" },
      { value: "b", label: "Tidak perlu" },
    ],
  },
}
```

---

**C2.3 — Kemampuan Masak**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu bisa masak makanan pokok dan snack untuk anak? | A. Ya, bisa keduanya · B. Bisa masak, tapi tidak bisa buat snack · C. Terbatas, hanya masak sederhana · D. Tidak bisa masak |
| **Ortu** | Nanny perlu bisa masak? | A. Ya · B. Tidak perlu |

```ts
{
  id: "C2.3",
  forNanny: {
    question: "Kamu bisa masak makanan pokok dan snack untuk anak?",
    options: [
      { value: "a", label: "Ya, bisa keduanya" },
      { value: "b", label: "Bisa masak, tapi tidak bisa buat snack" },
      { value: "c", label: "Terbatas, hanya masak sederhana" },
      { value: "d", label: "Tidak bisa masak" },
    ],
  },
  forParent: {
    question: "Nanny perlu bisa masak?",
    options: [{ value: "a", label: "Ya" }, { value: "b", label: "Tidak perlu" }],
  },
}
```

---

**C2.4 — Baca & Ikuti Instruksi Tertulis**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu bisa baca tulisan dan ikuti instruksi tertulis? | A. Ya, lancar · B. Bisa tapi pelan · C. Lebih mudah dijelaskan langsung |
| **Ortu** | — |

```ts
{
  id: "C2.4",
  forNanny: {
    question: "Kamu bisa baca tulisan dan ikuti instruksi tertulis?",
    options: [
      { value: "a", label: "Ya, lancar" },
      { value: "b", label: "Bisa tapi pelan" },
      { value: "c", label: "Lebih mudah dijelaskan langsung" },
    ],
  },
  forParent: null,
}
```

---

**C2.5 — WhatsApp & Laporan Harian**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu bisa pakai WhatsApp dan kirim laporan harian? | A. Ya, lancar · B. Bisa tapi kadang perlu bantuan · C. Tidak bisa |
| **Ortu** | Cara laporan harian yang kamu mau: | A. Lewat aplikasi BundaYakin · B. WhatsApp · C. Lisan langsung · D. Tidak perlu laporan harian |

```ts
{
  id: "C2.5",
  forNanny: {
    question: "Kamu bisa pakai WhatsApp dan kirim laporan harian?",
    options: [
      { value: "a", label: "Ya, lancar" },
      { value: "b", label: "Bisa tapi kadang perlu bantuan" },
      { value: "c", label: "Tidak bisa" },
    ],
  },
  forParent: {
    question: "Cara laporan harian yang kamu mau:",
    options: [
      { value: "a", label: "Lewat aplikasi BundaYakin" },
      { value: "b", label: "WhatsApp" },
      { value: "c", label: "Lisan langsung" },
      { value: "d", label: "Tidak perlu laporan harian" },
    ],
  },
}
```

---

**C2.6 — Punya HP Sendiri**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu punya HP sendiri? | A. Ya · B. Tidak |
| **Ortu** | — |

```ts
{
  id: "C2.6",
  forNanny: {
    question: "Kamu punya HP sendiri?",
    options: [{ value: "a", label: "Ya" }, { value: "b", label: "Tidak" }],
  },
  forParent: null,
}
```

---

**C2.7 — Pengalaman Situasi Darurat**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu pernah tangani situasi darurat? (anak tersedak, demam tinggi, dll) | A. Ya, pernah dan tahu apa yang harus dilakukan · B. Pernah tapi tidak tahu harus bagaimana · C. Belum pernah |
| **Ortu** | — |

```ts
{
  id: "C2.7",
  forNanny: {
    question: "Kamu pernah tangani situasi darurat? (anak tersedak, demam tinggi, dll)",
    options: [
      { value: "a", label: "Ya, pernah dan tahu apa yang harus dilakukan" },
      { value: "b", label: "Pernah tapi tidak tahu harus bagaimana" },
      { value: "c", label: "Belum pernah" },
    ],
  },
  forParent: null,
}
```

---

**C2.8 — Kemampuan Bahasa**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu fasih bahasa apa? (pilih semua yang sesuai + level) | Indonesia / Inggris / Arab / Mandarin / Lainnya × [Tidak bisa · Listening saja · Bisa bicara sedikit · Lancar komunikasi sehari-hari · Lancar lisan dan tertulis] |
| **Ortu** | Ada bahasa khusus yang diharapkan dari nanny? | A. Tidak ada · B. Bahasa Inggris · C. Bahasa Arab · D. Bahasa Mandarin · E. Lainnya |

> 📌 *Pertanyaan bahasa ditambahkan dari catatan review (sebelumnya tidak ada di draft). Penting untuk keluarga expat atau yang menginginkan stimulasi bilingual.*

```ts
{
  id: "C2.8",
  forNanny: {
    question: "Kamu fasih bahasa apa? (pilih dan beri level untuk masing-masing)",
    // Implementasi: multi-select + level dropdown per bahasa
    options: [
      { value: "indonesia", label: "Bahasa Indonesia" },
      { value: "inggris", label: "Bahasa Inggris" },
      { value: "arab", label: "Bahasa Arab" },
      { value: "mandarin", label: "Bahasa Mandarin" },
      { value: "lain", label: "Lainnya" },
    ],
    // Level untuk setiap bahasa yang dipilih:
    // 1. Tidak bisa
    // 2. Listening saja
    // 3. Bisa bicara sedikit
    // 4. Lancar komunikasi sehari-hari
    // 5. Lancar lisan dan tertulis
  },
  forParent: {
    question: "Ada bahasa khusus yang diharapkan dari nanny?",
    options: [
      { value: "a", label: "Tidak ada persyaratan khusus" },
      { value: "b", label: "Bahasa Inggris" },
      { value: "c", label: "Bahasa Arab" },
      { value: "d", label: "Bahasa Mandarin" },
      { value: "e", label: "Lainnya" },
    ],
  },
}
```

---

**C2.9 — Punya Passport & Pengalaman Perjalanan**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu punya passport? | A. Ya · B. Tidak |
| **Ortu** | — |

```ts
{
  id: "C2.9",
  forNanny: {
    question: "Kamu punya passport?",
    options: [{ value: "a", label: "Ya" }, { value: "b", label: "Tidak" }],
  },
  forParent: null,
}
```

---

### C3 — Gaya Komunikasi & Keterbukaan (Bobot: Menengah)

---

**C3.1 — Respons saat Ada yang Aneh dengan Anak**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kalau ada sesuatu yang aneh dengan anak, kamu bagaimana? | A. Langsung lapor ke orang tua · B. Lihat dulu, kalau tidak membaik baru lapor · C. Tergantung situasinya |
| **Ortu** | Kamu mau nanny lapor kapan? | A. Segera saat ada sesuatu · B. Cukup di akhir hari · C. Tergantung situasi |

```ts
{
  id: "C3.1",
  domain: "C",
  subdomain: "C3",
  subdomainLabel: "Gaya Komunikasi & Keterbukaan",
  weight: "Menengah",
  forNanny: {
    question: "Kalau ada sesuatu yang aneh dengan anak, kamu bagaimana?",
    options: [
      { value: "a", label: "Langsung lapor ke orang tua" },
      { value: "b", label: "Lihat dulu sebentar, kalau tidak membaik baru lapor" },
      { value: "c", label: "Tergantung situasinya" },
    ],
  },
  forParent: {
    question: "Kamu mau nanny lapor kapan?",
    options: [
      { value: "a", label: "Segera saat ada sesuatu" },
      { value: "b", label: "Cukup di akhir hari" },
      { value: "c", label: "Tergantung situasi" },
    ],
  },
}
```

---

**C3.2 — Menerima Teguran dari Majikan**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu nyaman kalau cara kerjamu ditegur oleh majikan? | A. Ya, tidak masalah · B. Tidak masalah asal caranya baik · C. Agak tidak nyaman |
| **Ortu** | Kamu nyaman kasih masukan langsung ke nanny? | A. Ya, langsung saja · B. Lebih suka pelan-pelan · C. Lebih nyaman lewat tulisan |

```ts
{
  id: "C3.2",
  forNanny: {
    question: "Kamu nyaman kalau cara kerjamu ditegur oleh majikan?",
    options: [
      { value: "a", label: "Ya, tidak masalah" },
      { value: "b", label: "Tidak masalah asal caranya baik" },
      { value: "c", label: "Agak tidak nyaman" },
    ],
  },
  forParent: {
    question: "Kamu nyaman kasih masukan langsung ke nanny?",
    options: [
      { value: "a", label: "Ya, langsung saja" },
      { value: "b", label: "Lebih suka pelan-pelan" },
      { value: "c", label: "Lebih nyaman lewat tulisan" },
    ],
  },
}
```

---

**C3.3 — Laporan Harian**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu mau kasih laporan harian lewat mana? | A. Lewat aplikasi BundaYakin · B. Lewat WhatsApp · C. Lisan langsung · D. Tidak nyaman buat laporan harian |
| **Ortu** | Kamu mau pantau nanny lewat: | A. Aplikasi BundaYakin · B. WhatsApp · C. Lisan langsung · D. Tidak perlu laporan harian |

```ts
{
  id: "C3.3",
  forNanny: {
    question: "Kamu mau kasih laporan harian lewat mana?",
    options: [
      { value: "a", label: "Lewat aplikasi BundaYakin" },
      { value: "b", label: "Lewat WhatsApp" },
      { value: "c", label: "Lisan langsung" },
      { value: "d", label: "Tidak nyaman buat laporan harian" },
    ],
  },
  forParent: {
    question: "Kamu mau pantau nanny lewat:",
    options: [
      { value: "a", label: "Aplikasi BundaYakin" },
      { value: "b", label: "WhatsApp" },
      { value: "c", label: "Lisan langsung" },
      { value: "d", label: "Tidak perlu laporan harian" },
    ],
  },
}
```

---

### C4 — Kecocokan Lingkungan (Bobot: Menengah)

---

**C4.1 — Preferensi Lokasi Kerja** *(ditanya duluan sebelum soal pindah kota)*

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu mau kerja di area mana? | Bebas di mana saja / Isi nama kota/area (free text) |
| **Ortu** | Rumah di area mana? | Isi nama kota/area (free text) |

```ts
{
  id: "C4.1",
  domain: "C",
  subdomain: "C4",
  subdomainLabel: "Kecocokan Lingkungan",
  weight: "Menengah",
  forNanny: {
    question: "Kamu mau kerja di area mana?",
    options: [
      { value: "bebas", label: "Tidak ada preferensi / bebas di mana saja" },
      { value: "spesifik", label: "Ada preferensi area tertentu" },
    ],
    hasFreeText: true,
    freeTextTrigger: "spesifik",
  },
  forParent: {
    question: "Rumah kamu di area mana?",
    options: [],
    hasFreeText: true, // selalu free text
  },
}
```

---

**C4.2 — Bersedia Pindah Kota**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu bersedia pindah kota untuk kerja? | A. Ya, siap · B. Tidak, hanya di kota sendiri · C. Tergantung kotanya |
| **Ortu** | Posisi ini perlu nanny pindah kota? | A. Ya · B. Tidak |

```ts
{
  id: "C4.2",
  forNanny: {
    question: "Kamu bersedia pindah kota untuk kerja?",
    options: [
      { value: "a", label: "Ya, siap" },
      { value: "b", label: "Tidak, hanya di kota sendiri" },
      { value: "c", label: "Tergantung kotanya" },
    ],
  },
  forParent: {
    question: "Posisi ini perlu nanny pindah kota?",
    options: [{ value: "a", label: "Ya" }, { value: "b", label: "Tidak" }],
  },
}
```

---

**C4.3 — Alergi & Hewan Peliharaan**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu alergi sesuatu? | A. Bulu hewan · B. Debu · C. Makanan tertentu · D. Tidak ada alergi |
| **Ortu** | Di rumah ada hewan peliharaan? | A. Anjing (bebas berkeliaran) · B. Anjing (dikandang/terpisah) · C. Kucing (bebas berkeliaran) · D. Kucing (dikandang/terpisah) · E. Hewan lain · F. Tidak ada |

> 📌 *Pertanyaan hewan peliharaan dipisah antara anjing dan kucing (terkait halal/haram). Disertakan info apakah bebas berkeliaran atau dikandang.*

```ts
{
  id: "C4.3",
  forNanny: {
    question: "Kamu alergi sesuatu?",
    options: [
      { value: "a", label: "Bulu hewan" },
      { value: "b", label: "Debu" },
      { value: "c", label: "Makanan tertentu" },
      { value: "d", label: "Tidak ada alergi" },
    ],
  },
  forParent: {
    question: "Di rumah ada hewan peliharaan?",
    options: [
      { value: "a", label: "Anjing — bebas berkeliaran di rumah" },
      { value: "b", label: "Anjing — selalu dikandang/terpisah" },
      { value: "c", label: "Kucing — bebas berkeliaran di rumah" },
      { value: "d", label: "Kucing — selalu dikandang/terpisah" },
      { value: "e", label: "Hewan peliharaan lain" },
      { value: "f", label: "Tidak ada hewan peliharaan" },
    ],
  },
}
```

---

**C4.4 — Kenyamanan dengan Tamu**

| | Pertanyaan | Opsi |
|---|---|---|
| **Nanny** | Kamu nyaman kalau rumah sering ada tamu? | A. Ya, tidak masalah · B. Tidak terlalu nyaman · C. Tidak masalah |
| **Ortu** | Rumah sering ada tamu atau keluarga besar? | A. Sering · B. Kadang-kadang · C. Jarang |

```ts
{
  id: "C4.4",
  forNanny: {
    question: "Kamu nyaman kalau rumah sering ada tamu?",
    options: [
      { value: "a", label: "Ya, tidak masalah" },
      { value: "b", label: "Tidak terlalu nyaman" },
      { value: "c", label: "Tidak masalah" },
    ],
  },
  forParent: {
    question: "Rumah sering ada tamu atau keluarga besar?",
    options: [
      { value: "a", label: "Sering" },
      { value: "b", label: "Kadang-kadang" },
      { value: "c", label: "Jarang" },
    ],
  },
}
```

---

## Sistem Dealbreaker

### Cara Kerja
```ts
type DealBreakerRule = {
  questionId: string;
  markedBy: "nanny" | "parent" | "both";
  // Jika jawaban kedua pihak tidak cocok DAN pertanyaan ini di-dealbreaker:
  // → Sistem kirim notifikasi ke kedua pihak
  // → Bukan otomatis ditolak — ditandai untuk negosiasi
};
```

| Aturan | Keterangan |
|--------|------------|
| 1 | Setiap pertanyaan di atas bisa dicentang sebagai DEALBREAKER oleh orang tua atau nanny |
| 2 | Orang tua dan nanny bisa menambah PERTANYAAN CUSTOM di luar daftar ini |
| 3 | Pertanyaan custom juga bisa dijadikan dealbreaker |
| 4 | Jika pertanyaan custom dari satu pihak belum dijawab pihak lain → sistem kirim pertanyaan itu ke lawannya sebelum matching selesai |
| 5 | Jika dealbreaker tidak terpenuhi → notifikasi ke kedua pihak. Bukan otomatis ditolak — ditandai untuk negosiasi |
| 6 | Orang tua bisa adjust bobot domain (A/B/C) sesuai prioritas. Default: pengalaman & kondisi kerja bobotnya lebih tinggi |

### Custom Questions — UI Pattern
```ts
type CustomQuestion = {
  addedBy: "parent" | "nanny";
  questionText: string;
  answerType: "yes_no" | "multiple_choice" | "free_text";
  options?: string[];
  isDealbreaker: boolean;
};

// Contoh tampilan di platform:
// [Pertanyaan Custom dari Orang Tua]
// "Nanny harus siap tidur dengan anak setiap malam" → ☑ Dealbreaker
// [+ Tambah pertanyaan custom]
```

---

## Bobot Domain — Default Scoring

| Domain | Label | Bobot Default |
|--------|-------|---------------|
| A | Kondisi Kerja & Ekspektasi Praktis | 35% |
| B | Nilai, Kepercayaan & Gaya Hidup | 30% |
| C | Pengalaman & Kemampuan Nanny | 35% |

> Bobot dapat di-adjust oleh orang tua saat setup profil.

---

## Ringkasan: Jumlah Pertanyaan per Domain

| Domain | Sub-domain | Jumlah Pertanyaan |
|--------|------------|-------------------|
| A — Kondisi Kerja | A1 (Gaji, Libur & Fasilitas) | 10 |
| A — Kondisi Kerja | A2 (Lingkup & Tugas Kerja) | 6 |
| B — Nilai & Gaya Hidup | B1 (Agama & Kepercayaan) | 4 |
| B — Nilai & Gaya Hidup | B2 (Pakaian & Penampilan) | 5 |
| B — Nilai & Gaya Hidup | B3 (Gaya Pengasuhan) | 6 |
| C — Pengalaman & Kemampuan | C1 (Rekam Jejak) | 6 + pop-up kondisional |
| C — Pengalaman & Kemampuan | C2 (Kemampuan Praktis) | 9 |
| C — Pengalaman & Kemampuan | C3 (Gaya Komunikasi) | 3 |
| C — Pengalaman & Kemampuan | C4 (Kecocokan Lingkungan) | 4 |
| **Total** | | **53 pertanyaan utama** |

> Pop-up kondisional di C1.2 tidak dihitung sebagai pertanyaan utama — muncul otomatis berdasarkan pilihan usia anak.

---

## Catatan Implementasi untuk Claude Code

```
src/
├── lib/
│   └── survey/
│       ├── questions.ts          ← paste semua TypeScript di atas ke sini
│       ├── types.ts              ← SurveyQuestion, PopupFollowUp, DealBreakerRule
│       └── scoring.ts            ← logic matching score per domain
├── components/
│   └── survey/
│       ├── SurveyForm.tsx        ← form utama dengan progress bar
│       ├── QuestionCard.tsx      ← single question renderer
│       ├── DealBreakerToggle.tsx ← toggle per pertanyaan
│       ├── PopupFollowUp.tsx     ← conditional questions
│       └── CustomQuestion.tsx    ← custom question input
└── app/
    └── survey/
        ├── nanny/page.tsx        ← survey untuk nanny
        └── parent/page.tsx       ← survey untuk orang tua
```

### Progress Bar Logic
- Total langkah = jumlah domain yang aktif (A, B, C)
- Per domain: progress = pertanyaan terjawab / total pertanyaan domain
- Skip logic: C1 (jika nanny jawab "Tidak pernah" di C1.1 → lewati C1.2–C1.6)
- Pop-up kondisional tidak menggerakkan progress bar utama

### Matching Score Logic (dasar)
```ts
function calculateMatchScore(nannyAnswers: Record<string, string>, parentAnswers: Record<string, string>): number {
  let totalScore = 0;
  let totalWeight = 0;

  for (const question of questions) {
    const nannyAns = nannyAnswers[question.id];
    const parentAns = parentAnswers[question.id];
    if (!nannyAns || !parentAns) continue;

    const weight = question.weight === "Tinggi" ? 3 : question.weight === "Menengah" ? 2 : 1;
    const match = nannyAns === parentAns ? 1 : isCompatible(nannyAns, parentAns, question.id) ? 0.5 : 0;

    totalScore += match * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
}
```

> Fungsi `isCompatible()` didefinisikan per pertanyaan untuk handle kasus "hampir cocok"
> (misal: nanny mau gaji Rp 3–4 juta, ortu budget Rp 3–4 juta → 1.0; nanny mau Rp 4–5 juta, ortu budget Rp 3–4 juta → 0.5)
