import Link from 'next/link'

export function SignOutButton() {
  return (
    <Link
      href="/auth/logout"
      className="rounded-md bg-destructive px-4 py-2 text-destructive-foreground hover:bg-destructive/90 text-sm font-medium transition-colors"
    >
      Sign Out
    </Link>
  )
}
