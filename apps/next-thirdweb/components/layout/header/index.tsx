'use client'

import Link from 'next/link'
import { ConnectButton } from 'thirdweb/react'
import { generatePayload, isLoggedIn, login, logout } from '@/actions/login'
import { ThemeToggle } from '@/components/layout/header/theme-toggle'
import { client } from '@/lib/thirdweb'
import { Menu } from './menu'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background max-h-[64px] h-[64px]">
      <div className={'flex w-full items-center justify-between p-2 px-10'}>
        <div className="flex items-center gap-3">
          <Link href="/">BasilicEVM</Link>

          <div className="hidden md:flex md:gap-3 md:pl-4 lg:ml-[-1px] lg:gap-10">
            <Menu />
          </div>
        </div>

        <div className="flex justify-end lg:min-w-[300px] lg:gap-5">
          <div className="items-center gap-5 flex">
            <ConnectButton
              client={client}
              auth={{
                isLoggedIn: async (address) => {
                  console.log('checking if logged in!', { address })
                  return await isLoggedIn()
                },
                doLogin: async (params) => {
                  console.log('logging in!')
                  await login(params)
                },
                getLoginPayload: async ({ address }) =>
                  generatePayload({ address }),
                doLogout: async () => {
                  console.log('logging out!')
                  await logout()
                },
              }}
            />
          </div>

          <div className="flex ">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
