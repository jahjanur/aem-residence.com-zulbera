/**
 * Environment and app config. No hardcoded secrets.
 */

function required(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env: ${key}`);
  return v;
}

function optional(key: string, def: string): string {
  return process.env[key] ?? def;
}

/** Normalize base path: no trailing slash, empty string if root */
function normalizeBasePath(raw: string): string {
  const s = (raw || '').trim().replace(/\/+$/, '');
  return s === '' || s === '/' ? '' : s.startsWith('/') ? s : `/${s}`;
}

export const config = {
  nodeEnv: optional('NODE_ENV', 'development'),
  port: parseInt(optional('PORT', '4000'), 10),
  databaseUrl: required('DATABASE_URL'),
  sessionSecret: required('SESSION_SECRET'),
  corsOrigin: optional('CORS_ORIGIN', 'http://localhost:5173'),
  /** Base path when app is served under a path (e.g. /zulbera on aem-residence.com/zulbera) */
  basePath: normalizeBasePath(optional('BASE_PATH', '')),
  isProduction: process.env.NODE_ENV === 'production',
};

export type Config = typeof config;
