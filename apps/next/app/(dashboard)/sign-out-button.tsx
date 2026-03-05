import { Button } from '@repo/ui/components/button'
import { LogOut } from 'lucide-react'
import Link from 'next/link'

export function SignOutButton() {
  return (
    <Button variant="ghost" size="icon" className="size-11 sm:size-9" aria-label="Sign out" asChild>
      <Link href="/auth/logout">
        <LogOut />
      </Link>
    </Button>
  )
}
