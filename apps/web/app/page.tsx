import { ApiHealthBadge } from '@/components/api-health-badge'

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <h1 className="text-4xl font-bold">Hello World</h1>
        <p className="text-muted-foreground text-lg">Welcome to the Basilic Next.js application</p>
        <div className="flex justify-center">
          <ApiHealthBadge />
        </div>
      </div>
    </main>
  )
}
