const MAX_ENTRIES = 500

const entries = new Map<string, { expiresAt: number; value: Promise<unknown> }>()

/**
 * Memoizes `fetcher` per key for `ttlMs` on the server, so SSR requests don't
 * repeat identical backend calls. In the browser it calls `fetcher` directly.
 */
export const cachedOnServer = <T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> => {
  if (typeof window !== "undefined") return fetcher()

  const now = Date.now()
  const hit = entries.get(key)
  if (hit && hit.expiresAt > now) return hit.value as Promise<T>

  const value = fetcher().catch((error) => {
    entries.delete(key)
    throw error
  })
  if (entries.size >= MAX_ENTRIES) {
    entries.delete(entries.keys().next().value!)
  }
  entries.set(key, { expiresAt: now + ttlMs, value })
  return value
}
