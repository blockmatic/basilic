import {
  Body,
  Container,
  Heading,
  Preview,
  Text,
} from "@react-email/components";
import "react";

import { Footer } from "../components/footer.js";
import { Logo } from "../components/logo.js";
import {
  EmailThemeProvider,
  getEmailInlineStyles,
  getEmailThemeClasses,
} from "../components/theme.js";

interface Props {
  fullName?: string;
}

export function WelcomeEmail({ fullName = "" }: Props) {
  const firstName = fullName ? fullName.split(" ").at(0) : "";
  const text = `${firstName ? `Hi ${firstName}, ` : ""}Welcome! We're excited to have you.`;
  const themeClasses = getEmailThemeClasses();
  const lightStyles = getEmailInlineStyles("light");

  return (
    <EmailThemeProvider preview={<Preview>{text}</Preview>}>
      <Body
        className={`mx-auto my-auto font-sans ${themeClasses.body}`}
        style={lightStyles.body}
      >
        <Container
          className={`mx-auto my-[40px] max-w-[600px] p-[20px] ${themeClasses.container}`}
          style={{
            borderColor: lightStyles.container.borderColor,
            borderStyle: "solid",
            borderWidth: 1,
          }}
        >
          <Logo />
          <Heading
            className={`mx-0 my-[30px] p-0 text-center text-[21px] font-normal ${themeClasses.heading}`}
            style={{ color: lightStyles.text.color }}
          >
            Welcome!
          </Heading>

          <br />

          <span
            className={`font-medium ${themeClasses.text}`}
            style={{ color: lightStyles.text.color }}
          >
            {firstName ? `Hi ${firstName},` : "Hello,"}
          </span>
          <Text
            className={themeClasses.text}
            style={{ color: lightStyles.text.color }}
          >
            Welcome! We&apos;re excited to have you.
            <br />
            <br />
            If there&apos;s anything we can do to help, just reply. We&apos;re
            always one message away.
          </Text>

          <br />

          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <tr>
              <td
                style={{
                  padding: "0 8px 0 0",
                  verticalAlign: "top",
                  width: "50%",
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
                  padding: "0 0 0 8px",
                  verticalAlign: "top",
                  width: "50%",
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
  );
}

export default WelcomeEmail;
