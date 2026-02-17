#!/usr/bin/env bash
# Poll Vercel API for a deployment matching GITHUB_BRANCH_REF (PR branch). Outputs URL when READY.
# Usage: wait-vercel-deployment.sh <project_name> [output_name]
# output_name: optional, used as output key (deployment_url_<name>). Default: deployment_url
# Requires: VERCEL_TOKEN, VERCEL_TEAM_ID (or VERCEL_TEAM_SLUG), GITHUB_BRANCH_REF
# Polling: 5 min initial sleep, then 30 retries @ 15s (~7.5 min). Fails (exit 1) on timeout.

set -euo pipefail

PROJECT_NAME="${1:?project name required}"
[[ -n "${2:-}" ]] && OUTPUT_KEY="deployment_url_$2" || OUTPUT_KEY="deployment_url"
RETRIES=30
POLL_SEC=15
API_BASE="https://api.vercel.com"

die() {
  echo "::error::$*" >&2
  exit 1
}

[[ -n "${VERCEL_TOKEN:-}" ]] || die "VERCEL_TOKEN is required"
[[ -n "${GITHUB_BRANCH_REF:-}" ]] || die "GITHUB_BRANCH_REF is required"

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

# Get project ID by name
PROJECT_RESP=$(curl -sf -H "Authorization: Bearer ${VERCEL_TOKEN}" \
  "${API_BASE}/v9/projects/${PROJECT_NAME}?${TEAM_PARAM}" 2>/dev/null || true)

if [[ -z "$PROJECT_RESP" ]]; then
  die "Could not fetch project ${PROJECT_NAME}"
fi

PROJECT_ID=$(echo "$PROJECT_RESP" | jq -r '.id // empty')
[[ -n "$PROJECT_ID" ]] || die "Project ${PROJECT_NAME} not found"

DEPLOY_PARAMS="projectId=${PROJECT_ID}&limit=10"
[[ -n "$TEAM_ID" ]] && DEPLOY_PARAMS="${DEPLOY_PARAMS}&teamId=${TEAM_ID}"

echo "::group::Waiting for Vercel deployment (${PROJECT_NAME} @ ${GITHUB_BRANCH_REF})"
echo "Waiting 5min for Vercel to start build..."
sleep 300

for i in $(seq 1 "$RETRIES"); do
  RESP=$(curl -sf -H "Authorization: Bearer ${VERCEL_TOKEN}" \
    "${API_BASE}/v6/deployments?${DEPLOY_PARAMS}" 2>/dev/null || true)

  if [[ -n "$RESP" ]]; then
    URL=$(echo "$RESP" | jq -r --arg ref "$GITHUB_BRANCH_REF" '
      .deployments[]? |
      select(.readyState == "READY") |
      select(.meta.githubCommitRef == $ref) |
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

  echo "  [${i}/${RETRIES}] No ready deployment for branch ${GITHUB_BRANCH_REF} yet, retrying in ${POLL_SEC}s..."
  [[ $i -lt $RETRIES ]] && sleep "$POLL_SEC"
done

die "No Vercel deployment found for branch ${GITHUB_BRANCH_REF} after ${RETRIES} attempts. Ensure the project is connected to this repo and previews are enabled."
