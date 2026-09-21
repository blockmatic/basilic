import { expect, test } from '@playwright/test'

test.describe('Public routes', () => {
  test('privacy page shows title and back link', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Back to login' })).toBeVisible()
  })

  test('terms page shows title and back link', async ({ page }) => {
    await page.goto('/terms')
    await expect(page.getByRole('heading', { name: 'Terms of Service' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Back to login' })).toBeVisible()
  })

  test('login page shows welcome and email form', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.getByText('Welcome to Basilic')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.getByTestId('send-magic-link')).toBeVisible()
  })

  test('login OAuth icon buttons are disabled when providers unconfigured', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.getByRole('button', { name: /Continue with GitHub/i })).toBeDisabled({
      timeout: 15_000,
    })
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeDisabled()
    await expect(page.getByRole('button', { name: /Continue with Facebook/i })).toBeDisabled()
    await expect(page.getByRole('button', { name: /Continue with X/i })).toBeDisabled()
  })

  test('login wallet modal filters by search', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByTestId('login-wallet').click()
    await expect(page.getByTestId('wallet-modal')).toBeVisible()
    await page.getByTestId('wallet-search').fill('phan')
    await expect(page.getByTestId('wallet-row-phantom')).toBeVisible()
    await page.getByTestId('wallet-search').fill('zzz-no-wallet')
    await expect(page.getByText('No wallets match that search.')).toBeVisible()
  })

  test('login wallet verify shows WALLET_NOT_LINKED without raw JSON', async ({ page }) => {
    await page.route('**/auth/web3/eip155/nonce**', async route => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 204 })
        return
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ nonce: 'a'.repeat(16) }),
      })
    })
    await page.route('**/auth/web3/eip155/verify', async route => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'content-type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
          },
        })
        return
      }
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          code: 'WALLET_NOT_LINKED',
          message:
            'This wallet is not linked to an account. Sign in with email or another method first, then link a wallet in Settings.',
        }),
      })
    })
    await page.addInitScript(() => {
      const address = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
      let unlocked = false
      const listeners = new Map<string, Set<(...args: unknown[]) => void>>()
      const provider = {
        isMetaMask: true,
        on(event: string, handler: (...args: unknown[]) => void) {
          const set = listeners.get(event) ?? new Set()
          set.add(handler)
          listeners.set(event, set)
        },
        removeListener(event: string, handler: (...args: unknown[]) => void) {
          listeners.get(event)?.delete(handler)
        },
        emit(event: string, ...args: unknown[]) {
          for (const handler of listeners.get(event) ?? []) handler(...args)
        },
        request: async (args: { method: string; params?: unknown[] } | string) => {
          const method = typeof args === 'string' ? args : args.method
          if (method === 'eth_requestAccounts') {
            unlocked = true
            return [address]
          }
          if (method === 'eth_accounts') return unlocked ? [address] : []
          if (method === 'wallet_requestPermissions')
            return [
              {
                parentCapability: 'eth_accounts',
                caveats: [{ type: 'restrictReturnedAccounts', value: [address] }],
              },
            ]
          if (method === 'wallet_revokePermissions') return null
          if (method === 'wallet_switchEthereumChain') {
            queueMicrotask(() => provider.emit('chainChanged', '0x1'))
            return null
          }
          if (method === 'personal_sign' || method === 'eth_sign') return `0x${'ab'.repeat(65)}`
          if (method === 'net_version') return '1'
          if (method === 'eth_chainId') return '0x1'
          return null
        },
      }
      const info = {
        uuid: '00000000-0000-0000-0000-000000000001',
        name: 'MetaMask',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"></svg>',
        rdns: 'io.metamask',
      }
      const announce = () =>
        window.dispatchEvent(
          new CustomEvent('eip6963:announceProvider', {
            detail: Object.freeze({ info, provider }),
          }),
        )
      Object.assign(window, { ethereum: provider })
      announce()
      window.addEventListener('eip6963:requestProvider', announce)
    })
    await page.goto('/auth/login')
    await page.getByTestId('login-wallet').click()
    await page.getByTestId('wallet-row-metamask').click()
    await expect(
      page.getByText('This wallet is not linked to an account', { exact: false }),
    ).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/"code":"WALLET_NOT_LINKED"/)).toHaveCount(0)
  })

  test('robots.txt and sitemap.xml return 200', async ({ request }) => {
    const robots = await request.get('/robots.txt')
    expect(robots.status()).toBe(200)
    const sitemap = await request.get('/sitemap.xml')
    expect(sitemap.status()).toBe(200)
  })
})
