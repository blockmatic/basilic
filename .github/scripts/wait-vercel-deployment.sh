#!/usr/bin/env bash
# Poll Vercel API for a deployment matching GITHUB_SHA. Outputs URL when READY.
# On timeout or no deployment (e.g. turbo-ignore), exits 0 so PR is not blocked.
# Usage: wait-vercel-deployment.sh <project_name> [timeout_minutes] [output_name]
# output_name: optional, used as output key (deployment_url_<name>). Default: deployment_url
# Requires: VERCEL_TOKEN, VERCEL_TEAM_SLUG (or VERCEL_TEAM_ID), GITHUB_SHA

set -euo pipefail

PROJECT_NAME="${1:?project name required}"
TIMEOUT_MIN="${2:-18}"
[[ -n "${3:-}" ]] && OUTPUT_KEY="deployment_url_$3" || OUTPUT_KEY="deployment_url"
POLL_SEC=45
API_BASE="https://api.vercel.com"

die() { echo "::error::$*" >&2; exit 1; }

[[ -n "${VERCEL_TOKEN:-}" ]] || die "VERCEL_TOKEN is required"
[[ -n "${GITHUB_SHA:-}" ]] || die "GITHUB_SHA is required"

# Resolve team: use slug for projects API, teamId for deployments API
TEAM_ID="${VERCEL_TEAM_ID:-}"
if [[ -z "$TEAM_ID" && -n "${VERCEL_TEAM_SLUG:-}" ]]; then
  TEAM_RESP=$(curl -sf -H "Authorization: Bearer ${VERCEL_TOKEN}" \
    "https://api.vercel.com/v2/teams" 2>/dev/null || true)
  TEAM_ID=$(echo "$TEAM_RESP" | jq -r --arg slug "${VERCEL_TEAM_SLUG}" '.teams[]? | select(.slug == $slug) | .id' | head -1)
fi

[[ -n "${TEAM_ID:-}" || -n "${VERCEL_TEAM_SLUG:-}" ]] || die "VERCEL_TEAM_ID or VERCEL_TEAM_SLUG is required"

TEAM_PARAM=""
if [[ -n "$TEAM_ID" ]]; then
  TEAM_PARAM="teamId=${TEAM_ID}"
else
  TEAM_PARAM="slug=${VERCEL_TEAM_SLUG}"
fi

# Get project ID by name (project name can be used as idOrName in some endpoints)
PROJECT_RESP=$(curl -sf -H "Authorization: Bearer ${VERCEL_TOKEN}" \
  "${API_BASE}/v9/projects/${PROJECT_NAME}?${TEAM_PARAM}" 2>/dev/null || true)

if [[ -z "$PROJECT_RESP" ]]; then
  echo "::warning::Could not fetch project ${PROJECT_NAME}; deployment may be skipped"
  exit 0
fi

PROJECT_ID=$(echo "$PROJECT_RESP" | jq -r '.id // empty')
[[ -n "$PROJECT_ID" ]] || { echo "::warning::Project ${PROJECT_NAME} not found"; exit 0; }

DEPLOY_PARAMS="projectId=${PROJECT_ID}"
[[ -n "$TEAM_ID" ]] && DEPLOY_PARAMS="${DEPLOY_PARAMS}&teamId=${TEAM_ID}"

echo "::group::Waiting for Vercel deployment (${PROJECT_NAME} @ ${GITHUB_SHA})"
echo "Waiting 5min for Vercel to start build..."
sleep 300
START=$(date +%s)
TIMEOUT_SEC=$((TIMEOUT_MIN * 60))

while true; do
  ELAPSED=$(($(date +%s) - START))
  [[ $ELAPSED -ge $TIMEOUT_SEC ]] && break

  RESP=$(curl -sf -H "Authorization: Bearer ${VERCEL_TOKEN}" \
    "${API_BASE}/v6/deployments?${DEPLOY_PARAMS}&limit=20" 2>/dev/null || true)

  if [[ -n "$RESP" ]]; then
    # Find deployment matching GITHUB_SHA with status READY
    URL=$(echo "$RESP" | jq -r --arg sha "$GITHUB_SHA" '
      .deployments[]? |
      select((.meta.githubCommitSha == $sha or .meta.githubCommitRef == $sha) or .meta.gitSource.sha == $sha) |
      select(.readyState == "READY") |
      .url // empty
    ' | head -1)

    # Also try meta.githubCommitSha at top level (API response shape varies)
    [[ -z "$URL" ]] && URL=$(echo "$RESP" | jq -r --arg sha "$GITHUB_SHA" '
      .deployments[]? |
      select(.readyState == "READY") |
      select(.meta.githubCommitSha == $sha or .meta.githubCommitRef == $sha or .gitSource.sha == $sha) |
      .url // empty
    ' | head -1)

    # Fallback: match by gitSource.sha in deployment
    [[ -z "$URL" ]] && URL=$(echo "$RESP" | jq -r --arg sha "$GITHUB_SHA" '
      .deployments[]? |
      select(.readyState == "READY") |
      select(.gitSource.sha == $sha) |
      .url // empty
    ' | head -1)

    if [[ -n "$URL" ]]; then
      [[ "$URL" != https* ]] && URL="https://${URL}"
      echo "${OUTPUT_KEY}=${URL}" >> "$GITHUB_OUTPUT"
      echo "Deployment ready: ${URL}"
      echo "::endgroup::"
      exit 0
    fi
  fi

  echo "  [${ELAPSED}s/${TIMEOUT_SEC}s] No ready deployment yet, retrying in ${POLL_SEC}s..."
  sleep "$POLL_SEC"
done

echo "::notice::Timeout after ${TIMEOUT_MIN}min (build may have been ignored). Skipping E2E."
echo "${OUTPUT_KEY}=" >> "$GITHUB_OUTPUT"
echo "::endgroup::"
exit 0
