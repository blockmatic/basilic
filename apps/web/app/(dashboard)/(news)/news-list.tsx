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
  compact?: boolean
}

export function NewsList({ articles, error, fallback, compact }: NewsListProps) {
  if (fallback)
    return <div className={compact ? 'space-y-2' : 'mx-auto max-w-2xl space-y-4'}>{fallback}</div>
  if (error)
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-destructive text-sm">{error}</p>
      </div>
    )
  if (!articles?.length)
    return (
      <div className={compact ? '' : 'mx-auto max-w-2xl'}>
        <p className="text-muted-foreground text-sm">No headlines available.</p>
      </div>
    )

  if (compact)
    return (
      <ul className="space-y-2">
        {articles.map((a, i) => (
          <li key={a.url ?? i} className="text-sm">
            {a.url ? (
              <a href={a.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {a.title ?? 'Untitled'}
              </a>
            ) : (
              <span>{a.title ?? 'Untitled'}</span>
            )}
            <span className="text-muted-foreground ml-2 text-xs">{a.source?.name ?? ''}</span>
          </li>
        ))}
      </ul>
    )

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {articles.map((a, i) => (
        <Card key={a.url ?? i}>
          <CardHeader className="pb-2">
            {a.urlToImage &&
              (a.url ? (
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block aspect-video w-full overflow-hidden rounded-md"
                >
                  <Image
                    src={a.urlToImage}
                    alt={a.title ?? 'News image'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 672px) 100vw, 672px"
                    unoptimized
                  />
                </a>
              ) : (
                <div className="relative block aspect-video w-full overflow-hidden rounded-md">
                  <Image
                    src={a.urlToImage}
                    alt={a.title ?? 'News image'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 672px) 100vw, 672px"
                    unoptimized
                  />
                </div>
              ))}
            <p className="text-muted-foreground text-xs">{a.source?.name ?? 'Unknown'}</p>
            {a.publishedAt && (
              <time dateTime={a.publishedAt} className="text-muted-foreground text-xs">
                {new Date(a.publishedAt).toLocaleDateString()}
              </time>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {a.url ? (
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline"
              >
                {a.title ?? 'Untitled'}
              </a>
            ) : (
              <span className="font-medium">{a.title ?? 'Untitled'}</span>
            )}
            {a.description && <p className="text-muted-foreground text-sm">{a.description}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
