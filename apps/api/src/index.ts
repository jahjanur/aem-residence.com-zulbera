/**
 * AEM Residence Operations API
 * Node.js + Express + TypeScript, session auth, SQLite (local) / optional Postgres (production)
 */
import path from 'path';
import 'express-session';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import { config } from './config';
import { logRequest, logError } from './lib/logger';

import authRoutes from './routes/auth';
import suppliersRoutes from './routes/suppliers';
import productsRoutes from './routes/products';
import ordersRoutes from './routes/orders';
import reconciliationsRoutes from './routes/reconciliations';
import controlRoutes from './routes/control';
import analyticsRoutes from './routes/analytics';
import inventoryRoutes from './routes/inventory';
import debugRoutes from './routes/debug';
import { sanitizeBody } from './middleware/sanitize';

// Session store: file-based (no native deps; persists across restarts)
const FileStore = require('session-file-store')(session);

const app = express();

// Security
app.use(helmet({
  contentSecurityPolicy: false, // allow inline scripts if needed for SPA
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Session: httpOnly cookies, store in files (prisma/sessions). When served under BASE_PATH, limit cookie to that path.
app.use(
  session({
    store: new FileStore({
      path: path.join(__dirname, '..', 'prisma', 'sessions'),
    }),
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    name: 'connect.sid',
    cookie: {
      httpOnly: true,
      secure: config.isProduction,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: config.isProduction ? 'lax' : 'lax',
      path: config.basePath || '/',
    },
  })
);

// All API + SPA logic on a router so we can mount at BASE_PATH (e.g. /zulbera) or at /
const router = express.Router();
router.use(express.json({ limit: '1mb' }));
router.use(sanitizeBody);

router.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logRequest(req.method, req.path, res.statusCode, Date.now() - start);
  });
  next();
});

router.use('/auth', authRoutes);
router.use('/suppliers', suppliersRoutes);
router.use('/products', productsRoutes);
router.use('/orders', ordersRoutes);
router.use('/reconciliations', reconciliationsRoutes);
router.use('/control', controlRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/inventory', inventoryRoutes);
router.get('/health', (_req, res) => res.json({ ok: true }));

// Production: serve React SPA from public/ (one Node app = API + frontend on Hostinger)
if (config.isProduction) {
  const publicDir = path.join(__dirname, '..', 'public');
  const fs = require('fs');
  if (fs.existsSync(publicDir)) {
    const apiPathPrefixes = ['/auth', '/suppliers', '/products', '/orders', '/reconciliations', '/control', '/analytics', '/inventory', '/health'];
    router.use(express.static(publicDir, { index: false }));
    router.get('*', (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (apiPathPrefixes.some((p) => req.path.startsWith(p))) return next();
      res.sendFile(path.join(publicDir, 'index.html'));
    });
  }
}

if (!config.isProduction) {
  router.use('/debug', debugRoutes);
}

router.use((_req, res) => res.status(404).json({ success: false, error: 'Not found' }));
router.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logError('Unhandled error', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.use(config.basePath || '/', router);

const server = app.listen(config.port, () => {
  const base = config.basePath ? ` at ${config.basePath}` : '';
  console.log(`API listening on port ${config.port}${base} (${config.nodeEnv})`);
});
server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nPort ${config.port} is already in use. Kill the process with:\n  npm run dev:kill\nor:\n  lsof -ti:${config.port} | xargs kill -9\n`);
  }
  throw err;
});
