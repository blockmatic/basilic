import { DownloadError, type Experimental_DownloadFunction } from 'ai'

export const denyRemoteChatFileDownload: Experimental_DownloadFunction = requestedDownloads =>
  Promise.all(
    requestedDownloads.map(({ url }) => {
      if (url.protocol === 'data:') return null
      throw new DownloadError({
        url: url.toString(),
        message: 'Remote file URLs are not allowed',
      })
    }),
  )
