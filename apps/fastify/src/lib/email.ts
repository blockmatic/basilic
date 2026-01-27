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
