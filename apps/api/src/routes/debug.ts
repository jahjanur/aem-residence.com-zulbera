/**
 * Dev-only debug routes. Disabled when NODE_ENV=production.
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

/** GET /debug/auth-check?email=... — DEV ONLY: DB status + whether email exists (no password info) */
router.get('/auth-check', async (req: Request, res: Response): Promise<void> => {
  if (process.env.NODE_ENV === 'production') {
    res.status(404).json({ success: false, error: 'Not found' });
    return;
  }
  const email = typeof req.query.email === 'string' ? req.query.email : undefined;
  const result: { dbReachable: boolean; dbError?: string; emailProvided: boolean; userExists: boolean; userId?: string; userRole?: string } = {
    dbReachable: false,
    emailProvided: !!email,
    userExists: false,
  };
  try {
    await prisma.$queryRaw`SELECT 1`;
    result.dbReachable = true;
  } catch (err) {
    result.dbError = err instanceof Error ? err.message : String(err);
    res.json({ success: true, data: result });
    return;
  }
  if (email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true },
    });
    result.userExists = !!user;
    if (user) {
      result.userId = user.id;
      result.userRole = user.role;
    }
  }
  res.json({ success: true, data: result });
});

export default router;
