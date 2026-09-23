import Link from 'next/link'
import { LandingSection } from '@/components/landing/section'

const groups = [
  {
    title: 'Stack',
    body: 'Lock-installed from upstream catalogs (`pnpm setup:skills`).',
    items: ['nextjs', 'ai-sdk', 'shadcn'],
  },
  {
    title: 'Craft',
    body: 'Motion, UI review, and composition skills.',
    items: ['animate', 'vercel-composition-patterns', 'web-design-guidelines'],
  },
  {
    title: 'Workflow',
    body: 'Basilic `/w-*` playbooks under `.agents/skills/workflow/`.',
    items: ['/w-plan', '/w-build', '/w-ship'],
  },
]

export function Skills() {
  return (
    <LandingSection bordered>
      <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
        Coding-agent contract
      </h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        On-demand expertise under <code className="font-mono text-foreground">.agents/skills/</code>
        : lock-installed stack skills plus{' '}
        <Link
          href="https://github.com/blockmatic/basilic-skills"
          className="text-primary underline-offset-4 hover:underline"
        >
          Basilic `/w-*`
        </Link>{' '}
        from{' '}
        <Link
          href="https://skills.sh/blockmatic/basilic-skills"
          className="text-primary underline-offset-4 hover:underline"
        >
          skills.sh
        </Link>
        .{' '}
        <Link
          href="/docs/development/cursor-skills"
          className="text-primary underline-offset-4 hover:underline"
        >
          Skills
        </Link>
      </p>
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {groups.map(group => (
          <article key={group.title} className="landing-card min-w-0 rounded-lg bg-card p-6">
            <h3 className="font-heading text-lg font-semibold">{group.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{group.body}</p>
            <ul className="mt-4 flex flex-col gap-1 font-mono text-sm text-foreground">
              {group.items.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </LandingSection>
  )
}
