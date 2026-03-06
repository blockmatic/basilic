import { Card, CardContent, CardHeader } from '@repo/ui/components/card'
import Image from 'next/image'
import type { ReactNode } from 'react'

export type NewsListArticle = {
  source?: { id?: string; name?: string }
  author?: string
  title?: string
  description?: string
  url?: string
  urlToImage?: string
  publishedAt?: string
  content?: string
}

type NewsListProps = {
  articles?: NewsListArticle[]
  error?: string
  fallback?: ReactNode
}

export function NewsList({ articles, error, fallback }: NewsListProps) {
  if (fallback) return <div className="mx-auto max-w-2xl space-y-4">{fallback}</div>
  if (error)
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-destructive text-sm">{error}</p>
      </div>
    )
  if (!articles?.length)
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-muted-foreground text-sm">No headlines available.</p>
      </div>
    )

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {articles.map((a, i) => (
        <Card key={a.url ?? i}>
          <CardHeader className="pb-2">
            {a.urlToImage && (
              <a
                href={a.url ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block aspect-video w-full overflow-hidden rounded-md"
              >
                <Image
                  src={a.urlToImage}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 672px) 100vw, 672px"
                  unoptimized
                />
              </a>
            )}
            <p className="text-muted-foreground text-xs">{a.source?.name ?? 'Unknown'}</p>
            {a.publishedAt && (
              <time dateTime={a.publishedAt} className="text-muted-foreground text-xs">
                {new Date(a.publishedAt).toLocaleDateString()}
              </time>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href={a.url ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
            >
              {a.title ?? 'Untitled'}
            </a>
            {a.description && <p className="text-muted-foreground text-sm">{a.description}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
