'use client'

import { useUser } from '@repo/react'
import { Button, buttonVariants } from '@repo/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu'
import { cn } from '@repo/ui/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { CircleUserIcon, LogOutIcon, ShieldIcon, UserIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { authSessionJwtQueryKey, authSessionUserQueryKey } from '@/lib/query-keys'

function isActive({
  href,
  pathname,
  matchPrefix,
}: {
  href: string
  pathname: string
  matchPrefix?: boolean
}): boolean {
  return matchPrefix ? pathname === href || pathname.startsWith(`${href}/`) : pathname === href
}

export function AccountMenu() {
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const { data, isLoading } = useUser()

  async function handleSignOut() {
    const response = await fetch('/auth/logout', { redirect: 'manual' })
    const isSuccess =
      response.type === 'opaqueredirect' ||
      response.status === 0 ||
      (response.status >= 200 && response.status < 400)
    if (!isSuccess) {
      toast.error('Sign out failed. Please try again.')
      return
    }
    queryClient.invalidateQueries({ queryKey: authSessionUserQueryKey })
    queryClient.invalidateQueries({ queryKey: authSessionJwtQueryKey })
    window.location.href = '/'
  }

  if (!isLoading && !data?.user)
    return (
      <Link
        href="/auth/login"
        data-testid="header-sign-in"
        className={cn(buttonVariants(), 'min-h-11')}
      >
        Sign in
      </Link>
    )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="size-11 sm:size-9" aria-label="Account" />
        }
      >
        <CircleUserIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuItem
            nativeButton={false}
            render={<Link href="/settings" />}
            data-active={isActive({ href: '/settings', pathname }) || undefined}
          >
            <UserIcon />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            nativeButton={false}
            render={<Link href="/settings/security" />}
            data-active={
              isActive({ href: '/settings/security', pathname, matchPrefix: true }) || undefined
            }
          >
            <ShieldIcon />
            Security
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
            <LogOutIcon />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
