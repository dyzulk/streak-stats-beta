/**
 * Caching utilities for Cloudflare KV
 * Optional: only used if KV is configured
 */

export interface CacheOptions {
  ttl?: number; // Time to live in seconds (default: 3600 = 1 hour)
  namespace?: KVNamespace;
}

/**
 * Get cached data from KV
 */
export async function getCached<T>(
  key: string,
  namespace?: KVNamespace
): Promise<T | null> {
  if (!namespace) {
    return null;
  }

  try {
    const data = await namespace.get(key, 'json');
    return data as T;
  } catch {
    return null;
  }
}

/**
 * Set cached data to KV
 */
export async function setCached<T>(
  key: string,
  value: T,
  options?: CacheOptions
): Promise<void> {
  const { ttl = 3600, namespace } = options || {};

  if (!namespace) {
    return;
  }

  try {
    await namespace.put(key, JSON.stringify(value), {
      expirationTtl: ttl,
    });
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error);
  }
}

/**
 * Generate cache key for user
 */
export function generateCacheKey(username: string): string {
  return `streak:${username.toLowerCase()}`;
}

/**
 * Clear cache for user
 */
export async function clearCache(
  username: string,
  namespace?: KVNamespace
): Promise<void> {
  if (!namespace) {
    return;
  }

  try {
    await namespace.delete(generateCacheKey(username));
  } catch (error) {
    console.error(`Cache clear error for ${username}:`, error);
  }
}
