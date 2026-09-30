import {
  Body,
  Container,
  Heading,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { format } from "date-fns";
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
  signInType: string;
  device: string;
  ipAddress: string;
  timestamp: string;
  signOutUrl: string;
  location?: string;
  fullName?: string;
  appName?: string;
  sessionsUrl?: string;
}

function formatUtcTimestamp(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  const utcAsLocal = new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes()
  );
  return format(utcAsLocal, "MMMM d, yyyy, hh:mm a 'UTC'");
}

export function LoginNotificationEmail({
  signInType,
  device,
  ipAddress,
  timestamp,
  signOutUrl,
  location,
  fullName = "",
  appName = "App",
  sessionsUrl,
}: Props) {
  const firstName = fullName ? fullName.split(" ").at(0) : "";
  const previewText = `New sign-in from ${device}`;
  const themeClasses = getEmailThemeClasses();
  const lightStyles = getEmailInlineStyles("light");
  const detailStyle = { color: lightStyles.text.color };

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
            New sign in to your account
          </Heading>

          <Text
            className={`text-[14px] leading-[24px] ${themeClasses.text}`}
            style={{ color: lightStyles.text.color }}
          >
            {firstName ? `Hi ${firstName}` : "Hello"},
            <br />
            <br />A new device just signed in to your {appName} account. If you
            don&apos;t recognize this device, please check your account for any
            unauthorized activity, and also make sure that the sign in type used
            is secure.
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
              style={detailStyle}
            >
              <strong>Sign in type:</strong> {signInType}
            </Text>
            <Text
              className={`mb-2 text-[14px] ${themeClasses.text}`}
              style={detailStyle}
            >
              <strong>Device:</strong> {device}
            </Text>
            {location ? (
              <Text
                className={`mb-2 text-[14px] ${themeClasses.text}`}
                style={detailStyle}
              >
                <strong>Location:</strong> {location}
              </Text>
            ) : null}
            <Text
              className={`mb-2 text-[14px] ${themeClasses.text}`}
              style={detailStyle}
            >
              <strong>IP:</strong> {ipAddress}
            </Text>
            <Text
              className={`mb-2 text-[14px] ${themeClasses.text}`}
              style={detailStyle}
            >
              <strong>Time:</strong> {formatUtcTimestamp(timestamp)}
            </Text>
          </Section>

          <br />

          <Heading
            className={`mx-0 my-[16px] p-0 text-[16px] font-normal ${themeClasses.heading}`}
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
                {" "}
                If the button does not work,{" "}
                <Link
                  href={sessionsUrl}
                  style={{ color: lightStyles.text.color }}
                >
                  sign out from the sessions page
                </Link>
                .
              </>
            ) : null}
          </Text>

          <Section className="mt-[32px] mb-[32px] text-center">
            <Button href={signOutUrl} variant="solid">
              Sign out of this device
            </Button>
          </Section>

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

LoginNotificationEmail.PreviewProps = {
  appName: "Matcha",
  device: "Chrome on macOS",
  fullName: "Ada Lovelace",
  ipAddress: "186.15.124.195",
  location: "Concepción, Costa Rica",
  sessionsUrl: "https://example.com/settings/security/sessions",
  signInType: "Email code",
  signOutUrl:
    "https://example.com/auth/session/revoke?verificationId=preview&token=preview",
  timestamp: "2026-09-04T02:17:00.000Z",
} satisfies Props;

export default LoginNotificationEmail;
