import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * Validates that the request origin matches the server's origin.
 * This provides CSRF protection for API routes alongside SameSite cookies.
 */
export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')

  // Allow requests without origin (same-origin requests from browsers always send origin for POST/PUT/DELETE)
  // In production, you may want to require origin for all mutating requests
  if (!origin && !host) return true

  if (origin && host) {
    try {
      const originUrl = new URL(origin)
      return originUrl.host === host
    } catch {
      return false
    }
  }

  return true
}

/**
 * Combined CSRF + auth check for mutating endpoints.
 * Returns the session if valid, or null if the request should be rejected.
 */
export async function validateMutatingRequest(request: Request) {
  // Check origin for CSRF protection
  if (!validateOrigin(request)) {
    return null
  }

  // Check session
  const session = await getServerSession(authOptions)
  return session
}
