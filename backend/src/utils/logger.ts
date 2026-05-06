/**
 * Simple Logger Utility
 */
export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[${new Date().toISOString()}] INFO: ${message}`, ...args);
  },
  error: (message: string, error?: any) => {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`);
    if (error) {
      if (error.stack) {
        console.error(error.stack);
      } else {
        console.error(error);
      }
    }
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[${new Date().toISOString()}] WARN: ${message}`, ...args);
  }
};
