// Ikon inline kecil (stroke 2, rounded caps) — konsisten dengan LockIcon/WhatsAppIcon di
// UnlockContactButton.tsx. Bukan emoji: ikon vektor supaya konsisten lintas platform.

type IconProps = { className?: string }

export function CheckCircleIcon({ className }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 5-5" />
    </svg>
  )
}

export function SwapIcon({ className }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7 7h11l-3-3M17 17H6l3 3" />
    </svg>
  )
}

export function MessageCircleIcon({ className }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 20c4.97 0 9-3.58 9-8s-4.03-8-9-8-9 3.58-9 8c0 1.85.63 3.55 1.7 4.95L4 20l4.5-1.2c1.06.45 2.24.7 3.5.7Z" />
    </svg>
  )
}

export function HelpCircleIcon({ className }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 0 1 4.7 1.2c-.3.9-1.4 1.2-1.9 1.9-.2.3-.3.6-.3 1" />
      <circle cx="12" cy="16.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function CompareIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 3v14M9 17l-3-3M9 17l3-3M15 21V7M15 7l-3 3M15 7l3 3" />
    </svg>
  )
}
