import Link from 'next/link'

const steps = [
  { label: 'create' },
  { label: 'setup' },
  { label: 'db:start' },
  { label: 'reset' },
  { label: 'dev' },
]

export function RunIt() {
  return (
    <section className="border-t border-border px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-heading text-lg font-semibold tracking-tight md:text-xl">Run it</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Product Ready commands, in order.{' '}
          <Link
            href="/docs/development"
            className="text-primary underline-offset-4 hover:underline"
          >
            Getting Started
          </Link>
        </p>
        <ol className="mt-8 flex flex-col gap-4 md:flex-row md:gap-6">
          {steps.map((step, index) => (
            <li
              key={step.label}
              className="flex items-baseline gap-2 md:flex-1 md:flex-col md:gap-1"
            >
              <span className="text-sm text-muted-foreground">{index + 1}</span>
              <span className="font-mono text-sm md:text-base">{step.label}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
