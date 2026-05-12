"use client"

import { useState, useEffect, useCallback } from "react"
import { SURVEY_QUESTIONS, ASPECT_META } from "@/constants/survey-questions"
import type { SurveyQuestion, QuestionSide } from "@/constants/survey-questions"
import type { SurveyAnswers } from "@/types/survey"

export type { SurveyAnswers }

type Props = {
  role: "PARENT" | "NANNY"
  storageKey: string
  onSubmit?: (answers: SurveyAnswers) => Promise<void>
  onProgress?: (answers: SurveyAnswers) => void
}

type CustomQ = { text: string; isDealbreaker: boolean }

const ASPECT_ORDER = ["A1", "A2", "B1", "B2", "B3", "C1", "C2", "C3", "C4"] as const

function getSide(q: SurveyQuestion, role: "PARENT" | "NANNY"): QuestionSide | null {
  return role === "PARENT" ? q.forParent : q.forNanny
}

function getVisibleQuestions(role: "PARENT" | "NANNY", answers: SurveyAnswers): SurveyQuestion[] {
  const skipC1Detail = role === "NANNY" && answers["C1.1"]?.value === "b"
  const c1DetailIds = ["C1.2", "C1.3", "C1.4", "C1.5", "C1.6"]
  return SURVEY_QUESTIONS.filter(q => {
    if (role === "PARENT" && q.forParent === null) return false
    if (skipC1Detail && c1DetailIds.includes(q.id)) return false
    return true
  })
}

function showFreeText(side: QuestionSide, value: string | undefined): boolean {
  if (!side.hasFreeText) return false
  if (side.options.length === 0) return true
  if (!value) return false
  return side.freeTextTriggers ? side.freeTextTriggers.includes(value) : false
}

export default function SurveyForm({ role, storageKey, onSubmit, onProgress }: Props) {
  const [answers, setAnswers] = useState<SurveyAnswers>({})
  const [customQ, setCustomQ] = useState<Record<string, CustomQ>>({})
  const [currentAspectIdx, setCurrentAspectIdx] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.answers) setAnswers(parsed.answers)
        if (parsed.customQ) setCustomQ(parsed.customQ)
        if (typeof parsed.currentAspectIdx === "number") setCurrentAspectIdx(parsed.currentAspectIdx)
        if (parsed.isSubmitted) setIsSubmitted(true)
      }
    } catch {}
    setLoaded(true)
  }, [storageKey])

  const persist = useCallback(
    (a: SurveyAnswers, cq: Record<string, CustomQ>, idx: number) => {
      localStorage.setItem(storageKey, JSON.stringify({ answers: a, customQ: cq, currentAspectIdx: idx }))
    },
    [storageKey]
  )

  const visibleQuestions = getVisibleQuestions(role, answers)
  const totalQuestions = visibleQuestions.length
  const totalAnswered = visibleQuestions.filter(q => {
    const a = answers[q.id]
    if (!a) return false
    const side = getSide(q, role)
    if (side?.options.length === 0 && side?.hasFreeText) return !!a.freeText?.trim()
    return !!a.value
  }).length
  const progressPct = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0

  const aspects = ASPECT_ORDER
    .map(a => ({
      key: a,
      ...ASPECT_META[a],
      questions: visibleQuestions.filter(q => q.subdomain === a),
    }))
    .filter(a => a.questions.length > 0)

  const currentAspect = aspects[currentAspectIdx] ?? aspects[0]
  const isLastAspect = currentAspectIdx === aspects.length - 1

  function isAspectDone(idx: number) {
    const asp = aspects[idx]
    if (!asp) return false
    return asp.questions.every(q => {
      const a = answers[q.id]
      const side = getSide(q, role)
      if (side?.options.length === 0 && side?.hasFreeText) return !!a?.freeText?.trim()
      return !!a?.value
    })
  }

  const doneCount = aspects.slice(0, currentAspectIdx).filter((_, i) => isAspectDone(i)).length

  function handleAnswer(id: string, value: string) {
    const prev = answers[id]
    const next: SurveyAnswers = {
      ...answers,
      [id]: {
        value,
        freeText: prev?.freeText,
        isDealbreaker: prev?.isDealbreaker ?? false,
        popupAnswers: prev?.value === value ? prev?.popupAnswers : undefined,
      },
    }
    setAnswers(next)
    persist(next, customQ, currentAspectIdx)
  }

  function handleFreeText(id: string, text: string) {
    const prev = answers[id]
    const q = SURVEY_QUESTIONS.find(q => q.id === id)
    const side = q ? getSide(q, role) : null
    const isAlwaysText = side?.options.length === 0 && side?.hasFreeText
    const next: SurveyAnswers = {
      ...answers,
      [id]: {
        value: isAlwaysText ? (text.trim() ? "__text__" : "") : (prev?.value ?? ""),
        freeText: text,
        isDealbreaker: prev?.isDealbreaker ?? false,
        popupAnswers: prev?.popupAnswers,
      },
    }
    setAnswers(next)
    persist(next, customQ, currentAspectIdx)
  }

  function handlePopupAnswer(parentId: string, triggerValue: string, qIdx: number, value: string) {
    const prev = answers[parentId]
    const next: SurveyAnswers = {
      ...answers,
      [parentId]: {
        ...prev,
        value: prev?.value ?? "",
        isDealbreaker: prev?.isDealbreaker ?? false,
        popupAnswers: {
          ...prev?.popupAnswers,
          [`${triggerValue}_${qIdx}`]: value,
        },
      },
    }
    setAnswers(next)
    persist(next, customQ, currentAspectIdx)
  }

  function toggleDealbreaker(id: string) {
    const prev = answers[id]
    if (!prev) return
    const next: SurveyAnswers = {
      ...answers,
      [id]: { ...prev, isDealbreaker: !prev.isDealbreaker },
    }
    setAnswers(next)
    persist(next, customQ, currentAspectIdx)
  }

  function setCustomQField(key: string, field: keyof CustomQ, value: string | boolean) {
    const next = { ...customQ, [key]: { ...customQ[key], text: customQ[key]?.text ?? "", isDealbreaker: customQ[key]?.isDealbreaker ?? false, [field]: value } }
    setCustomQ(next)
    persist(answers, next, currentAspectIdx)
  }

  function handleNext() {
    if (currentAspectIdx < aspects.length - 1) {
      const next = currentAspectIdx + 1
      setCurrentAspectIdx(next)
      persist(answers, customQ, next)
      window.scrollTo({ top: 0, behavior: "smooth" })
      onProgress?.(answers)
    }
  }

  function handleBack() {
    if (currentAspectIdx > 0) {
      const prev = currentAspectIdx - 1
      setCurrentAspectIdx(prev)
      persist(answers, customQ, prev)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  function handleSaveDraft() {
    persist(answers, customQ, currentAspectIdx)
    onProgress?.(answers)
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    try {
      if (onSubmit) await onSubmit(answers)
      setIsSubmitted(true)
      localStorage.setItem(
        storageKey,
        JSON.stringify({ answers, customQ, currentAspectIdx, isSubmitted: true, submittedAt: new Date().toISOString() })
      )
    } catch (err) {
      console.error("[SurveyForm] submit error", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!loaded) {
    return (
      <div className="px-4 pt-6 max-w-[480px] mx-auto space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white border border-[#E0D0F0] rounded-[16px] p-4 h-44 animate-pulse" />
        ))}
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="px-4 pt-16 max-w-[480px] mx-auto text-center">
        <div className="w-16 h-16 bg-[#E5F6F4] rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5BBFB0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <p className="font-[var(--font-dm-serif)] text-[24px] text-[#5A3A7A] mb-2">Preferensi Terkirim!</p>
        <p className="text-[14px] text-[#666666] mb-1">{totalAnswered} dari {totalQuestions} pertanyaan dijawab</p>
        <p className="text-[12px] text-[#999AAA] mt-3 leading-relaxed">
          {role === "NANNY"
            ? "Terima kasih! Jawaban kamu akan digunakan untuk proses matching dengan keluarga."
            : "Terima kasih! Kami akan mencocokkan Anda dengan nanny yang paling sesuai."}
        </p>
        {totalAnswered < totalQuestions && (
          <button
            onClick={() => {
              setIsSubmitted(false)
              const idx = aspects.findIndex(a => a.questions.some(q => !answers[q.id]?.value))
              if (idx >= 0) setCurrentAspectIdx(idx)
            }}
            className="mt-6 text-[13px] text-[#5BBFB0] font-semibold underline"
          >
            Lengkapi pertanyaan yang belum dijawab
          </button>
        )}
      </div>
    )
  }

  const pillBase = role === "NANNY"
    ? "px-4 py-2 min-h-[44px] rounded-full border-[1.5px] text-[13px] font-medium transition-all cursor-pointer"
    : "px-4 py-2 min-h-[44px] rounded-full border-[1.5px] text-[13px] font-medium transition-all cursor-pointer"

  const pillActive = role === "NANNY"
    ? "bg-[#F3EEF8] text-[#5A3A7A] border-[#A97CC4] font-semibold"
    : "bg-[#E5F6F4] text-[#1E4A45] border-[#5BBFB0] font-semibold"

  const pillInactive = "bg-white text-[#666666] border-[#C8B8DC] hover:border-[#A97CC4]"

  return (
    <div className="max-w-[480px] mx-auto px-4 pb-28">

      {/* Sticky progress header */}
      <div className="sticky top-0 z-10 bg-[#FDFBFF] pt-2 pb-3 -mx-4 px-4 border-b border-[#F3EEF8]">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold tracking-[1.5px] uppercase text-[#999AAA]">
            Isi preferensi
          </p>
          <span className="text-[11px] font-bold text-[#5BBFB0]">
            {totalAnswered} / {totalQuestions}
          </span>
        </div>
        <div className="bg-[#E0D0F0] rounded-full h-[6px] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%`, background: role === "NANNY" ? "#A97CC4" : "#5BBFB0" }}
          />
        </div>
      </div>

      {/* Section header */}
      <div className="border-b border-[#E0D0F0] pb-3 mb-4 mt-4">
        <h2 className="text-[16px] font-bold text-[#5A3A7A]">
          Isi preferensi — Bagian {currentAspectIdx + 1} dari {aspects.length}
        </h2>
        <p className="text-[12px] text-[#999AAA] mt-0.5">{currentAspect?.label}</p>
      </div>

      {/* Gamification card — shown after first section */}
      {currentAspectIdx > 0 && (
        <div className="bg-[#FEF0E7] border-[1.5px] border-[#F5C4A0] rounded-[14px] p-3.5 mb-3.5 text-center">
          <p className="font-[var(--font-dm-serif)] text-[15px] text-[#A35320] mb-1">
            {doneCount > 0
              ? `Bagian ${doneCount} selesai, tinggal ${aspects.length - doneCount} lagi!`
              : `Lanjutkan — sudah di bagian ${currentAspectIdx + 1}!`}
          </p>
          <p className="text-[12px] text-[#999AAA] mb-2.5">Semakin lengkap diisi, semakin akurat hasilnya</p>
          <div className="flex gap-[5px] mb-2.5">
            {aspects.map((_, i) => {
              const done = isAspectDone(i)
              const isCurrent = i === currentAspectIdx
              return (
                <div
                  key={i}
                  className="flex-1 h-[6px] rounded-full"
                  style={{
                    background: done ? "#E07B39" : isCurrent ? "#F5C4A0" : "#E0D0F0"
                  }}
                />
              )
            })}
          </div>
          <div className="flex gap-1.5 justify-center flex-wrap">
            <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border-[1.5px] ${doneCount >= 1 ? "bg-[#E07B39] text-white border-[#E07B39]" : "border-[#F5C4A0] text-[#A35320]"}`}>
              Mulai {doneCount >= 1 ? "✓" : ""}
            </span>
            <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border-[1.5px] ${doneCount >= Math.ceil(aspects.length / 2) ? "bg-[#E07B39] text-white border-[#E07B39]" : "border-[#F5C4A0] text-[#A35320]"}`}>
              50% selesai
            </span>
            <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border-[1.5px] ${doneCount >= aspects.length ? "bg-[#E07B39] text-white border-[#E07B39]" : "border-[#F5C4A0] text-[#A35320]"}`}>
              Profil lengkap
            </span>
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-3.5 mb-3.5">
        {currentAspect?.questions.map((q, qIdx) => {
          const side = getSide(q, role)
          if (!side) return null

          const answer = answers[q.id]
          const isAlwaysText = side.options.length === 0 && side.hasFreeText
          const showFreeInput = showFreeText(side, answer?.value)
          const activePopup = q.popupFollowUp?.find(p => p.trigger === answer?.value)
          const isAnswered = isAlwaysText ? !!answer?.freeText?.trim() : !!answer?.value

          return (
            <div key={q.id}>
              <p className="text-[13px] font-semibold text-[#5A3A7A] mb-2">
                {qIdx + 1}. {side.question}
              </p>

              {isAlwaysText ? (
                <textarea
                  value={answer?.freeText ?? ""}
                  onChange={e => handleFreeText(q.id, e.target.value)}
                  placeholder="Ketik jawaban di sini..."
                  rows={2}
                  className="w-full border-[1.5px] border-[#C8B8DC] rounded-[10px] px-3.5 py-2.5 text-[14px] text-[#5A3A7A] placeholder:text-[#999AAA] focus:outline-none focus:border-[#5BBFB0] resize-none min-h-[72px]"
                />
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {side.options.map(opt => {
                      const selected = answer?.value === opt.value
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleAnswer(q.id, opt.value)}
                          className={`${pillBase} ${selected ? pillActive : pillInactive}`}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>

                  {showFreeInput && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={answer?.freeText ?? ""}
                        onChange={e => handleFreeText(q.id, e.target.value)}
                        placeholder="Ceritakan lebih lanjut..."
                        className="w-full border-[1.5px] border-[#C8B8DC] rounded-[10px] px-3.5 py-2.5 text-[14px] text-[#5A3A7A] placeholder:text-[#999AAA] focus:outline-none focus:border-[#5BBFB0] min-h-[48px]"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Popup follow-up */}
              {activePopup && (
                <div className="mt-3 pl-3 border-l-2 border-[#E0D0F0] space-y-3">
                  <p className="text-[10px] font-bold text-[#A97CC4] uppercase tracking-wider mb-2">
                    Pertanyaan lanjutan
                  </p>
                  {activePopup.questions.map((pq, pIdx) => {
                    const popKey = `${answer!.value}_${pIdx}`
                    const popVal = answer?.popupAnswers?.[popKey]
                    return (
                      <div key={pIdx} className="bg-[#FDFBFF] border border-[#E0D0F0] rounded-[12px] p-3">
                        <p className="text-[13px] font-semibold text-[#5A3A7A] mb-2">{pq.question}</p>
                        <div className="flex gap-2 flex-wrap">
                          {pq.options.map(opt => {
                            const sel = popVal === opt.value
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => handlePopupAnswer(q.id, answer!.value, pIdx, opt.value)}
                                className={`${pillBase} ${sel ? pillActive : pillInactive}`}
                              >
                                {opt.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Dealbreaker checkbox */}
              {q.canBeDealbreaker && isAnswered && (
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!answer?.isDealbreaker}
                    onChange={() => toggleDealbreaker(q.id)}
                    className="w-4 h-4 accent-[#C75D5D] cursor-pointer"
                  />
                  <span className="text-[12px] text-[#C75D5D] font-medium">
                    Ini syarat mutlak — tidak bisa dikompromikan
                  </span>
                </label>
              )}
            </div>
          )
        })}
      </div>

      {/* Custom question card */}
      <div className="bg-[#FEF0E7] border-[1.5px] border-[#F5C4A0] rounded-[16px] p-3.5 mb-3.5">
        <p className="text-[12px] font-bold text-[#A35320] mb-1.5">+ Tambah pertanyaan sendiri</p>
        <textarea
          value={customQ[currentAspect?.key]?.text ?? ""}
          onChange={e => setCustomQField(currentAspect?.key, "text", e.target.value)}
          placeholder="Mis: Nanny harus bisa berbahasa Inggris dasar"
          rows={2}
          className="w-full text-[13px] px-3 py-2.5 border-[1.5px] border-[#F5C4A0] rounded-[10px] bg-transparent placeholder:text-[#F5C4A0] text-[#666666] focus:outline-none focus:border-[#E07B39] resize-none min-h-[56px]"
        />
        <label className="flex items-center gap-2 mt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!customQ[currentAspect?.key]?.isDealbreaker}
            onChange={e => setCustomQField(currentAspect?.key, "isDealbreaker", e.target.checked)}
            className="w-4 h-4 accent-[#C75D5D] cursor-pointer"
          />
          <span className="text-[12px] text-[#C75D5D] font-medium">Jadikan syarat mutlak</span>
        </label>
      </div>

      {/* Autosave notice */}
      <div className="bg-[#F3EEF8] rounded-[10px] px-3 py-2.5 mb-3.5">
        <p className="text-[12px] text-[#999AAA]">
          Jawaban tersimpan otomatis setiap klik · bisa ditinggal dan dilanjutkan kapan saja
        </p>
      </div>

      {/* Navigation buttons */}
      <div className="space-y-2">
        {isLastAspect ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] disabled:bg-[#C8E8E5] text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all"
          >
            {isSubmitting
              ? "Mengirim..."
              : totalAnswered < totalQuestions
              ? `Kirim preferensi (${totalQuestions - totalAnswered} belum dijawab)`
              : "Kirim preferensi →"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="w-full flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all"
          >
            Bagian {currentAspectIdx + 1} selesai — lanjut →
          </button>
        )}
        <button
          type="button"
          onClick={handleSaveDraft}
          className="w-full flex items-center justify-center bg-transparent border-[1.5px] border-[#C8B8DC] text-[#666666] font-semibold text-[13px] min-h-[48px] rounded-[10px] hover:bg-[#F3EEF8] transition-all"
        >
          Simpan &amp; lanjutkan nanti
        </button>
        {currentAspectIdx > 0 && (
          <button
            type="button"
            onClick={handleBack}
            className="w-full flex items-center justify-center text-[#999AAA] text-[13px] min-h-[40px] transition-all hover:text-[#5A3A7A]"
          >
            ← Kembali ke bagian sebelumnya
          </button>
        )}
      </div>

      {/* Section dots nav */}
      <div className="flex items-center justify-center gap-1.5 mt-4 mb-6">
        {aspects.map((a, i) => {
          const done = isAspectDone(i)
          const current = i === currentAspectIdx
          return (
            <button
              key={a.key}
              type="button"
              title={a.label}
              onClick={() => {
                setCurrentAspectIdx(i)
                persist(answers, customQ, i)
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
              className={`rounded-full transition-all ${
                current
                  ? "w-6 h-2.5 bg-[#5BBFB0]"
                  : done
                  ? "w-2.5 h-2.5 bg-[#5BBFB0]"
                  : "w-2.5 h-2.5 bg-[#E0D0F0]"
              }`}
            />
          )
        })}
      </div>

    </div>
  )
}
