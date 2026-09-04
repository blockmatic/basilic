import { Body, Container, Heading, Link, Preview, Section, Text } from '@react-email/components'
import { format } from 'date-fns'
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
  signInType: string
  device: string
  ipAddress: string
  timestamp: string
  signOutUrl: string
  location?: string
  fullName?: string
  appName?: string
  sessionsUrl?: string
}

function formatUtcTimestamp(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const utcAsLocal = new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
  )
  return format(utcAsLocal, "MMMM d, yyyy, hh:mm a 'UTC'")
}

export function LoginNotificationEmail({
  signInType,
  device,
  ipAddress,
  timestamp,
  signOutUrl,
  location,
  fullName = '',
  appName = 'App',
  sessionsUrl,
}: Props) {
  const firstName = fullName ? fullName.split(' ').at(0) : ''
  const previewText = `New sign-in from ${device}`
  const themeClasses = getEmailThemeClasses()
  const lightStyles = getEmailInlineStyles('light')
  const detailStyle = { color: lightStyles.text.color }

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
            New sign in to your account
          </Heading>

          <Text
            className={`text-[14px] leading-[24px] ${themeClasses.text}`}
            style={{ color: lightStyles.text.color }}
          >
            {firstName ? `Hi ${firstName}` : 'Hello'},
            <br />
            <br />A new device just signed in to your {appName} account. If you don&apos;t recognize
            this device, please check your account for any unauthorized activity, and also make sure
            that the sign in type used is secure.
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
            <Text className={`text-[14px] mb-2 ${themeClasses.text}`} style={detailStyle}>
              <strong>Sign in type:</strong> {signInType}
            </Text>
            <Text className={`text-[14px] mb-2 ${themeClasses.text}`} style={detailStyle}>
              <strong>Device:</strong> {device}
            </Text>
            {location ? (
              <Text className={`text-[14px] mb-2 ${themeClasses.text}`} style={detailStyle}>
                <strong>Location:</strong> {location}
              </Text>
            ) : null}
            <Text className={`text-[14px] mb-2 ${themeClasses.text}`} style={detailStyle}>
              <strong>IP:</strong> {ipAddress}
            </Text>
            <Text className={`text-[14px] mb-2 ${themeClasses.text}`} style={detailStyle}>
              <strong>Time:</strong> {formatUtcTimestamp(timestamp)}
            </Text>
          </Section>

          <br />

          <Heading
            className={`text-[16px] font-normal p-0 my-[16px] mx-0 ${themeClasses.heading}`}
            style={{ color: lightStyles.text.color }}
          >
            Don&apos;t recognize this activity?
          </Heading>

          <Text
            className={`text-[14px] leading-[24px] ${themeClasses.text}`}
            style={{ color: lightStyles.text.color }}
          >
            To immediately sign out of this device, use the button below.
            {sessionsUrl ? (
              <>
                {' '}
                If the button does not work,{' '}
                <Link href={sessionsUrl} style={{ color: lightStyles.text.color }}>
                  sign out from the sessions page
                </Link>
                .
              </>
            ) : null}
          </Text>

          <Section className="text-center mt-[32px] mb-[32px]">
            <Button href={signOutUrl} variant="solid">
              Sign out of this device
            </Button>
          </Section>

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

LoginNotificationEmail.PreviewProps = {
  signInType: 'Email code',
  device: 'Chrome on macOS',
  ipAddress: '186.15.124.195',
  timestamp: '2026-09-04T02:17:00.000Z',
  signOutUrl: 'https://example.com/auth/session/revoke?verificationId=preview&token=preview',
  location: 'Concepción, Costa Rica',
  fullName: 'Ada Lovelace',
  appName: 'Matcha',
  sessionsUrl: 'https://example.com/settings/security/sessions',
} satisfies Props

export default LoginNotificationEmail
