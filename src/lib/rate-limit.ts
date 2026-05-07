// Simple in-memory rate limiter
const rateLimits = new Map<string, { count: number; resetTime: number }>()

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
}

const DEFAULT_OPTIONS: RateLimitOptions = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
}

const AUTH_OPTIONS: RateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
}

export function rateLimit(
  key: string,
  options: RateLimitOptions = DEFAULT_OPTIONS
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = rateLimits.get(key)

  if (!record || now > record.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + options.windowMs })
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetTime: now + options.windowMs,
    }
  }

  if (record.count >= options.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }

  record.count++
  return {
    allowed: true,
    remaining: options.maxRequests - record.count,
    resetTime: record.resetTime,
  }
}

export function getRateLimitHeaders(result: {
  remaining: number
  resetTime: number
}) {
  return {
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
  }
}

export { DEFAULT_OPTIONS, AUTH_OPTIONS }
