// Cegah recalculate AI (Claude) tiap kali profil dibuka — hasil MatchResult dianggap
// valid selama MATCH_RESULT_STALE_DAYS, baru dihitung ulang via Claude API kalau sudah lewat itu.
export const MATCH_RESULT_STALE_DAYS = 7

export function isMatchResultStale(generatedAt: Date): boolean {
  const ageMs = Date.now() - generatedAt.getTime()
  return ageMs > MATCH_RESULT_STALE_DAYS * 24 * 60 * 60 * 1000
}
