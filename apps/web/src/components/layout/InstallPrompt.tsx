"use client"

import { useEffect, useState } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    // Don't show if already running as installed PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return

    // Don't show if dismissed in this session
    if (sessionStorage.getItem("pwa-dismissed")) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShow(true)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    setInstalling(true)
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setShow(false)
    } else {
      setInstalling(false)
    }
    setDeferredPrompt(null)
  }

  function handleDismiss() {
    sessionStorage.setItem("pwa-dismissed", "1")
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-[76px] left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="w-full max-w-[480px] bg-[#5A3A7A] rounded-[16px] p-3.5 shadow-xl pointer-events-auto flex items-center gap-3">
        {/* Icon */}
        <div className="w-10 h-10 bg-white/15 rounded-[10px] flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-white leading-snug">Install BundaYakin</p>
          <p className="text-[11px] text-white/70 leading-snug mt-0.5">Akses lebih cepat dari desktop atau HP</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleDismiss}
            className="text-white/60 hover:text-white p-1 transition-colors"
            aria-label="Tutup"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleInstall}
            disabled={installing}
            className="bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[12px] px-3 py-1.5 rounded-[8px] min-h-[34px] transition-all disabled:opacity-60 whitespace-nowrap"
          >
            {installing ? "Menginstall..." : "Install App"}
          </button>
        </div>
      </div>
    </div>
  )
}
