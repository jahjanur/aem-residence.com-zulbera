/**
 * Simple input sanitization: trim strings and limit length to prevent abuse.
 */

const MAX_STRING_LENGTH = 2000;

function trimString(val: unknown): unknown {
  if (typeof val === 'string') {
    const trimmed = val.trim();
    return trimmed.length > MAX_STRING_LENGTH ? trimmed.slice(0, MAX_STRING_LENGTH) : trimmed;
  }
  if (Array.isArray(val)) return val.map(trimString);
  if (val !== null && typeof val === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val)) out[k] = trimString(v);
    return out;
  }
  return val;
}

export function sanitizeBody(req: import('express').Request, _res: import('express').Response, next: import('express').NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    req.body = trimString(req.body) as typeof req.body;
  }
  next();
}
