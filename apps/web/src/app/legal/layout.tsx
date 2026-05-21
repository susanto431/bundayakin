import Link from "next/link"

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F3EEF8]">
      <header className="bg-white border-b border-[#E0D0F0] sticky top-0 z-10">
        <div className="max-w-[600px] mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="text-[#5A3A7A] font-bold text-[16px] font-[var(--font-jakarta)]">
            BundaYakin
          </Link>
          <span className="text-[#E0D0F0]">|</span>
          <span className="text-[#666666] text-[13px]">Dokumen Legal</span>
        </div>
      </header>
      <main className="max-w-[600px] mx-auto px-4 py-8 pb-20">
        {children}
      </main>
    </div>
  )
}
