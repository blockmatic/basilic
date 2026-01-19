import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center text-center flex-1 px-4">
      <h1 className="text-4xl font-bold mb-4">Basilic</h1>
      <p className="text-xl text-muted-foreground mb-8">
        A minimal boilerplate for AI and Web3 sites
      </p>
      <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
        Following best practices and AI-driven development with Cursor rules and skills. Built with
        type-safe full-stack TypeScript, REST API with OpenAPI, and portable-by-default
        architecture.
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/docs"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          View Documentation
        </Link>
        <Link
          href="/docs/getting-started"
          className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-accent transition-colors"
        >
          Get Started
        </Link>
      </div>
    </div>
  )
}
