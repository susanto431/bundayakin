# ADR-005 — Claude API sebagai AI Engine untuk Matching

**Status:** Accepted  
**Tanggal:** Mei 2026  
**Decider:** Apin (bisnis + psikologi) + Developer (teknis)

---

## Konteks

BundaYakin membutuhkan AI untuk:

1. **Scoring matching Layer 1** — menganalisis jawaban survey paralel dari orang tua dan nanny, menghasilkan skor kecocokan per domain (A, B, C) dan narasi laporan
2. **Psikotes AI Layer 2** — menginterpretasikan hasil tes kepribadian dan sikap kerja nanny
3. **Ringkasan evaluasi** — membuat AI summary dari evaluasi berkala
4. **Sosmed screening** — ringkasan profil sosial media nanny dari sumber publik
5. **Cache skor direktori** — pre-compute skor nanny vs orang tua untuk Fasa 2 (MatchResult)

Kebutuhan kritis:
- Output **terstruktur dan konsisten** (JSON) — bukan free text saja
- Kemampuan memahami **konteks psikologi** dan nuansa nilai/gaya hidup
- Kemampuan bahasa Indonesia yang sangat baik
- Output yang bisa **dijelaskan ke user** (bukan black box)

---

## Opsi yang Dipertimbangkan

1. **Claude API (Anthropic)** — claude-sonnet-4-6, kemampuan reasoning tinggi
2. **GPT-4o (OpenAI)** — matang, ekosistem besar
3. **Gemini Pro (Google)** — multimodal, terintegrasi dengan Google Cloud
4. **Rule-based scoring** — tidak pakai LLM, algoritma scoring statis
5. **Hybrid** — rule-based untuk scoring angka + LLM untuk narasi

---

## Keputusan

**Dipilih: Claude API (Anthropic) — claude-sonnet-4-6**

Alasan:
- **Reasoning kualitas tinggi** — Claude sangat baik dalam menganalisis nuansa, konteks, dan memberikan penjelasan yang coherent
- **Bahasa Indonesia** — performa Claude dalam Bahasa Indonesia sangat baik (penting untuk laporan yang dibaca user)
- **Structured output** — mendukung output JSON terstruktur via tool use atau response format, penting untuk scoring yang konsisten
- **Context window besar** — bisa handle seluruh survey (53+ pertanyaan dengan jawaban) dalam satu prompt
- **Platform development tool** — seluruh codebase dikerjakan dengan Claude Code, familiaritas dengan API sangat tinggi
- **Keamanan dan privasi** — Anthropic punya kebijakan privasi yang kuat untuk data sensitif

Kenapa bukan rule-based scoring:
- Scoring psikologis membutuhkan interpretasi konteks, bukan hanya matching nilai
- "Saya sholat 5 waktu" vs "Saya tidak terlalu religious" perlu dipahami secara kontekstual, bukan match string
- Free text pada pertanyaan custom tidak bisa di-rule berdasarkan

---

## Konsekuensi

**Positif:**
- Laporan kecocokan bisa bernuansa dan personal — bukan hanya angka
- Free text dari user bisa diproses dengan baik (kondisi khusus, pertanyaan custom)
- Psikotes AI bisa memberikan interpretasi yang lebih kaya dari sekadar skor

**Negatif / Trade-off:**
- **Biaya per request** — setiap matching menghabiskan token, perlu cost monitoring
- **Latensi** — API call ke Claude bisa 2–10 detik, perlu UI loading state yang baik
- **Non-deterministic** — dua run dengan prompt sama bisa menghasilkan narasi berbeda (skor angka lebih konsisten dengan structured output)
- **Vendor dependency** — jika Anthropic naik harga atau ganti kebijakan, perlu migrasi

**Strategi mitigasi biaya:**
- Cache hasil scoring di `MatchingResult` dan `MatchResult` — tidak re-run Claude untuk request yang sama
- Batch pre-compute skor direktori (MatchResult) saat load rendah
- Monitor token usage per request

**Batasan yang harus dikomunikasikan ke user:**
- AI tidak menggantikan penilaian manusia — ini alat bantu, bukan verdict final
- Skor bisa tidak sempurna, ada mekanisme appeal (lihat [AI Governance](../09_ai_governance.md))
- Data tidak digunakan untuk training model (sesuai kebijakan Anthropic API)

---

## Catatan

- Integrasi ada di `apps/web/src/lib/claude.ts`
- Prompt templates ada di `apps/web/src/lib/prompts/`
- Model default: `claude-sonnet-4-6` (bisa diupdate ke versi lebih baru)
- Semua AI output disimpan di database (`aiRawOutput` field) untuk audit dan debug
- Lihat [AI Governance Document](../09_ai_governance.md) untuk kebijakan penggunaan AI lengkap
