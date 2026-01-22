import { Body, Container, Heading, Preview, Text } from '@react-email/components'
import { Footer } from '../components/footer'
import { Logo } from '../components/logo'
import { EmailThemeProvider, getEmailInlineStyles, getEmailThemeClasses } from '../components/theme'

interface Props {
  fullName?: string
}

export const WelcomeEmail = ({ fullName = '' }: Props) => {
  const firstName = fullName ? fullName.split(' ').at(0) : ''
  const text = `${firstName ? `Hi ${firstName}, ` : ''}Welcome! We're excited to have you.`
  const themeClasses = getEmailThemeClasses()
  const lightStyles = getEmailInlineStyles('light')

  return (
    <EmailThemeProvider preview={<Preview>{text}</Preview>}>
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
            Welcome!
          </Heading>

          <br />

          <span
            className={`font-medium ${themeClasses.text}`}
            style={{ color: lightStyles.text.color }}
          >
            {firstName ? `Hi ${firstName},` : 'Hello,'}
          </span>
          <Text className={themeClasses.text} style={{ color: lightStyles.text.color }}>
            Welcome! We&apos;re excited to have you.
            <br />
            <br />
            If there&apos;s anything we can do to help, just reply. We&apos;re always one message
            away.
          </Text>

          <br />

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tr>
              <td
                style={{
                  width: '50%',
                  padding: '0 8px 0 0',
                  verticalAlign: 'top',
                }}
              >
                <Text
                  className={`text-sm font-semibold ${themeClasses.text}`}
                  style={{ color: lightStyles.text.color }}
                >
                  Quick Start
                </Text>
                <Text
                  className={`text-sm ${themeClasses.text}`}
                  style={{ color: lightStyles.text.color }}
                >
                  Get up and running in minutes with our easy setup guide.
                </Text>
              </td>
              <td
                style={{
                  width: '50%',
                  padding: '0 0 0 8px',
                  verticalAlign: 'top',
                }}
              >
                <Text
                  className={`text-sm font-semibold ${themeClasses.text}`}
                  style={{ color: lightStyles.text.color }}
                >
                  Need Help?
                </Text>
                <Text
                  className={`text-sm ${themeClasses.text}`}
                  style={{ color: lightStyles.text.color }}
                >
                  Our support team is here to help you succeed.
                </Text>
              </td>
            </tr>
          </table>

          <Footer />
        </Container>
      </Body>
    </EmailThemeProvider>
  )
}

export default WelcomeEmail
