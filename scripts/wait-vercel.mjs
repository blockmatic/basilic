#!/usr/bin/env node
/**
 * Wait for Vercel deployment to complete and return the deployment URL from the API.
 * Uses Vercel REST API to get the deployment created by the GitHub integration for the given commit.
 *
 * Env:
 *   SHA - Commit SHA (github.event.pull_request.head.sha for PR, github.sha for push)
 *   PROJECT - "basilic-fastify" or "basilic-next" (project name, Vercel API accepts id or name)
 *   VERCEL_TOKEN - Required, from vercel.com/account/tokens
 *   VERCEL_TEAM_SLUG - Optional, team slug (e.g. "gaboesquivel") for team projects
 *
 * On success: prints deployment URL (https://...) to stdout, exits 0.
 * On timeout/error: exits 1.
 */
const INITIAL_DELAY_MS = 5 * 60 * 1000 // 5 min before first poll
const MAX_ATTEMPTS = 120 // 120 * 5s = 10 min
const POLL_INTERVAL_MS = 5_000

async function getDeployment() {
  const token = process.env.VERCEL_TOKEN
  const project = process.env.PROJECT
  const sha = process.env.SHA
  const teamSlug = process.env.VERCEL_TEAM_SLUG

  if (!token || !project || !sha) {
    console.error('::error::VERCEL_TOKEN, PROJECT, and SHA env required')
    process.exit(1)
  }

  const params = new URLSearchParams({
    projectId: project,
    sha,
    limit: '10',
  })
  if (teamSlug) params.set('slug', teamSlug)

  const url = `https://api.vercel.com/v6/deployments?${params}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(15_000),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err?.error?.message ?? res.statusText
    console.error('::error::Vercel API error:', res.status, msg)
    if (res.status >= 400 && res.status < 500) process.exit(1)
    return null
  }

  const data = await res.json()
  const deployments = data?.deployments ?? []
  return deployments[0] ?? null
}

async function main() {
  const project = process.env.PROJECT
  const sha = process.env.SHA

  process.stderr.write(`Waiting for Vercel ${project} deployment (sha: ${sha.slice(0, 7)})...\n`)
  process.stderr.write(`Initial delay: ${INITIAL_DELAY_MS / 60_000} min\n`)
  await new Promise(r => setTimeout(r, INITIAL_DELAY_MS))

  for (let i = 1; i <= MAX_ATTEMPTS; i++) {
    let deployment
    try {
      deployment = await getDeployment()
    } catch (err) {
      process.stderr.write(`API request failed: ${err?.message ?? err}\n`)
      deployment = null
    }
    if (deployment) {
      const { state, url: rawUrl } = deployment
      if (state === 'READY' && rawUrl) {
        const url = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`
        process.stderr.write(`Deployment ready at ${url}\n`)
        console.log(url)
        return
      }
      if (state === 'ERROR' || state === 'CANCELED') {
        console.error(`::error::Vercel ${project} deployment failed: ${state}`)
        process.exit(1)
      }
    }

    if (i < MAX_ATTEMPTS) {
      process.stderr.write(
        `Waiting... (${i}/${MAX_ATTEMPTS})${deployment ? ` state=${deployment.state}` : ' (no deployment yet)'}\n`,
      )
      await new Promise(r => setTimeout(r, POLL_INTERVAL_MS))
    }
  }

  console.error(
    `::error::Vercel ${project} deployment did not become ready within ${(INITIAL_DELAY_MS + MAX_ATTEMPTS * POLL_INTERVAL_MS) / 60_000} minutes`,
  )
  process.exit(1)
}

main()
