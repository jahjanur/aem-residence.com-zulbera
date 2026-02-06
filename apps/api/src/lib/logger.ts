/**
 * Basic request and error logger
 */

export function logRequest(method: string, path: string, statusCode: number, durationMs: number): void {
  const msg = `${method} ${path} ${statusCode} ${durationMs}ms`;
  if (statusCode >= 400) {
    console.error(`[ERROR] ${msg}`);
  } else {
    console.log(`[REQ] ${msg}`);
  }
}

export function logError(message: string, err?: unknown): void {
  console.error(`[ERROR] ${message}`, err instanceof Error ? err.message : err);
}
