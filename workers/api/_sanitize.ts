/**
 * Input Sanitization Utilities
 * Prevents XSS and validates input data
 */

import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

// ============================================================================
// HTML Sanitization
// ============================================================================

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 
  'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'code', 'pre'
];

const ALLOWED_ATTR = ['href', 'target', 'rel', 'class'];

/**
 * Sanitize HTML content
 */
export function sanitizeHTML(dirty: string, allowedTags = ALLOWED_TAGS): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Strip all HTML tags
 */
export function stripHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
}

// ============================================================================
// Enhanced Zod Schemas
// ============================================================================

/**
 * Strict UUID validator
 */
export const uuidSchema = z.string().uuid({
  message: 'Invalid UUID format'
});

/**
 * Sanitized HTML string
 */
export const htmlSchema = z.string().transform((val) => sanitizeHTML(val));

/**
 * Sanitized plain text (strips HTML)
 */
export const plainTextSchema = z.string().transform((val) => stripHTML(val));

/**
 * Limited length string
 */
export function limitedString(maxLength: number) {
  return z.string().max(maxLength, `Maximum ${maxLength} characters allowed`);
}

/**
 * Username validator
 */
export const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username must be at most 50 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens');

/**
 * Email validator
 */
export const emailSchema = z.string().email('Invalid email address');

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate and sanitize announcement body
 */
export const announcementBodySchema = htmlSchema
  .refine((val) => val.length <= 10000, 'Content too long (max 10000 characters)');

/**
 * Validate and sanitize title
 */
export const titleSchema = plainTextSchema
  .refine((val) => val.length >= 1 && val.length <= 200, 'Title must be 1-200 characters');

/**
 * Sanitize URL
 */
export function sanitizeURL(url: string): string {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    return parsed.toString();
  } catch {
    throw new Error('Invalid URL');
  }
}
