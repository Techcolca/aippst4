import crypto from 'crypto';

/**
 * Generates a secure API key
 * @returns A randomly generated API key string
 */
export function generateApiKey(): string {
  return crypto.randomBytes(24).toString('hex');
}

/**
 * Formats a duration in seconds to a human-readable format
 * @param seconds Duration in seconds
 * @returns Formatted duration string (e.g., "3m 42s")
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Sanitizes a string for use in HTML
 * @param str Input string
 * @returns Sanitized string
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Extracts domain from a URL
 * @param url Input URL
 * @returns Domain name
 */
export function extractDomain(url: string): string {
  try {
    // Add protocol if not present
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const hostname = new URL(url).hostname;
    return hostname.startsWith('www.') ? hostname.slice(4) : hostname;
  } catch (error) {
    return url;
  }
}

/**
 * Validates a hexadecimal color code
 * @param color Hex color code
 * @returns Boolean indicating if the color is valid
 */
export function isValidHexColor(color: string): boolean {
  return /^#([0-9A-F]{3}){1,2}$/i.test(color);
}

/**
 * Generates a random visitor ID
 * @returns Random visitor ID string
 */
export function generateVisitorId(): string {
  return 'visitor_' + Math.random().toString(36).substring(2, 15);
}

/**
 * Truncates text to a specified length
 * @param text Input text
 * @param maxLength Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Creates an HTML-safe version of JSON for embedding in script tags
 * @param data Any data object
 * @returns HTML-safe JSON string
 */
export function createSafeJsonString(data: any): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/'/g, '\\u0027')
    .replace(/"/g, '\\u0022');
}
