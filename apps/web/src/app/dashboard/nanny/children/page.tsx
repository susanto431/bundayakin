import { cachedAuth } from "@/lib/auth-server"
import { getNannyChildren } from "@/lib/queries/nanny"
import Link from "next/link"
import NannyChildNotesForm from "./NannyChildNotesForm"

export const metadata = { title: "Catatan Anak — BundaYakin" }

const AGE_GROUP_LABEL: Record<string, string> = {
  INFANT_0_6M: "Bayi 0–6 bulan",
  INFANT_6_12M: "Bayi 6–12 bulan",
  TODDLER_1_3Y: "Balita 1–3 tahun",
  PRESCHOOL_3_6Y: "3 tahun ke atas",
  MIXED: "Lebih dari satu rentang usia",
}

export default async function NannyChildrenPage() {
  const session = await cachedAuth()

  if (!session?.user?.id) {
    return null
  }

  const nannyProfile = await getNannyChildren(session.user.id)

  const assignment = nannyProfile?.nannyAssignments?.[0]
  const children = assignment?.assignedChildren?.map(ac => ac.childProfile) ?? []
  const parentName = assignment?.parentProfile?.fullName ?? "Orang Tua"

  // Matching request yang sedang berjalan (tanpa assignment aktif)
  const pendingMatch = !assignment ? nannyProfile?.matchingRequests?.[0] : null
  const pendingParentName = pendingMatch?.parentProfile?.fullName?.split(" ")[0] ?? null

  const headerTitle = !assignment
    ? "Catatan Anak"
    : children.length === 1
    ? `Catatan tentang ${children[0].name}`
    : `Catatan Anak Keluarga ${parentName.split(" ")[0]}`

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      {/* Header */}
      <div className="border-b border-[#E0D0F0] pb-3 mb-4">
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">{headerTitle}</h1>
        <p className="text-[13px] text-[#999AAA] mt-0.5">
          {assignment
            ? `Dari keluarga ${parentName}${children.length > 1 ? ` · ${children.length} anak` : ""}`
            : "Belum ada penugasan aktif"}
        </p>
      </div>

      {!assignment || children.length === 0 ? (
        /* No active assignment */
        <div className="space-y-4">
          {pendingMatch ? (
            /* Ada matching request tapi belum ada assignment — in-progress state */
            <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[16px] p-4">
              <div className="w-10 h-10 bg-[#A8DDD8] rounded-full flex items-center justify-center mx-auto mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E4A45" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <p className="text-[15px] font-bold text-[#1E4A45] text-center mb-1">Proses matching sedang berjalan</p>
              {pendingParentName ? (
                <p className="text-[13px] text-[#2C5F5A] text-center leading-relaxed mb-3">
                  Keluarga <strong>{pendingParentName}</strong> mengundang Sus untuk proses matching.
                  Catatan anak akan tersedia setelah penempatan dikonfirmasi oleh kedua pihak.
                </p>
              ) : (
                <p className="text-[13px] text-[#2C5F5A] text-center leading-relaxed mb-3">
                  Sus sedang dalam proses matching dengan sebuah keluarga.
                  Catatan anak akan tersedia setelah penempatan dikonfirmasi.
                </p>
              )}
              <div className="flex justify-center">
                <Link
                  href="/dashboard/nanny"
                  className="inline-flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[14px] px-5 py-2.5 rounded-[10px] min-h-[48px] transition-all"
                >
                  Lihat status matching →
                </Link>
              </div>
            </div>
          ) : (
            /* Tidak ada matching sama sekali */
            <div className="bg-[#F3EEF8] border border-[#C8B8DC] rounded-[16px] p-5 text-center">
              <div className="w-12 h-12 bg-[#E8DCF0] rounded-full flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A97CC4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </div>
              <p className="text-[15px] font-bold text-[#5A3A7A] mb-1">Belum Ada Penugasan Aktif</p>
              <p className="text-[13px] text-[#666666] leading-relaxed mb-4">
                Halaman ini bisa diakses setelah Sus mulai bekerja dengan keluarga di BundaYakin.
              </p>
              <Link
                href="/dashboard/nanny"
                className="inline-flex items-center justify-center bg-[#A97CC4] hover:bg-[#5A3A7A] text-white font-semibold text-[14px] px-5 py-2.5 rounded-[10px] min-h-[48px] transition-all"
              >
                Kembali ke Dashboard
              </Link>
            </div>
          )}

          <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[16px] p-4">
            <p className="text-[13px] font-bold text-[#1E4A45] mb-1">Apa itu Catatan Anak?</p>
            <ul className="text-[13px] text-[#2C5F5A] space-y-1 pl-4 list-disc leading-relaxed">
              <li>Profil lengkap si Kecil: alergi, kondisi kesehatan, rutinitas</li>
              <li>Aturan rumah yang perlu Sus ikuti</li>
              <li>Sus bisa menambahkan catatan perkembangan dari pengamatan sendiri</li>
              <li>Catatan Sus tersimpan dan dibaca oleh nanny berikutnya — membantu kesinambungan perawatan</li>
            </ul>
          </div>
        </div>
      ) : (
        /* Has active assignment — show all children */
        <div className="space-y-6">

          {/* Info card */}
          <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[16px] p-3.5">
            <p className="text-[13px] font-bold text-[#1E4A45] mb-0.5">
              Keluarga {parentName} telah membagikan catatan ini
            </p>
            <p className="text-[13px] text-[#2C5F5A]">
              Sus bisa melihat semua catatan dan menambahkan pengamatan dari sisi Sus.
            </p>
          </div>

          {children.map((child, index) => (
            <div key={child.id} className="space-y-4">
              {/* Divider for multiple children */}
              {children.length > 1 && (
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#E0D0F0]" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#A97CC4]">
                    Anak {index + 1}
                  </span>
                  <div className="h-px flex-1 bg-[#E0D0F0]" />
                </div>
              )}

              {/* Child profile */}
              <div className="bg-white border border-[#E0D0F0] rounded-[16px] overflow-hidden">
                <div className="flex items-center gap-3 p-3.5 border-b border-[#E0D0F0] bg-[#FDFBFF]">
                  <div className="w-8 h-8 bg-[#F3EEF8] rounded-[8px] flex items-center justify-center text-[16px]">👶</div>
                  <p className="text-[14px] font-bold text-[#5A3A7A]">Profil {child.name}</p>
                </div>
                <div className="p-3.5 space-y-2">
                  <Row label="Nama" value={child.name} />
                  <Row label="Kelompok usia" value={AGE_GROUP_LABEL[child.ageGroup] ?? child.ageGroup} />
                  {child.gender && <Row label="Jenis kelamin" value={child.gender} />}
                  {child.allergies && <Row label="Alergi / kondisi" value={child.allergies} multiline />}
                </div>
              </div>

              {/* Development */}
              {(child.medicalNotes || child.schoolName || child.schoolSchedule) && (
                <div className="bg-white border border-[#E0D0F0] rounded-[16px] overflow-hidden">
                  <div className="flex items-center gap-3 p-3.5 border-b border-[#E0D0F0] bg-[#FDFBFF]">
                    <div className="w-8 h-8 bg-[#FEF0E7] rounded-[8px] flex items-center justify-center text-[16px]">📈</div>
                    <p className="text-[14px] font-bold text-[#5A3A7A]">Perkembangan</p>
                  </div>
                  <div className="p-3.5 space-y-2">
                    {child.medicalNotes && <Row label="Catatan kesehatan" value={child.medicalNotes} multiline />}
                    {child.schoolName && <Row label="Sekolah" value={child.schoolName} />}
                    {child.schoolSchedule && <Row label="Jadwal sekolah" value={child.schoolSchedule} />}
                  </div>
                </div>
              )}

              {/* House rules */}
              {(child.pantangan || child.schedule || child.additionalNotes) && (
                <div className="bg-white border border-[#E0D0F0] rounded-[16px] overflow-hidden">
                  <div className="flex items-center gap-3 p-3.5 border-b border-[#E0D0F0] bg-[#FDFBFF]">
                    <div className="w-8 h-8 bg-[#FEF0E7] rounded-[8px] flex items-center justify-center text-[16px]">🏠</div>
                    <p className="text-[14px] font-bold text-[#5A3A7A]">Aturan Rumah</p>
                  </div>
                  <div className="p-3.5 space-y-2">
                    {child.pantangan && <Row label="Pantangan" value={child.pantangan} multiline />}
                    {child.schedule && <Row label="Rutinitas harian" value={child.schedule} multiline />}
                    {child.additionalNotes && <Row label="Aturan lain" value={child.additionalNotes} multiline />}
                  </div>
                </div>
              )}

              {/* Nanny notes form — per child */}
              <NannyChildNotesForm childId={child.id} childName={child.name} existingNotes={child.nannyNotes ?? null} />
            </div>
          ))}

        </div>
      )}

    </div>
  )
}

function Row({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-[#999AAA] uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-[14px] text-[#5A3A7A] ${multiline ? "leading-relaxed" : ""}`}>{value}</p>
    </div>
  )
}
