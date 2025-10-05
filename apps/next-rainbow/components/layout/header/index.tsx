import Link from 'next/link'
import { ThemeToggle } from '@/components/layout/header/theme-toggle'
import { AppConnectButton } from './connect'
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
            <AppConnectButton />
          </div>

          <div className="flex">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
