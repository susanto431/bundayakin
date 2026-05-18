"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type RecorderPhase = "starting" | "preview" | "recording" | "playback" | "error"

type Props = {
  onCapture: (file: File) => void
  onCancel: () => void
}

function pickMimeType(): string {
  const candidates = [
    "video/mp4",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ]
  for (const t of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) return t
  }
  return ""
}

function mimeToExt(mime: string): string {
  if (mime.startsWith("video/mp4")) return "mp4"
  return "webm"
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, "0")}`
}

export default function VideoRecorder({ onCapture, onCancel }: Props) {
  const liveRef = useRef<HTMLVideoElement>(null)
  const playbackRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recordedUrlRef = useRef<string | null>(null)

  const [phase, setPhase] = useState<RecorderPhase>("starting")
  const [seconds, setSeconds] = useState(0)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const startCamera = useCallback(
    async (facing: "user" | "environment" = facingMode) => {
      stopStream()
      setPhase("starting")
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        })
        streamRef.current = stream
        if (liveRef.current) {
          liveRef.current.srcObject = stream
          await liveRef.current.play()
        }
        setPhase("preview")
      } catch {
        setErrorMsg("Tidak bisa mengakses kamera. Pastikan izin kamera sudah diberikan di browser.")
        setPhase("error")
      }
    },
    [facingMode, stopStream]
  )

  useEffect(() => {
    startCamera()
    return () => {
      stopStream()
      if (timerRef.current) clearInterval(timerRef.current)
      if (recordedUrlRef.current) URL.revokeObjectURL(recordedUrlRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Set playback src after React renders the playback video element
  useEffect(() => {
    if (phase === "playback" && recordedUrlRef.current && playbackRef.current) {
      playbackRef.current.src = recordedUrlRef.current
      playbackRef.current.play().catch(() => {})
    }
  }, [phase])

  function startRecording() {
    if (!streamRef.current) return
    const mimeType = pickMimeType()
    chunksRef.current = []

    const recorder = new MediaRecorder(streamRef.current, mimeType ? { mimeType } : undefined)
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType || "video/webm" })
      const url = URL.createObjectURL(blob)
      recordedUrlRef.current = url
      setRecordedBlob(blob)
      setPhase("playback")
    }
    recorder.start(500)
    recorderRef.current = recorder
    setSeconds(0)
    setPhase("recording")

    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev >= 179) {
          stopRecording()
          return 180
        }
        return prev + 1
      })
    }, 1000)
  }

  function stopRecording() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    recorderRef.current?.stop()
    stopStream()
  }

  function handleRetake() {
    setRecordedBlob(null)
    if (recordedUrlRef.current) { URL.revokeObjectURL(recordedUrlRef.current); recordedUrlRef.current = null }
    startCamera(facingMode)
  }

  function handleUse() {
    if (!recordedBlob) return
    const mimeType = recordedBlob.type || "video/webm"
    const ext = mimeToExt(mimeType)
    const file = new File([recordedBlob], `rekaman-${Date.now()}.${ext}`, { type: mimeType })
    onCapture(file)
  }

  async function flipCamera() {
    const next = facingMode === "user" ? "environment" : "user"
    setFacingMode(next)
    await startCamera(next)
  }

  const isRecording = phase === "recording"
  const isPlayback = phase === "playback"
  const timerColor = seconds >= 150 ? "text-red-400" : "text-white"

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      {/* Live preview — shown during starting/preview/recording */}
      <video
        ref={liveRef}
        muted
        playsInline
        className={`flex-1 w-full object-cover ${isPlayback ? "hidden" : "block"}`}
      />

      {/* Playback preview — shown after recording stops */}
      {isPlayback && (
        <video
          ref={playbackRef}
          controls
          playsInline
          className="flex-1 w-full object-contain bg-black"
        />
      )}

      {/* Error state */}
      {phase === "error" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <span className="text-5xl">📷</span>
          <p className="text-white text-sm">{errorMsg}</p>
          <button
            onClick={onCancel}
            className="mt-2 px-6 py-3 rounded-full border border-white text-white text-sm"
          >
            Kembali
          </button>
        </div>
      )}

      {/* Top bar */}
      {phase !== "error" && (
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-safe-top pt-4">
          <button
            onClick={isRecording ? undefined : onCancel}
            disabled={isRecording}
            className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white text-lg disabled:opacity-40"
          >
            ✕
          </button>

          {isRecording && (
            <div className={`flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full ${timerColor}`}>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-mono font-bold">{formatTime(seconds)} / 3:00</span>
            </div>
          )}

          {!isRecording && !isPlayback && (
            <button
              onClick={flipCamera}
              className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white text-lg"
              title="Ganti kamera"
            >
              🔄
            </button>
          )}
        </div>
      )}

      {/* Bottom controls */}
      {(phase === "preview" || phase === "recording") && (
        <div className="absolute bottom-0 left-0 right-0 pb-safe-bottom pb-8 flex flex-col items-center gap-4">
          {/* Record / Stop button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all ${
              isRecording ? "bg-red-500 scale-95" : "bg-white/20"
            }`}
          >
            {isRecording ? (
              <span className="w-8 h-8 rounded-sm bg-white" />
            ) : (
              <span className="w-14 h-14 rounded-full bg-red-500" />
            )}
          </button>
          <p className="text-white/70 text-xs">
            {isRecording ? "Ketuk untuk berhenti" : "Ketuk untuk merekam · maks 3 menit"}
          </p>
        </div>
      )}

      {isPlayback && (
        <div className="absolute bottom-0 left-0 right-0 pb-safe-bottom pb-8 flex items-center justify-center gap-4 px-8">
          <button
            onClick={handleRetake}
            className="flex-1 py-3 rounded-full border border-white text-white text-sm font-semibold"
          >
            Rekam Ulang
          </button>
          <button
            onClick={handleUse}
            className="flex-1 py-3 rounded-full bg-[#5BBFB0] text-white text-sm font-semibold"
          >
            Gunakan Video
          </button>
        </div>
      )}
    </div>
  )
}
