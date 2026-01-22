import { Body, Container, Heading, Preview, Section, Text } from '@react-email/components'
import { Footer } from '../components/footer'
import { Logo } from '../components/logo'
import {
  Button,
  EmailThemeProvider,
  getEmailInlineStyles,
  getEmailThemeClasses,
} from '../components/theme'

interface Props {
  magicLink: string
  expirationMinutes?: number
  fullName?: string
}

export const MagicLinkLoginEmail = ({
  magicLink,
  expirationMinutes = 15,
  fullName = '',
}: Props) => {
  const firstName = fullName ? fullName.split(' ').at(0) : ''
  const previewText = `${firstName ? `Hi ${firstName}, ` : ''}Sign in to your account`
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
            Sign in to your account
          </Heading>

          <Text
            className={`text-[14px] leading-[24px] ${themeClasses.text}`}
            style={{ color: lightStyles.text.color }}
          >
            {firstName ? `Hi ${firstName}` : 'Hello'},
            <br />
            <br />
            Click the button below to sign in. This link will expire in {expirationMinutes} minutes.
          </Text>

          <br />

          <Section className="text-center mt-[32px] mb-[32px]">
            <Button href={magicLink}>Sign in</Button>
          </Section>

          <Text
            className={`text-xs ${themeClasses.mutedText}`}
            style={{ color: lightStyles.mutedText.color }}
          >
            If you didn&apos;t request this link, you can safely ignore this email.
          </Text>

          <br />
          <Footer />
        </Container>
      </Body>
    </EmailThemeProvider>
  )
}

export default MagicLinkLoginEmail
