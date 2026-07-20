// Simple in-memory rate limiter for admin login attempts.
// Note: this resets when the serverless function cold-starts, which is
// an acceptable trade-off for a small single-admin store — it still stops
// automated brute-force scripts hammering the login endpoint in a session.

interface AttemptRecord {
  count: number
  firstAttemptAt: number
  blockedUntil: number | null
}

const attempts = new Map<string, AttemptRecord>()

const MAX_ATTEMPTS = 5
const WINDOW_MS = 10 * 60 * 1000 // 10 minutes
const BLOCK_MS = 15 * 60 * 1000 // 15 minutes block after exceeding limit

export function checkRateLimit(identifier: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now()
  const record = attempts.get(identifier)

  if (!record) {
    attempts.set(identifier, { count: 1, firstAttemptAt: now, blockedUntil: null })
    return { allowed: true }
  }

  if (record.blockedUntil && now < record.blockedUntil) {
    return { allowed: false, retryAfterSeconds: Math.ceil((record.blockedUntil - now) / 1000) }
  }

  // Reset window if it expired
  if (now - record.firstAttemptAt > WINDOW_MS) {
    attempts.set(identifier, { count: 1, firstAttemptAt: now, blockedUntil: null })
    return { allowed: true }
  }

  record.count += 1

  if (record.count > MAX_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_MS
    return { allowed: false, retryAfterSeconds: Math.ceil(BLOCK_MS / 1000) }
  }

  return { allowed: true }
}

export function resetRateLimit(identifier: string) {
  attempts.delete(identifier)
}
