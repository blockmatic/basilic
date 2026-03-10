import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

type PolicyPageShellProps = {
  title: string
  updatedAt: string
  contactEmail: string
  children: React.ReactNode
}

export function PolicyPageShell({
  title,
  updatedAt,
  contactEmail,
  children,
}: PolicyPageShellProps) {
  return (
    <div className="min-h-svh p-4 md:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/auth/login"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Back to login
        </Link>
        <h1 className="font-heading text-lg font-semibold md:text-xl">{title}</h1>
        <p className="text-muted-foreground text-sm">Last updated: {updatedAt}</p>
        <div className="space-y-6 text-sm">{children}</div>
        <p className="text-muted-foreground text-sm">
          For questions, contact us at{' '}
          <a href={`mailto:${contactEmail}`} className="text-primary underline underline-offset-4">
            {contactEmail}
          </a>
          .
        </p>
      </div>
    </div>
  )
}
