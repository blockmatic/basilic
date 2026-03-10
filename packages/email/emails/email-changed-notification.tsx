import { Body, Container, Heading, Preview, Text } from '@react-email/components'
import 'react'
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
}

export function EmailChangedNotification({ newEmail, fullName = '' }: Props) {
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
            Your email address has been updated to <strong>{newEmail}</strong>.
            <br />
            <br />
            If you didn&apos;t make this change, please contact support immediately.
          </Text>

          <br />
          <Footer />
        </Container>
      </Body>
    </EmailThemeProvider>
  )
}

export default EmailChangedNotification
