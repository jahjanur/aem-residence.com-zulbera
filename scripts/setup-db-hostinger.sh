#!/bin/bash
# Run from public_html (repo root) on Hostinger after deploy.
# Usage:
#   export DATABASE_URL='mysql://user:pass@host/dbname'
#   chmod +x scripts/setup-db-hostinger.sh
#   ./scripts/setup-db-hostinger.sh

set -e
cd "$(dirname "$0")/.."
REPO_ROOT="$(pwd)"

echo ">> Working from: $REPO_ROOT"

# Node 18 on Hostinger (optional; skip if npm already in PATH)
if ! command -v npm &>/dev/null; then
  export PATH="/opt/alt/alt-nodejs18/root/usr/bin:$PATH"
  echo ">> Added Node 18 to PATH"
fi

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set."
  echo "Run first: export DATABASE_URL='mysql://USER:PASSWORD@localhost/DATABASE'"
  exit 1
fi

# Fix execute permission for Prisma engines and bins
echo ">> Fixing permissions..."
chmod +x node_modules/.bin/* 2>/dev/null || true
chmod +x node_modules/@prisma/engines/* 2>/dev/null || true
find node_modules/@prisma -type f -exec chmod +x {} \; 2>/dev/null || true

# Ensure schema is MySQL (in case deploy had sqlite)
if grep -q 'provider = "sqlite"' apps/api/prisma/schema.prisma 2>/dev/null; then
  sed -i.bak 's/provider = "sqlite"/provider = "mysql"/' apps/api/prisma/schema.prisma
  echo ">> Switched Prisma schema to MySQL"
fi

# Push schema to database (creates tables)
echo ">> Pushing schema to database..."
cd apps/api
npx prisma db push
cd "$REPO_ROOT"

# Seed (optional; creates default user etc.)
echo ">> Seeding database..."
npm run db:seed

echo ">> Done. You can open your app at https://aem-residence.com/zulbera"
