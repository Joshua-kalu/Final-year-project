/**
 * Environment-aware logger that sanitizes error output in production.
 * Prevents sensitive information (stack traces, database schemas, internal paths)
 * from being exposed to users in browser DevTools.
 */

const sanitizeError = (error: unknown): string => {
  if (error instanceof Error) {
    // Only return the message, not the full stack trace
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An error occurred';
};

export const logger = {
  /**
   * Log error messages. In development, logs full error objects.
   * In production, only logs sanitized messages without sensitive details.
   */
  error: (message: string, error?: unknown): void => {
    if (import.meta.env.DEV) {
      // Full logging in development for debugging
      if (error !== undefined) {
        console.error(message, error);
      } else {
        console.error(message);
      }
    } else {
      // Sanitized logging in production - no stack traces or sensitive data
      if (error !== undefined) {
        console.error(message, sanitizeError(error));
      } else {
        console.error(message);
      }
    }
  },

  /**
   * Log warning messages. Same sanitization rules as error.
   */
  warn: (message: string, data?: unknown): void => {
    if (import.meta.env.DEV) {
      if (data !== undefined) {
        console.warn(message, data);
      } else {
        console.warn(message);
      }
    } else {
      if (data !== undefined) {
        console.warn(message, sanitizeError(data));
      } else {
        console.warn(message);
      }
    }
  },

  /**
   * Log info messages. Only logs in development.
   */
  info: (message: string, data?: unknown): void => {
    if (import.meta.env.DEV) {
      if (data !== undefined) {
        console.info(message, data);
      } else {
        console.info(message);
      }
    }
    // Silent in production
  },

  /**
   * Log debug messages. Only logs in development.
   */
  debug: (message: string, data?: unknown): void => {
    if (import.meta.env.DEV) {
      if (data !== undefined) {
        console.debug(message, data);
      } else {
        console.debug(message);
      }
    }
    // Silent in production
  },
};
