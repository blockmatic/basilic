import Link from 'next/link'
import { LandingSection } from '@/components/landing/section'

const groups = [
  {
    title: 'Tech',
    body: 'Versioned stack skills. Agent loads when relevant.',
    items: ['next-v16', 'fastify-v5', 'tanstack-query-v5'],
  },
  {
    title: 'Patterns',
    body: 'Unversioned craft and guidelines.',
    items: ['composition-patterns', 'frontend-design', 'vercel-react'],
  },
  {
    title: 'Workflow',
    body: 'Basilic `/w-*` playbooks (skills.sh); install with `pnpm setup:skills`.',
    items: ['/w-plan', '/w-build', '/w-ship'],
  },
]

export function Skills() {
  return (
    <LandingSection bordered>
      <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">Skills</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        On-demand expertise under <code className="font-mono text-foreground">.agents/skills/</code>
        : committed stack skills plus{' '}
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
