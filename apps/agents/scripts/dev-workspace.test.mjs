import assert from 'node:assert/strict'
import http from 'node:http'
import { test } from 'node:test'

import { createWorkspaceProxy, eveAgentUrl, mapPublicEvePath } from './dev-workspace.mjs'

test('mapPublicEvePath rewrites Vercel-shaped mounts to /eve/v1', () => {
  assert.deepEqual(mapPublicEvePath({ url: '/eve/command/v1/health' }), {
    id: 'command',
    path: '/eve/v1/health',
  })
  assert.deepEqual(mapPublicEvePath({ url: '/eve/chat/v1/session?x=1' }), {
    id: 'chat',
    path: '/eve/v1/session?x=1',
  })
  assert.equal(mapPublicEvePath({ url: '/eve/v1/health' }), null)
})

test('eveAgentUrl appends the public mount', () => {
  assert.equal(
    eveAgentUrl({ origin: 'https://agents.basilic.localhost', id: 'command' }),
    'https://agents.basilic.localhost/eve/command',
  )
})

test('workspace proxy forwards command and chat mounts', async () => {
  const command = http.createServer((_req, res) => {
    res.writeHead(200, { 'content-type': 'text/plain' })
    res.end('command-ok')
  })
  const chat = http.createServer((_req, res) => {
    res.writeHead(200, { 'content-type': 'text/plain' })
    res.end('chat-ok')
  })
  await Promise.all([
    new Promise(resolve => command.listen(0, '127.0.0.1', resolve)),
    new Promise(resolve => chat.listen(0, '127.0.0.1', resolve)),
  ])
  const proxy = createWorkspaceProxy({
    commandOrigin: `http://127.0.0.1:${command.address().port}`,
    chatOrigin: `http://127.0.0.1:${chat.address().port}`,
  })
  await new Promise(resolve => proxy.listen(0, '127.0.0.1', resolve))
  const port = proxy.address().port
  const commandRes = await fetch(`http://127.0.0.1:${port}/eve/command/v1/health`)
  const chatRes = await fetch(`http://127.0.0.1:${port}/eve/chat/v1/health`)
  const missing = await fetch(`http://127.0.0.1:${port}/eve/v1/health`)
  assert.equal(await commandRes.text(), 'command-ok')
  assert.equal(await chatRes.text(), 'chat-ok')
  assert.equal(missing.status, 404)
  await Promise.all([
    new Promise(resolve => proxy.close(resolve)),
    new Promise(resolve => command.close(resolve)),
    new Promise(resolve => chat.close(resolve)),
  ])
})
