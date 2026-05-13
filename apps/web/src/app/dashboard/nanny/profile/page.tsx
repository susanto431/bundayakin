import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import NannyProfileForm from "@/components/profile/NannyProfileForm"
import EmailSection from "@/components/profile/EmailSection"

export const metadata = { title: "Profil Saya — BundaYakin" }

export default async function NannyProfilePage() {
  const session = await auth()

  const profile = session?.user?.id
    ? await prisma.nannyProfile.findUnique({
        where: { userId: session.user.id },
        select: {
          fullName: true,
          phone: true,
          dateOfBirth: true,
          city: true,
          district: true,
          bio: true,
          nannyType: true,
          preferredAgeGroup: true,
          expectedSalaryMin: true,
          expectedSalaryMax: true,
          educationLevel: true,
          yearsOfExperience: true,
          skills: true,
          languages: true,
          religion: true,
        },
      })
    : null

  const initial = {
    fullName: profile?.fullName ?? session?.user?.name ?? "",
    phone: profile?.phone ?? "",
    dateOfBirth: profile?.dateOfBirth
      ? profile.dateOfBirth.toISOString().split("T")[0]
      : "",
    city: profile?.city ?? "",
    district: profile?.district ?? "",
    bio: profile?.bio ?? "",
    nannyType: profile?.nannyType ?? [],
    preferredAgeGroup: profile?.preferredAgeGroup ?? [],
    expectedSalaryMin: profile?.expectedSalaryMin
      ? String(Math.round(profile.expectedSalaryMin / 1_000_000))
      : "",
    expectedSalaryMax: profile?.expectedSalaryMax
      ? String(Math.round(profile.expectedSalaryMax / 1_000_000))
      : "",
    educationLevel: profile?.educationLevel ?? "",
    yearsOfExperience: profile?.yearsOfExperience != null
      ? String(profile.yearsOfExperience)
      : "",
    skills: profile?.skills ?? [],
    languages: profile?.languages ?? [],
    religion: profile?.religion ?? "",
  }

  return (
    <div className="px-4 pt-10 max-w-lg mx-auto pb-10">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-bold tracking-widest uppercase text-[#999AAA] mb-0.5">Akun</p>
        <h1 className="font-serif text-3xl text-[#5A3A7A]">Profil Saya</h1>
        <p className="text-sm text-[#666666] mt-1">
          Informasi ini akan dilihat oleh calon majikan saat proses matching
        </p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-[#F3EEF8] rounded-full flex items-center justify-center flex-shrink-0">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A97CC4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-[#5A3A7A]">{initial.fullName || "—"}</p>
          <p className="text-xs text-[#999AAA]">{session?.user?.email}</p>
        </div>
      </div>

      {/* Email */}
      <EmailSection initialEmail={session?.user?.email ?? ""} />

      {/* Form */}
      <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-5">
        <NannyProfileForm initial={initial} />
      </div>
    </div>
  )
}
