import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validate request body against a Zod schema. On error returns 400 with user-friendly message.
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body) as T;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const first = err.errors[0];
        const message = first ? `${first.path.join('.')}: ${first.message}` : 'Validation failed';
        res.status(400).json({ success: false, error: message });
        return;
      }
      next(err);
    }
  };
}

/**
 * Validate query params.
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      (req as unknown as Record<string, unknown>).query = schema.parse(req.query);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const first = err.errors[0];
        const message = first ? `${first.path.join('.')}: ${first.message}` : 'Validation failed';
        res.status(400).json({ success: false, error: message });
        return;
      }
      next(err);
    }
  };
}
