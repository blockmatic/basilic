import { Body, Container, Heading, Preview, Section, Text } from '@react-email/components'
import 'react'
import { Footer } from '../components/footer.js'
import { Logo } from '../components/logo.js'
import {
  Button,
  EmailThemeProvider,
  getEmailInlineStyles,
  getEmailThemeClasses,
} from '../components/theme.js'

interface Props {
  changeEmailLink: string
  loginCode: string
  expirationMinutes?: number
  fullName?: string
}

export function ChangeEmailEmail({
  changeEmailLink,
  loginCode,
  expirationMinutes = 15,
  fullName = '',
}: Props) {
  const firstName = fullName ? fullName.split(' ').at(0) : ''
  const previewText = `${firstName ? `Hi ${firstName}, ` : ''}Update your email`
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
            Update your email
          </Heading>

          <Text
            className={`text-[14px] leading-[24px] ${themeClasses.text}`}
            style={{ color: lightStyles.text.color }}
          >
            {firstName ? `Hi ${firstName}` : 'Hello'},
            <br />
            <br />
            Use the code below or click the button to update your email address. This link will
            expire in {expirationMinutes} minutes.
          </Text>

          <Section className="my-6 text-center">
            <Text
              className="font-mono text-[28px] font-bold tracking-[0.25em]"
              style={{ color: lightStyles.text.color }}
            >
              {loginCode}
            </Text>
          </Section>

          <Section className="text-center mt-[32px] mb-[32px]">
            <Button href={changeEmailLink}>Update email</Button>
          </Section>

          <Text
            className={`text-xs ${themeClasses.mutedText}`}
            style={{ color: lightStyles.mutedText.color }}
          >
            If you didn&apos;t request this change, you can safely ignore this email.
          </Text>

          <br />
          <Footer />
        </Container>
      </Body>
    </EmailThemeProvider>
  )
}

export default ChangeEmailEmail
