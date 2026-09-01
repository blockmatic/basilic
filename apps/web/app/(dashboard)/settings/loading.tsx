import { Skeleton } from '@repo/ui/components/skeleton'

// eslint-disable-next-line import/no-default-export -- Next.js requires default export for loading.tsx
export default function SettingsLoading(): React.JSX.Element {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="space-y-2 rounded-lg border p-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full max-w-md" />
        </div>
      ))}
    </div>
  )
}
