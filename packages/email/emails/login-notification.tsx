import { Body, Container, Heading, Preview, Section, Text } from '@react-email/components'
import { Button } from '../components/button'
import { Footer } from '../components/footer'
import { Logo } from '../components/logo'
import { EmailThemeProvider, getEmailInlineStyles, getEmailThemeClasses } from '../components/theme'

interface Props {
  timestamp: string
  ipAddress: string
  location?: string
  device?: string
  userAgent?: string
  fullName?: string
  secureAccountUrl?: string
  thisWasMeUrl?: string
}

export const LoginNotificationEmail = ({
  timestamp,
  ipAddress,
  location,
  device,
  userAgent: _userAgent,
  fullName = '',
  secureAccountUrl,
  thisWasMeUrl,
}: Props) => {
  const firstName = fullName ? fullName.split(' ').at(0) : ''
  const previewText = `${firstName ? `Hi ${firstName}, ` : ''}New sign-in detected`
  const themeClasses = getEmailThemeClasses()
  const lightStyles = getEmailInlineStyles('light')

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString(undefined, {
        dateStyle: 'long',
        timeStyle: 'short',
      })
    } catch {
      return dateString
    }
  }

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
            New sign-in detected
          </Heading>

          <Text
            className={`text-[14px] leading-[24px] ${themeClasses.text}`}
            style={{ color: lightStyles.text.color }}
          >
            {firstName ? `Hi ${firstName}` : 'Hello'},
            <br />
            <br />
            We noticed a new sign-in to your account
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
              <strong>Time:</strong> {formatDate(timestamp)}
            </Text>
            <Text
              className={`text-[14px] mb-2 ${themeClasses.text}`}
              style={{ color: lightStyles.text.color }}
            >
              <strong>IP Address:</strong> {ipAddress}
            </Text>
            {location && (
              <Text
                className={`text-[14px] mb-2 ${themeClasses.text}`}
                style={{ color: lightStyles.text.color }}
              >
                <strong>Location:</strong> {location}
              </Text>
            )}
            {device && (
              <Text
                className={`text-[14px] mb-2 ${themeClasses.text}`}
                style={{ color: lightStyles.text.color }}
              >
                <strong>Device:</strong> {device}
              </Text>
            )}
          </Section>

          <br />

          {secureAccountUrl && (
            <Text
              className={`text-[14px] leading-[24px] ${themeClasses.text}`}
              style={{ color: lightStyles.text.color }}
            >
              If this wasn&apos;t you, secure your account immediately
            </Text>
          )}

          <br />

          <Section className="text-center mt-[32px] mb-[32px]">
            {thisWasMeUrl && (
              <Button href={thisWasMeUrl} variant="secondary" className="mr-2">
                This was me
              </Button>
            )}
            {secureAccountUrl && <Button href={secureAccountUrl}>Secure account</Button>}
          </Section>

          <br />
          <Footer />
        </Container>
      </Body>
    </EmailThemeProvider>
  )
}

export default LoginNotificationEmail
