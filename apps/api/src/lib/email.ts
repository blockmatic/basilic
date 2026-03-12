/** Trim and lowercase email for consistent lookup and storage. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export type EmailProvider = {
  emails: {
    send: (options: {
      from: string
      to: string
      subject: string
      html: string
      text?: string
    }) => Promise<
      | { data: { id: string }; error: null }
      | { data: null; error: { message: string; name?: string } }
    >
  }
}

declare global {
  var __testEmailProvider: EmailProvider | null | undefined
}
