import assert from 'node:assert/strict'
import http from 'node:http'
import { test } from 'node:test'

import {
  createWorkspaceProxy,
  eveAgentUrl,
  mapPublicEvePath,
  stripHopByHopHeaders,
} from './dev-workspace.mjs'

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

test('stripHopByHopHeaders drops Connection-nominated names', () => {
  assert.deepEqual(
    stripHopByHopHeaders({
      connection: 'close, x-internal',
      'x-internal': 'secret',
      authorization: 'Bearer t',
      'keep-alive': 'timeout=5',
      trailer: 'x-checksum',
    }),
    { authorization: 'Bearer t' },
  )
})

test('proxy strips hop-by-hop headers in both directions', async () => {
  let seen
  const command = http.createServer((req, res) => {
    seen = req.headers
    res.writeHead(200, {
      'content-type': 'text/plain',
      connection: 'close, x-internal',
      'x-internal': 'nope',
      'keep-alive': 'timeout=5',
      trailer: 'x-checksum',
    })
    res.end('ok')
  })
  const chat = http.createServer((_req, res) => {
    res.writeHead(200)
    res.end()
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
  const forwarded = await new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: '/eve/command/v1/health',
        headers: {
          connection: 'close, x-internal',
          'x-internal': 'secret',
          authorization: 'Bearer t',
        },
      },
      res => {
        const chunks = []
        res.on('data', chunk => chunks.push(chunk))
        res.on('end', () =>
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks).toString(),
          }),
        )
      },
    )
    req.on('error', reject)
    req.end()
  })
  assert.equal(forwarded.body, 'ok')
  assert.equal(seen.authorization, 'Bearer t')
  assert.equal(seen['x-internal'], undefined)
  assert.equal(forwarded.headers['x-internal'], undefined)
  assert.equal(forwarded.headers['keep-alive'], undefined)
  assert.equal(forwarded.headers.trailer, undefined)
  await Promise.all([
    new Promise(resolve => proxy.close(resolve)),
    new Promise(resolve => command.close(resolve)),
    new Promise(resolve => chat.close(resolve)),
  ])
})
