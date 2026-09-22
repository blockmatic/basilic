import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  canonicalLocalAppUrls,
  eveAgentUrl,
  formatLocalUrlBanner,
  localDevChildEnv,
  resolveLocalAppUrls,
} from './local-urls.mjs'

test('canonical URLs are named HTTPS .localhost hosts', () => {
  assert.equal(canonicalLocalAppUrls.web, 'https://basilic.localhost')
  assert.equal(canonicalLocalAppUrls.api, 'https://api.basilic.localhost')
  assert.equal(canonicalLocalAppUrls.docu, 'https://docu.basilic.localhost')
  assert.equal(canonicalLocalAppUrls.email, 'https://email.basilic.localhost')
  assert.equal(canonicalLocalAppUrls.agents, 'https://agents.basilic.localhost')
  assert.equal(canonicalLocalAppUrls.chat, undefined)
})

test('resolveLocalAppUrls uses portless get when it prints a URL', () => {
  const spawn = (cmd, args) => {
    assert.equal(cmd, 'pnpm')
    const name = args.at(-1)
    return { status: 0, stdout: `https://fix-ui.${name}.localhost\n` }
  }
  const urls = resolveLocalAppUrls({ spawn })
  assert.equal(urls.web, 'https://fix-ui.basilic.localhost')
  assert.equal(urls.api, 'https://fix-ui.api.basilic.localhost')
})

test('resolveLocalAppUrls keeps HTTPS names when get returns fallback :1355', () => {
  const spawn = (_cmd, args) => {
    const name = args.at(-1)
    return { status: 0, stdout: `http://${name}.localhost:1355\n` }
  }
  const urls = resolveLocalAppUrls({ spawn })
  assert.equal(urls.web, 'https://basilic.localhost')
  assert.equal(urls.api, 'https://api.basilic.localhost')
})

test('resolveLocalAppUrls keeps canonical names when portless get fails', () => {
  const urls = resolveLocalAppUrls({
    spawn: () => ({ status: 1, stdout: '', stderr: 'missing' }),
  })
  assert.deepEqual(urls, canonicalLocalAppUrls)
})

test('formatLocalUrlBanner lists every service', () => {
  const banner = formatLocalUrlBanner()
  assert.match(banner, /https:\/\/basilic\.localhost/)
  assert.match(banner, /https:\/\/api\.basilic\.localhost/)
  assert.match(banner, /\/eve\/command/)
  assert.doesNotMatch(banner, /chat\.basilic/)
  assert.match(banner, /dev:app/)
})

test('localDevChildEnv exports sibling URLs for Turbo children', () => {
  const env = localDevChildEnv({
    env: { PATH: '/bin' },
    urls: {
      ...canonicalLocalAppUrls,
      web: 'https://fix-ui.basilic.localhost',
      api: 'https://fix-ui.api.basilic.localhost',
    },
  })
  assert.equal(env.NEXT_PUBLIC_APP_URL, 'https://fix-ui.basilic.localhost')
  assert.equal(env.NEXT_PUBLIC_API_URL, 'https://fix-ui.api.basilic.localhost')
  assert.equal(env.WEB_APP_URL, 'https://fix-ui.basilic.localhost')
  assert.equal(
    env.EVE_COMMAND_URL,
    eveAgentUrl({ origin: canonicalLocalAppUrls.agents, id: 'command' }),
  )
  assert.equal(env.EVE_CHAT_URL, eveAgentUrl({ origin: canonicalLocalAppUrls.agents, id: 'chat' }))
})
