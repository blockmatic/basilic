import Link from 'next/link'

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
    body: 'Slash playbooks. Type / then the name.',
    items: ['/plan', '/build', '/test', '/pr', '/prototype'],
  },
]

export function Skills() {
  return (
    <section className="border-t border-border px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-heading text-lg font-semibold tracking-tight md:text-xl">Skills</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          On-demand expertise under{' '}
          <code className="font-mono text-foreground">.agents/skills/</code>.{' '}
          <Link
            href="/docs/development/cursor-skills"
            className="text-primary underline-offset-4 hover:underline"
          >
            Skills
          </Link>
        </p>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {groups.map(group => (
            <article
              key={group.title}
              className="min-w-0 rounded-lg border border-border bg-card p-6"
            >
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
      </div>
    </section>
  )
}
