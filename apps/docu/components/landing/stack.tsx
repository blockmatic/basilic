const facts = [
  {
    title: 'Fastify + OpenAPI',
    body: 'REST API with generated TypeScript clients for server and browser.',
  },
  {
    title: 'Next 16 web',
    body: 'App Router demo that proves auth and the typed API.',
  },
  {
    title: 'Expo scaffold',
    body: 'Mobile starter sharing tokens with web. Not a completed product surface.',
  },
  {
    title: 'AGENTS.md',
    body: 'Portable agent contract plus workflow playbooks and skills. Slash is Cursor UX.',
  },
]

export function Stack() {
  return (
    <section className="border-t border-border px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-heading text-lg font-semibold tracking-tight md:text-xl">
          What you get
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {facts.map(fact => (
            <article key={fact.title} className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-heading text-lg font-semibold">{fact.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{fact.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
