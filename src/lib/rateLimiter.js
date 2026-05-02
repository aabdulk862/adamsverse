/**
 * Client-side rate limiter using sessionStorage.
 *
 * Storage: sessionStorage key → JSON array of timestamps
 * Default window: 5 minutes (300000ms), max 3 submissions
 *
 * Requirements: 11.1, 11.2
 */

const DEFAULT_WINDOW_MS = 300000; // 5 minutes
const DEFAULT_MAX_ATTEMPTS = 3;

/**
 * Get stored timestamps for a key, filtering out expired entries.
 * @param {string} key
 * @param {number} windowMs
 * @returns {number[]}
 */
function getTimestamps(key, windowMs) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return [];
    const timestamps = JSON.parse(raw);
    if (!Array.isArray(timestamps)) return [];
    const cutoff = Date.now() - windowMs;
    return timestamps.filter((t) => typeof t === "number" && t > cutoff);
  } catch {
    return [];
  }
}

/**
 * Check whether a submission is allowed under the rate limit.
 * @param {string} key - sessionStorage key
 * @param {number} [maxAttempts=3] - max submissions in window
 * @param {number} [windowMs=300000] - sliding window in ms
 * @returns {boolean}
 */
export function canSubmit(
  key,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
  windowMs = DEFAULT_WINDOW_MS,
) {
  const timestamps = getTimestamps(key, windowMs);
  return timestamps.length < maxAttempts;
}

/**
 * Record a submission timestamp.
 * @param {string} key - sessionStorage key
 */
export function recordSubmission(key) {
  try {
    const raw = sessionStorage.getItem(key);
    const timestamps = raw ? JSON.parse(raw) : [];
    const valid = Array.isArray(timestamps) ? timestamps : [];
    valid.push(Date.now());
    sessionStorage.setItem(key, JSON.stringify(valid));
  } catch {
    // sessionStorage unavailable — silently degrade
  }
}

/**
 * Get milliseconds until the oldest entry in the window expires.
 * Returns 0 if no active timestamps or submissions are allowed.
 * @param {string} key - sessionStorage key
 * @param {number} [windowMs=300000] - sliding window in ms
 * @returns {number}
 */
export function getTimeUntilReset(key, windowMs = DEFAULT_WINDOW_MS) {
  const timestamps = getTimestamps(key, windowMs);
  if (timestamps.length === 0) return 0;
  const oldest = Math.min(...timestamps);
  const resetAt = oldest + windowMs;
  const remaining = resetAt - Date.now();
  return remaining > 0 ? remaining : 0;
}
