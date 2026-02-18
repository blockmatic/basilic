import { test as base } from '@playwright/test'
import { Keypair } from '@solana/web3.js'
import nacl from 'tweetnacl'

/** Deterministic keypair for E2E: 32 zero bytes as seed */
const TEST_KEYPAIR = Keypair.fromSeed(new Uint8Array(32).fill(0))
const PUBLIC_KEY_B58 = TEST_KEYPAIR.publicKey.toBase58()
const PUBLIC_KEY_BYTES_B64 = Buffer.from(TEST_KEYPAIR.publicKey.toBytes()).toString('base64')

async function installSolanaMock(page: import('@playwright/test').Page) {
  await page.exposeFunction('solanaSignMessage', (messageBase64: string) => {
    const messageBytes = Buffer.from(messageBase64, 'base64')
    const signature = nacl.sign.detached(messageBytes, TEST_KEYPAIR.secretKey)
    return Buffer.from(signature).toString('base64')
  })

  await page.addInitScript(
    ({ publicKeyB58, publicKeyBytesB64 }: { publicKeyB58: string; publicKeyBytesB64: string }) => {
      const pubkeyBytes = Uint8Array.from(atob(publicKeyBytesB64), c => c.charCodeAt(0))
      const publicKey = {
        toBase58: () => publicKeyB58,
        toBytes: () => pubkeyBytes,
      }
      const mock = {
        isPhantom: true,
        get isConnected() {
          return mock._connected
        },
        publicKey,
        connect: () => {
          mock._connected = true
          mock.emit('connect', publicKey)
          return Promise.resolve()
        },
        disconnect: () => {
          mock._connected = false
          mock.emit('disconnect')
          return Promise.resolve()
        },
        signMessage: async (message: Uint8Array) => {
          const binary = Array.from(message, c => String.fromCharCode(c)).join('')
          const base64 = btoa(binary)
          const sigBase64 = await (
            window as unknown as { solanaSignMessage: (b: string) => Promise<string> }
          ).solanaSignMessage(base64)
          const sigBytes = Uint8Array.from(atob(sigBase64), c => c.charCodeAt(0))
          return { signature: sigBytes, publicKey }
        },
        on: () => {},
        off: () => {},
        removeListener: () => {},
        emit: (..._args: unknown[]) => {},
        _connected: false,
      }
      ;(window as unknown as { solana: typeof mock }).solana = mock
      ;(window as unknown as { phantom?: { solana: typeof mock } }).phantom = { solana: mock }
    },
    { publicKeyB58: PUBLIC_KEY_B58, publicKeyBytesB64: PUBLIC_KEY_BYTES_B64 },
  )
}

export const test = base.extend({
  page: async ({ page }, use) => {
    await installSolanaMock(page)
    await use(page)
  },
})

export { expect } from '@playwright/test'
