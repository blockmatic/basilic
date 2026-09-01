import { Card, CardContent, CardHeader } from '@repo/ui/components/card'
import { Skeleton } from '@repo/ui/components/skeleton'

function NewsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-2 pb-2">
        <Skeleton className="aspect-video w-full rounded-md" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </CardContent>
    </Card>
  )
}

// eslint-disable-next-line import/no-default-export -- Next.js requires default export for loading.tsx
export default function NewsLoading(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {Array.from({ length: 4 }, (_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  )
}
