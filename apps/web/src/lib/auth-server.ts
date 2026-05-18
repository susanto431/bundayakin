import { cache } from "react"
import { auth } from "@/lib/auth"

// Deduplicate auth() calls within the same request render tree.
// Layout + page both call this — React.cache ensures only one JWT decode per request.
export const cachedAuth = cache(auth)
