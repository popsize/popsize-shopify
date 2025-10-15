/**
 * Centralized logging utility
 * Only logs in development mode, not in production
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Debug logging - only outputs in development mode
 * @param args - Arguments to log
 */
export const debug = (...args: any[]): void => {
  if (isDevelopment) {
    console.debug(...args);
  }
};

/**
 * Info logging - only outputs in development mode
 * @param args - Arguments to log
 */
export const info = (...args: any[]): void => {
  if (isDevelopment) {
    console.info(...args);
  }
};

/**
 * Log logging - only outputs in development mode
 * @param args - Arguments to log
 */
export const log = (...args: any[]): void => {
  if (isDevelopment) {
    console.log(...args);
  }
};
