// Safe date conversion — unstable_cache returns dates as ISO strings after deserialization.
// Use d() wherever a Date method (.toLocaleDateString, .getTime, etc.) is needed.
export function d(val: Date | string | null | undefined): Date | null {
  if (!val) return null
  return val instanceof Date ? val : new Date(val)
}
