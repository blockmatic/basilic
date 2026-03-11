import type { EmailProvider } from '../../src/lib/email.js'

type Email = {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
}

const htmlEntityMap: Record<string, string> = {
  amp: '&',
  quot: '"',
  apos: "'",
  lt: '<',
  gt: '>',
}

function decodeHtmlEntities(value: string): string {
  return value.replace(/&(#\d+|#x[\da-fA-F]+|amp|quot|apos|lt|gt);/g, (match, entity) => {
    if (entity.startsWith('#x')) {
      const codePoint = Number.parseInt(entity.slice(2), 16)
      return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint)
    }
    if (entity.startsWith('#')) {
      const codePoint = Number.parseInt(entity.slice(1), 10)
      return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint)
    }
    return htmlEntityMap[entity] ?? match
  })
}

export class FakeEmailProvider implements EmailProvider {
  private outbox: Email[] = []

  emails = {
    send: async (options: {
      from: string
      to: string
      subject: string
      html: string
      text?: string
    }): Promise<{ data: { id: string }; error: null }> => {
      this.outbox.push({
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        from: options.from,
      })
      return {
        data: { id: `fake-email-${this.outbox.length}` },
        error: null,
      }
    },
  }

  last(): Email | undefined {
    return this.outbox[this.outbox.length - 1]
  }

  all(): Email[] {
    return [...this.outbox]
  }

  clear(): void {
    this.outbox = []
  }

  extractMagicLink(email?: Email): string | null {
    const targetEmail = email ?? this.last()
    if (!targetEmail) return null

    const decodedHtml = decodeHtmlEntities(targetEmail.html)

    // Try to extract from HTML first - look for links with "magic-link" in URL
    const htmlMatch = decodedHtml.match(/href=["']([^"']*magic-link[^"']*)["']/i)
    const htmlLink = htmlMatch?.[1]
    if (htmlLink) return htmlLink

    // Try to extract from text if available
    if (targetEmail.text) {
      const textMatch = targetEmail.text.match(/(https?:\/\/[^\s]*magic-link[^\s]*)/i)
      const textLink = textMatch?.[1]
      if (textLink) return textLink
    }

    // Fallback: look for any URL with verificationId parameter (magic link)
    const urlMatch = decodedHtml.match(/href\s*=\s*["']([^"']*[?&]verificationId=[^"'&]*)["']/i)
    const urlLink = urlMatch?.[1]
    if (urlLink) return urlLink

    // Legacy: token parameter (deprecated)
    const tokenUrlMatch = decodedHtml.match(/href\s*=\s*["']([^"']*[?&]token=[^"'&]*)["']/i)
    if (tokenUrlMatch?.[1]) return tokenUrlMatch[1]

    return null
  }

  extractVerificationId(email?: Email): string | null {
    const magicLink = this.extractMagicLink(email)
    if (!magicLink) return null
    try {
      const url = new URL(magicLink)
      return url.searchParams.get('verificationId') ?? url.searchParams.get('token')
    } catch {
      const match = magicLink.match(/[?&](?:verificationId|token)=([^&]+)/)
      return match ? match[1] : null
    }
  }

  /** Extract token from email. Prefer URL params (?token=, ?verificationId=) then regex fallbacks. */
  extractToken(email?: Email): string | null {
    const targetEmail = email ?? this.last()
    if (!targetEmail) return null
    const decodedHtml = decodeHtmlEntities(targetEmail.html)
    const urlToken = this.extractTokenFromUrls(decodedHtml)
    if (urlToken) return urlToken
    const monoMatch = decodedHtml.match(/font-mono[^>]*>\s*(\d{6})\s*</i)
    if (monoMatch) return monoMatch[1]
    const codeMatch = decodedHtml.match(/>\s*(\d{6})\s*</)
    if (codeMatch) return codeMatch[1]
    return null
  }

  private extractTokenFromUrls(html: string): string | null {
    const urlMatch = html.match(/href\s*=\s*["']([^"']*[?&]token=([^"'&]+)[^"']*["'])/i)
    return urlMatch?.[2] ?? null
  }
}
