/**
 * Shared ETag Utilities
 * Ensures consistent ETag generation across client and server
 *
 * ETags (Entity Tags) are used for:
 * 1. Cache validation (304 Not Modified responses)
 * 2. Optimistic concurrency control (preventing lost updates)
 *
 * This module provides both weak and strong ETag generation methods.
 */

/**
 * Generate a weak ETag from data (fast, non-cryptographic)
 *
 * Weak ETags indicate semantic equivalence and are preferable for:
 * - Caching GET responses
 * - Large responses where byte-for-byte comparison is unnecessary
 * - Performance-critical paths
 *
 * Format: W/"hexhash"
 *
 * @param data - Data to generate ETag from (will be JSON stringified)
 * @returns Weak ETag string (e.g., W/"1a2b3c4d")
 *
 * @example
 * const data = { id: 1, name: 'Alice' };
 * const etag = generateWeakETag(data);
 * // Returns: W/"a1b2c3d4"
 */
export function generateWeakETag(data: unknown): string {
  const str = JSON.stringify(data);
  let hash = 0;

  // Simple hash algorithm (djb2-like)
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return `W/"${Math.abs(hash).toString(16)}"`;
}

/**
 * Generate a strong ETag from data (cryptographic)
 *
 * Strong ETags indicate byte-for-byte equivalence and are required for:
 * - Optimistic concurrency control (If-Match)
 * - Critical resources where exact content matters
 * - Range requests (partial content)
 *
 * Format: "hexhash"
 *
 * @param data - Data to generate ETag from (will be JSON stringified)
 * @returns Promise resolving to strong ETag string (e.g., "1a2b3c4d5e6f7890")
 *
 * @example
 * const data = { id: 1, updatedAt: '2026-01-01' };
 * const etag = await generateStrongETag(data);
 * // Returns: "1a2b3c4d5e6f7890"
 *
 * // Use with If-Match for optimistic concurrency:
 * fetch('/api/resource/123', {
 *   method: 'PUT',
 *   headers: { 'If-Match': etag },
 *   body: JSON.stringify(updates),
 * });
 */
export async function generateStrongETag(data: unknown): Promise<string> {
  const str = JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(str);

  // Use SHA-256 for cryptographic hashing
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Use first 16 characters for brevity (still 64 bits of entropy)
  return `"${hashHex.substring(0, 16)}"`;
}

/**
 * Generate ETag from timestamp (for timestamp-based versioning)
 *
 * Useful for resources that track updated_at timestamps.
 * Faster than hashing full data, but requires consistent timestamp format.
 *
 * @param timestamp - ISO 8601 timestamp or null/undefined
 * @returns Weak ETag string or empty string if no timestamp
 *
 * @example
 * const resource = { id: 1, updated_at_utc: '2026-01-01 12:00:00' };
 * const etag = generateTimestampETag(resource.updated_at_utc);
 * // Returns: W/"20260101120000"
 */
export function generateTimestampETag(timestamp: string | null | undefined): string {
  if (!timestamp) return '';

  // Remove non-numeric characters for compact representation
  const compact = timestamp.replace(/[^0-9]/g, '');
  return `W/"${compact}"`;
}

/**
 * Check if request ETag matches response ETag
 *
 * Used for conditional request handling:
 * - If-None-Match → 304 Not Modified (GET)
 * - If-Match → 412 Precondition Failed (PUT/PATCH/DELETE)
 *
 * Supports multiple ETags and wildcard matching per RFC 7232.
 *
 * @param requestETag - ETag from request header (If-None-Match or If-Match)
 * @param responseETag - Current ETag of the resource
 * @returns true if ETags match, false otherwise
 *
 * @example
 * // GET request with If-None-Match
 * const ifNoneMatch = request.headers.get('If-None-Match');
 * if (matchesETag(ifNoneMatch, currentETag)) {
 *   return new Response(null, { status: 304, headers: { 'ETag': currentETag } });
 * }
 *
 * @example
 * // PUT request with If-Match
 * const ifMatch = request.headers.get('If-Match');
 * if (!matchesETag(ifMatch, currentETag)) {
 *   return new Response('Precondition Failed', { status: 412 });
 * }
 */
export function matchesETag(requestETag: string | null, responseETag: string): boolean {
  if (!requestETag) return false;

  // Handle wildcard (matches any ETag)
  if (requestETag.trim() === '*') return true;

  // Handle multiple ETags (comma-separated per RFC 7232)
  const requestETags = requestETag
    .split(',')
    .map(e => e.trim());

  return requestETags.includes(responseETag);
}

/**
 * Compare weak and strong ETags for equivalence
 *
 * Per RFC 7232, weak comparison matches weak and strong ETags
 * if their opaque values are equal (ignoring W/ prefix).
 *
 * @param etag1 - First ETag
 * @param etag2 - Second ETag
 * @returns true if ETags are weakly equivalent
 *
 * @example
 * weakETagEquals('W/"abc"', '"abc"');  // true
 * weakETagEquals('W/"abc"', 'W/"abc"');  // true
 * weakETagEquals('"abc"', '"def"');  // false
 */
export function weakETagEquals(etag1: string, etag2: string): boolean {
  // Extract opaque value (remove W/ prefix and quotes)
  const extractValue = (etag: string): string => {
    return etag.replace(/^W\//, '').replace(/"/g, '');
  };

  return extractValue(etag1) === extractValue(etag2);
}

/**
 * Parse ETag from HTTP header value
 *
 * Handles various ETag formats:
 * - Strong: "abc123"
 * - Weak: W/"abc123"
 * - Multiple: "abc", W/"def", "ghi"
 * - Wildcard: *
 *
 * @param headerValue - Raw ETag header value
 * @returns Array of parsed ETags
 *
 * @example
 * parseETagHeader('W/"abc", "def"');
 * // Returns: ['W/"abc"', '"def"']
 *
 * parseETagHeader('*');
 * // Returns: ['*']
 */
export function parseETagHeader(headerValue: string | null): string[] {
  if (!headerValue) return [];

  // Handle wildcard
  if (headerValue.trim() === '*') return ['*'];

  // Split by comma and trim whitespace
  return headerValue
    .split(',')
    .map(etag => etag.trim())
    .filter(etag => etag.length > 0);
}
