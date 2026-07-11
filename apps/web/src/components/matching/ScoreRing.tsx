// Gauge lingkar skor kecocokan — pure SVG (stroke-dasharray), tidak butuh library chart.
// Server-renderable (tidak ada interaktivitas), dipakai di score card halaman profil nanny
// & drawer "Detail Nanny" supaya keduanya konsisten.

type Props = {
  score: number
  size?: number
  strokeWidth?: number
  color: string
  trackColor?: string
}

export default function ScoreRing({ score, size = 132, strokeWidth = 10, color, trackColor = "#F3EEF8" }: Props) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, score))
  const offset = circumference * (1 - clamped / 100)

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
      role="img"
      aria-label={`Skor kecocokan ${clamped}%`}
    >
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 500ms ease-out" }}
      />
    </svg>
  )
}
