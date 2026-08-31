'use client'

import { Button } from '@repo/ui/components/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@repo/ui/components/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui/components/tooltip'
import { useIsMobile } from '@repo/ui/hooks/use-mobile'
import { cn } from '@repo/ui/lib/utils'
import { useLocalStorageState } from 'ahooks'
import { MessageCircleIcon, PanelRightCloseIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useState } from 'react'

const AssistantChat = dynamic(() => import('./assistant-chat').then(m => m.AssistantChat), {
  loading: () => <AssistantChatSkeleton />,
})

const assistantOpenKey = 'assistant-sidebar-open'
/** Use 640px (sm) so inline aside shows from tablet up; Sheet overlay only on small phones. */
const assistantMobileBreakpoint = 640

function AssistantChatSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-3 p-4 animate-pulse">
      <div className="h-4 w-3/4 rounded bg-muted" />
      <div className="h-4 w-1/2 rounded bg-muted" />
      <div className="mt-auto h-10 rounded bg-muted" />
    </div>
  )
}

export function AssistantSidebar() {
  const isMobile = useIsMobile(assistantMobileBreakpoint)
  const [open, setOpen] = useLocalStorageState(assistantOpenKey, { defaultValue: true })
  const [mobileOpen, setMobileOpen] = useState(false)

  if (isMobile)
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-4 right-4 z-40 size-12 rounded-full shadow-lg sm:bottom-6 sm:right-6 sm:hidden"
            size="icon"
            aria-label="Open assistant"
          >
            <MessageCircleIcon className="size-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="flex w-[85vw] flex-col p-0 sm:max-w-md">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle>Assistant</SheetTitle>
          </SheetHeader>
          {mobileOpen ? <AssistantChat hideHeader className="flex-1" /> : null}
        </SheetContent>
      </Sheet>
    )

  return (
    <aside
      className={cn(
        'shrink-0 flex flex-col border-l bg-background transition-[width] duration-200 ease-out max-sm:hidden sm:flex',
        open ? 'w-80' : 'w-12',
      )}
      style={{ height: 'calc(100dvh - 3.5rem)' }}
    >
      {open ? (
        <>
          <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
            <span className="font-heading font-semibold text-sm">Assistant</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label="Collapse assistant"
                  onClick={() => setOpen(false)}
                >
                  <PanelRightCloseIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Collapse</TooltipContent>
            </Tooltip>
          </div>
          <AssistantChat hideHeader className="min-h-0 flex-1" />
        </>
      ) : (
        <div className="flex h-14 shrink-0 items-center justify-center border-b">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label="Expand assistant"
                onClick={() => setOpen(true)}
              >
                <MessageCircleIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Expand assistant</TooltipContent>
          </Tooltip>
        </div>
      )}
    </aside>
  )
}
