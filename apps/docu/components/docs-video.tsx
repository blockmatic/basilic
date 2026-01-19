'use client'

import { useState } from 'react'

type DocsVideoProps = {
  src?: string
  youtubeId?: string
  vimeoId?: string
  title: string
  caption?: string
  aspectRatio?: '16:9' | '4:3' | '1:1'
}

function getYouTubeEmbedUrl(id: string) {
  return `https://www.youtube.com/embed/${id}`
}

function getVimeoEmbedUrl(id: string) {
  return `https://player.vimeo.com/video/${id}`
}

export function DocsVideo({
  src,
  youtubeId,
  vimeoId,
  title,
  caption,
  aspectRatio = '16:9',
}: DocsVideoProps) {
  const [error, setError] = useState(false)

  const aspectRatioClasses = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
  }

  if (error && caption) {
    return (
      <figure className="my-8 flex flex-col items-center">
        <div className="flex w-full max-w-full items-center justify-center rounded-lg border border-border bg-muted/50 p-8">
          <p className="text-center text-sm text-muted-foreground">Video unavailable: {caption}</p>
        </div>
        <figcaption className="mt-4 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      </figure>
    )
  }

  return (
    <figure className="my-8 flex flex-col items-center">
      <div
        className={`relative w-full max-w-full overflow-hidden rounded-lg border border-border bg-muted/50 ${aspectRatioClasses[aspectRatio]}`}
      >
        {youtubeId ? (
          <iframe
            src={getYouTubeEmbedUrl(youtubeId)}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
            onError={() => setError(true)}
          />
        ) : vimeoId ? (
          <iframe
            src={getVimeoEmbedUrl(vimeoId)}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
            onError={() => setError(true)}
          />
        ) : src ? (
          <video
            src={src}
            controls
            className="h-full w-full"
            title={title}
            onError={() => setError(true)}
          >
            Your browser does not support the video tag.
          </video>
        ) : null}
      </div>
      {caption && (
        <figcaption className="mt-4 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
