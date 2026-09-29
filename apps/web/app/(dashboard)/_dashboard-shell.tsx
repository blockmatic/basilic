'use client'

import { Button } from '@repo/ui/components/button'
import { ScrollArea } from '@repo/ui/components/scroll-area'
import { ApiHealthBadge } from 'components/shared/api-health-badge'
import { GalleryVerticalEnd, PanelRightOpenIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useQueryStates } from 'nuqs'
import { Suspense } from 'react'
import { chromeParsers } from '@/lib/coins/chrome'
import { AccountMenu } from './account-menu'
import { PageTitle } from './page-title'

function isBoardPath({ pathname }: { pathname: string }): boolean {
  return pathname === '/' || pathname === '/markets'
}

function BoardRailOpenButton() {
  const pathname = usePathname()
  const [{ sidebar }, setChrome] = useQueryStates(chromeParsers)
  if (!isBoardPath({ pathname }) || sidebar !== 'close') return null
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-11 sm:size-9"
      aria-label="Open commands"
      type="button"
      onClick={() => setChrome({ sidebar: 'open' })}
    >
      <PanelRightOpenIcon aria-hidden="true" />
    </Button>
  )
}

export function DashboardShell({
  children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  const pathname = usePathname()
  const isBoard = isBoardPath({ pathname })

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden">
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4 md:gap-4 md:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
          <Link href="/" className="font-heading flex shrink-0 items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd />
            </div>
            Basilic
          </Link>
          <PageTitle />
        </div>
        <div className="flex min-h-11 items-center gap-3 md:gap-4">
          <Suspense fallback={null}>
            <BoardRailOpenButton />
          </Suspense>
          <ApiHealthBadge />
          <AccountMenu />
        </div>
      </header>
      {isBoard ? (
        <main className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</main>
      ) : (
        <ScrollArea
          orientation="vertical"
          className="min-h-0 min-w-0 flex-1"
          style={{ height: 'calc(100dvh - 3.5rem)' }}
        >
          <main className="block p-4 md:p-6">{children}</main>
        </ScrollArea>
      )}
    </div>
  )
}
