import { Body, Container, Heading, Preview, Section, Text } from '@react-email/components'
import 'react'
import { Button } from '../components/button.js'
import { Footer } from '../components/footer.js'
import { Logo } from '../components/logo.js'
import {
  EmailThemeProvider,
  getEmailInlineStyles,
  getEmailThemeClasses,
} from '../components/theme.js'

interface Props {
  newEmail: string
  fullName?: string
  appName?: string
  sessionsUrl?: string
}

export function EmailChangedNotification({
  newEmail,
  fullName = '',
  appName = 'App',
  sessionsUrl,
}: Props) {
  const firstName = fullName ? fullName.split(' ').at(0) : ''
  const previewText = `${firstName ? `Hi ${firstName}, ` : ''}Your email was changed`
  const themeClasses = getEmailThemeClasses()
  const lightStyles = getEmailInlineStyles('light')

  return (
    <EmailThemeProvider preview={<Preview>{previewText}</Preview>}>
      <Body className={`my-auto mx-auto font-sans ${themeClasses.body}`} style={lightStyles.body}>
        <Container
          className={`my-[40px] mx-auto p-[20px] max-w-[600px] ${themeClasses.container}`}
          style={{
            borderStyle: 'solid',
            borderWidth: 1,
            borderColor: lightStyles.container.borderColor,
          }}
        >
          <Logo />
          <Heading
            className={`text-[21px] font-normal text-center p-0 my-[30px] mx-0 ${themeClasses.heading}`}
            style={{ color: lightStyles.text.color }}
          >
            Your email was changed
          </Heading>

          <Text
            className={`text-[14px] leading-[24px] ${themeClasses.text}`}
            style={{ color: lightStyles.text.color }}
          >
            {firstName ? `Hi ${firstName}` : 'Hello'},
            <br />
            <br />
            Your email address has been updated. If you didn&apos;t make this change, review
            signed-in devices and secure your account.
          </Text>

          <br />

          <Section
            className={`border border-solid ${themeClasses.border}`}
            style={{
              borderColor: lightStyles.container.borderColor,
              padding: '16px',
              borderRadius: '4px',
            }}
          >
            <Text
              className={`text-[14px] mb-2 ${themeClasses.text}`}
              style={{ color: lightStyles.text.color }}
            >
              <strong>New email:</strong> {newEmail}
            </Text>
          </Section>

          {sessionsUrl ? (
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button href={sessionsUrl} variant="solid">
                Review signed-in devices
              </Button>
            </Section>
          ) : null}

          <Footer
            appName={appName}
            href={sessionsUrl}
            label={sessionsUrl ? 'Review signed-in devices' : undefined}
          />
        </Container>
      </Body>
    </EmailThemeProvider>
  )
}

EmailChangedNotification.PreviewProps = {
  newEmail: 'ada@example.com',
  fullName: 'Ada Lovelace',
  appName: 'Matcha',
  sessionsUrl: 'https://example.com/settings/security/sessions',
} satisfies Props

export default EmailChangedNotification
