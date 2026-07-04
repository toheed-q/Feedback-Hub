#!/bin/bash
set -e

pnpm install --frozen-lockfile
if [ -n "$DATABASE_URL" ]; then
  pnpm --filter @workspace/app run prisma:generate
fi
