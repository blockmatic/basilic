import {
  Body,
  Container,
  Heading,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import "react";

import { Button } from "../components/button.js";
import { Footer } from "../components/footer.js";
import { Logo } from "../components/logo.js";
import {
  EmailThemeProvider,
  getEmailInlineStyles,
  getEmailThemeClasses,
} from "../components/theme.js";

interface Props {
  newEmail: string;
  fullName?: string;
  appName?: string;
  sessionsUrl?: string;
}

export function EmailChangedNotification({
  newEmail,
  fullName = "",
  appName = "App",
  sessionsUrl,
}: Props) {
  const firstName = fullName ? fullName.split(" ").at(0) : "";
  const previewText = `${firstName ? `Hi ${firstName}, ` : ""}Your email was changed`;
  const themeClasses = getEmailThemeClasses();
  const lightStyles = getEmailInlineStyles("light");

  return (
    <EmailThemeProvider preview={<Preview>{previewText}</Preview>}>
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
            Your email was changed
          </Heading>

          <Text
            className={`text-[14px] leading-[24px] ${themeClasses.text}`}
            style={{ color: lightStyles.text.color }}
          >
            {firstName ? `Hi ${firstName}` : "Hello"},
            <br />
            <br />
            Your email address has been updated. If you didn&apos;t make this
            change, review signed-in devices and secure your account.
          </Text>

          <br />

          <Section
            className={`border border-solid ${themeClasses.border}`}
            style={{
              borderColor: lightStyles.container.borderColor,
              borderRadius: "4px",
              padding: "16px",
            }}
          >
            <Text
              className={`mb-2 text-[14px] ${themeClasses.text}`}
              style={{ color: lightStyles.text.color }}
            >
              <strong>New email:</strong> {newEmail}
            </Text>
          </Section>

          {sessionsUrl ? (
            <Section className="mt-[32px] mb-[32px] text-center">
              <Button href={sessionsUrl} variant="solid">
                Review signed-in devices
              </Button>
            </Section>
          ) : null}

          <Footer
            appName={appName}
            href={sessionsUrl}
            label={sessionsUrl ? "Review signed-in devices" : undefined}
          />
        </Container>
      </Body>
    </EmailThemeProvider>
  );
}

EmailChangedNotification.PreviewProps = {
  appName: "Matcha",
  fullName: "Ada Lovelace",
  newEmail: "ada@example.com",
  sessionsUrl: "https://example.com/settings/security/sessions",
} satisfies Props;

export default EmailChangedNotification;
