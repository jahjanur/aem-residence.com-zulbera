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

export const config = {
  nodeEnv: optional('NODE_ENV', 'development'),
  port: parseInt(optional('PORT', '4000'), 10),
  databaseUrl: required('DATABASE_URL'),
  sessionSecret: required('SESSION_SECRET'),
  corsOrigin: optional('CORS_ORIGIN', 'http://localhost:5173'),
  isProduction: process.env.NODE_ENV === 'production',
};

export type Config = typeof config;
