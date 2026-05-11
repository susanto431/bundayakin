# API.md — BundaYakin API Reference
> Dokumentasi semua endpoint API. Update setiap kali ada route baru.

---

## Konvensi Response

Semua endpoint mengembalikan format yang sama:

```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: string }
```

HTTP status codes:
- `200` — OK
- `201` — Created
- `400` — Bad Request (validasi gagal)
- `401` — Unauthorized (tidak login)
- `403` — Forbidden (role salah)
- `404` — Not Found
- `500` — Internal Server Error

---

## Auth

### `GET/POST /api/auth/[...nextauth]`
NextAuth v5 handler. Dihandle otomatis oleh NextAuth.

### `POST /api/auth/register`
Registrasi user baru.

**Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "PARENT" | "NANNY",
  "phone": "string?"
}
```

---

## User

### `GET /api/user/profile`
Ambil profil user yang sedang login (parent atau nanny).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "role": "PARENT" | "NANNY",
    "parentProfile": { ... } | null,
    "nannyProfile": { ... } | null
  }
}
```

### `PATCH /api/user/profile`
Update profil user.

---

## Parent — Children

### `GET /api/parent/children`
Ambil semua profil anak milik parent yang login.

### `POST /api/parent/children`
Tambah profil anak baru.

**Body:**
```json
{
  "name": "string",
  "dateOfBirth": "ISO date string",
  "ageGroup": "INFANT_0_6M" | "INFANT_6_12M" | "TODDLER_1_3Y" | "PRESCHOOL_3_6Y",
  "gender": "string?",
  "allergies": "string?",
  "medicalNotes": "string?",
  "schedule": "string?"
}
```

### `PATCH /api/parent/children/[id]`
Update profil anak.

### `DELETE /api/parent/children/[id]`
Hapus profil anak.

---

## Matching

### `POST /api/matching/start`
Buat MatchingRequest baru (parent mulai proses matching).

**Body:**
```json
{
  "nannyProfileId": "string?",
  "layer": "LAYER_1",
  "nannyTypeRequested": "LIVE_IN" | "LIVE_OUT" | "INFAL" | "TEMPORARY",
  "workScopeRequested": "CHILD_ONLY" | "CHILD_AND_ELDERLY" | "HOUSEHOLD_INCLUDED",
  "startDateRequested": "ISO date string?"
}
```

### `POST /api/matching/survey`
Simpan jawaban survey (bisa parent atau nanny).

**Body:**
```json
{
  "matchingRequestId": "string",
  "respondentRole": "PARENT" | "NANNY",
  "responses": [
    {
      "questionId": "string",
      "answerValue": "string?",
      "answerText": "string?",
      "isDealbreaker": false
    }
  ]
}
```

### `POST /api/matching/result`
Trigger AI scoring. Dipanggil setelah kedua pihak selesai survey.

**Body:**
```json
{
  "matchingRequestId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "scoreOverall": 87,
    "scoreDomainA": 90,
    "scoreDomainB": 85,
    "scoreDomainC": 82,
    "matchHighlights": ["string"],
    "mismatchAreas": ["string"],
    "negotiationPoints": ["string"],
    "tipsForParent": ["string"],
    "tipsForNanny": ["string"]
  }
}
```

---

## Evaluation

### `GET /api/evaluation`
Ambil semua evaluasi milik user yang login.

**Query params:**
- `assignmentId` — filter per assignment
- `timing` — filter: `WEEK_1`, `WEEK_2`, `MONTH_1`, `MONTH_3`

### `POST /api/evaluation`
Submit jawaban evaluasi.

**Body:**
```json
{
  "evaluationId": "string",
  "respondentRole": "PARENT" | "NANNY",
  "scores": { "key": "number" },
  "narrative": "string?",
  "continue": true
}
```

---

## Payment

### `POST /api/payment/midtrans`
Buat transaksi Midtrans Snap.

**Body:**
```json
{
  "type": "SUBSCRIPTION" | "ADDON_PSIKOTES" | "ADDON_PSIKOLOG" | "ADDON_TRACK_RECORD",
  "nannyProfileId": "string?"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "midtrans-snap-token",
    "orderId": "string",
    "amount": 500000
  }
}
```

### `POST /api/payment/webhook`
Webhook dari Midtrans. Diproteksi dengan signature key verification.

**Auto-update:**
- Status transaksi
- Status subscription (jika type SUBSCRIPTION)
- Grant akses add-on

---

## Notifications

### `GET /api/notifications`
Ambil notifikasi user yang login.

**Query params:**
- `unreadOnly=true` — hanya yang belum dibaca

### `PATCH /api/notifications/[id]`
Mark notifikasi sebagai sudah dibaca.

### `PATCH /api/notifications/read-all`
Mark semua notifikasi sebagai sudah dibaca.

---

## Email

### `POST /api/email`
Kirim email via Resend.

**Body:**
```json
{
  "type": "WELCOME" | "EVALUATION_REMINDER" | "MATCHING_READY" | "PAYMENT_SUCCESS",
  "to": "email@example.com",
  "data": { ... }
}
```

---

## Claude AI (Internal)

Dipanggil dari `src/lib/claude.ts`, bukan exposed sebagai public API.

### Matching Scoring Prompt
```typescript
// Model: claude-sonnet-4-20250514
// Max tokens: 2000
// Output: JSON dengan scoreOverall, scoreDomainA/B/C, breakdown, highlights, tips
```

Format instruksi di system prompt:
- Bahasa Indonesia
- Output HANYA JSON, tanpa teks tambahan
- Skor 0–100 per domain dan overall
- Framing positif — tidak ada bahasa menghakimi
- Dealbreaker mismatch = "perlu didiskusikan", bukan "tidak cocok"
