import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return null
  }
  return session
}

export async function requireAdmin() {
  const session = await requireAuth()
  if (!session || (session.user as Record<string, unknown>).role !== "admin") {
    return null
  }
  return session
}

export async function requireMerchant() {
  const session = await requireAuth()
  if (
    !session ||
    (session.user as Record<string, unknown>).role !== "merchant"
  ) {
    return null
  }
  return session
}
