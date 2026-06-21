/**
 * REED Clothing — Input Sanitization Module
 *
 * Shared sanitization utilities for all user-facing input fields.
 * Strips HTML, validates formats, and enforces length limits
 * to prevent XSS, injection, and data corruption attacks.
 */

// ---------------------------------------------------------------------------
// Text Sanitization
// ---------------------------------------------------------------------------

/**
 * Strip HTML tags, control characters, and enforce max length.
 * Suitable for names, addresses, notes, and general text fields.
 */
export function sanitizeText(input: string, maxLength: number = 256): string {
  if (typeof input !== 'string') return '';

  return input
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove control characters (except newlines and tabs for notes)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Collapse excessive whitespace
    .replace(/\s{3,}/g, '  ')
    .trim()
    .slice(0, maxLength);
}

/**
 * Strict text sanitizer — no newlines, no special chars.
 * Suitable for single-line fields like names and cities.
 */
export function sanitizeStrictText(input: string, maxLength: number = 128): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')  // Remove ALL control chars including newlines
    .replace(/[<>"'`;\\]/g, '')         // Remove dangerous chars
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, maxLength);
}

// ---------------------------------------------------------------------------
// Email Sanitization & Validation
// ---------------------------------------------------------------------------

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

/**
 * Sanitize and validate an email address.
 * Returns the lowercase trimmed email, or empty string if invalid.
 */
export function sanitizeEmail(input: string): string {
  if (typeof input !== 'string') return '';

  const cleaned = input.trim().toLowerCase().slice(0, 254); // RFC 5321 max
  return EMAIL_REGEX.test(cleaned) ? cleaned : '';
}

/**
 * Check if an email string is valid format.
 */
export function isValidEmail(input: string): boolean {
  return EMAIL_REGEX.test(input.trim().toLowerCase());
}

// ---------------------------------------------------------------------------
// Phone Number Sanitization & Validation
// ---------------------------------------------------------------------------

const PHONE_REGEX = /^\+?[\d\s\-()]{7,20}$/;

/**
 * Sanitize a phone number — allow only digits, +, -, (), and spaces.
 * Returns sanitized string or empty if invalid format.
 */
export function sanitizePhone(input: string): string {
  if (typeof input !== 'string') return '';

  // Strip everything except digits, +, -, (), spaces
  const cleaned = input.replace(/[^\d+\-()\s]/g, '').trim().slice(0, 20);
  return PHONE_REGEX.test(cleaned) ? cleaned : '';
}

/**
 * Check if a phone number string is valid format.
 */
export function isValidPhone(input: string): boolean {
  const cleaned = input.replace(/[^\d+\-()\s]/g, '').trim();
  return PHONE_REGEX.test(cleaned);
}

// ---------------------------------------------------------------------------
// URL Sanitization
// ---------------------------------------------------------------------------

/** Trusted domains for image URLs */
const TRUSTED_IMAGE_DOMAINS = [
  'firebasestorage.googleapis.com',
  'storage.googleapis.com',
  'lh3.googleusercontent.com',
  'images.unsplash.com',
];

/**
 * Validate and sanitize a URL.
 * Only allows https: scheme and optionally restricts to trusted domains.
 * Returns the URL string or empty string if invalid/untrusted.
 */
export function sanitizeUrl(input: string, restrictToTrusted: boolean = false): string {
  if (typeof input !== 'string') return '';

  const trimmed = input.trim();
  if (!trimmed) return '';

  // Allow data: URIs for base64 images (handled separately by upload pipeline)
  if (trimmed.startsWith('data:image/')) return trimmed;

  try {
    const url = new URL(trimmed);

    // Only allow https
    if (url.protocol !== 'https:') return '';

    // Optionally restrict to trusted domains
    if (restrictToTrusted) {
      const isTrusted = TRUSTED_IMAGE_DOMAINS.some(
        domain => url.hostname === domain || url.hostname.endsWith('.' + domain)
      );
      if (!isTrusted) return '';
    }

    return url.href;
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------
// Postal Code Sanitization
// ---------------------------------------------------------------------------

/**
 * Sanitize a postal code — alphanumeric, spaces, and hyphens only.
 */
export function sanitizePostalCode(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/[^a-zA-Z0-9\s\-]/g, '')
    .trim()
    .slice(0, 10);
}
