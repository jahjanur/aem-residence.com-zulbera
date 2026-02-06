import { Request, Response, NextFunction } from 'express';

export interface SessionUser {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}

/**
 * Require authenticated user. Responds 401 if not logged in.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }
  req.user = req.session.user as SessionUser;
  next();
}

/**
 * Require ADMIN role. Use after requireAuth. Responds 403 if not admin.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }
  if (req.user.role !== 'ADMIN') {
    res.status(403).json({ success: false, error: 'Admin access required' });
    return;
  }
  next();
}
