#!/bin/bash
cd "$(dirname "$0")/../.." || exit 1
[ -z "$VERCEL_GIT_PREVIOUS_SHA" ] && exit 1
git diff --name-only "$VERCEL_GIT_PREVIOUS_SHA" "$VERCEL_GIT_COMMIT_SHA" -- \
  apps/fastify apps/next packages/email packages/sentry packages/utils packages/ui packages/core packages/react \
  package.json pnpm-lock.yaml | grep -q . && exit 1
exit 0
