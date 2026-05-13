"use client"

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#FDFBFF] flex items-center justify-center px-6">
      <div className="max-w-[320px] text-center">
        <div className="w-16 h-16 bg-[#F3EEF8] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A97CC4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
          </svg>
        </div>
        <h1 className="text-[18px] font-bold text-[#5A3A7A] mb-2">Tidak ada koneksi</h1>
        <p className="text-[13px] text-[#999AAA] leading-relaxed mb-5">
          Periksa koneksi internet Bunda, lalu coba lagi.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[14px] px-6 py-3 rounded-[10px] min-h-[48px] transition-all"
        >
          Coba lagi
        </button>
      </div>
    </div>
  )
}
