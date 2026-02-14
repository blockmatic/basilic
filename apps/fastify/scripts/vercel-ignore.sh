#!/bin/bash
cd "$(dirname "$0")/../.." || exit 1
# Use fallback when VERCEL_GIT_PREVIOUS_SHA is empty (first deploy, PR preview)
prev="${VERCEL_GIT_PREVIOUS_SHA:-HEAD~10}"
git diff --name-only "$prev" "$VERCEL_GIT_COMMIT_SHA" -- \
  apps/fastify apps/next packages/email packages/sentry packages/utils packages/ui packages/core packages/react \
  package.json pnpm-lock.yaml | grep -q . && exit 1
exit 0
