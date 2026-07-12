import ForgotPasswordForm from "./ForgotPasswordForm"

export const metadata = { title: "Reset Kata Sandi — BundaYakin" }

type Props = {
  searchParams: { phone?: string }
}

export default function ForgotPasswordPage({ searchParams }: Props) {
  // Sanitasi sederhana — hanya terima nomor yang sudah dinormalisasi (62xxxxxxxxxx).
  const rawPhone = searchParams.phone ?? ""
  const initialPhone = /^62\d{8,13}$/.test(rawPhone) ? rawPhone : undefined

  return <ForgotPasswordForm initialPhone={initialPhone} />
}
