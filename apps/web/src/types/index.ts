export type UserRole = "PARENT" | "NANNY" | "ADMIN"

export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}
