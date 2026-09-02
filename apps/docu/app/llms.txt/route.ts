import { env } from '@/lib/env'
import { source } from '@/lib/source'

export const revalidate = false

export async function GET(): Promise<Response> {
  const origin = env.NEXT_PUBLIC_SITE_URL
  const fullDumpUrl = new URL('/llms-full.txt', origin).href
  const toc = source
    .getPages()
    .map(page => {
      const url = new URL(page.url, origin).href
      return `- [${page.data.title}](${url}): ${page.data.description}`
    })
    .join('\n')

  const body = `# Basilic Documentation

Full text dump: ${fullDumpUrl}

${toc}
`

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
