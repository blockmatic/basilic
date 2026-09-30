import {
  Body,
  Container,
  Heading,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import "react";

import { Footer } from "../components/footer.js";
import { Logo } from "../components/logo.js";
import {
  Button,
  EmailThemeProvider,
  getEmailInlineStyles,
  getEmailThemeClasses,
} from "../components/theme.js";

interface Props {
  linkUrl: string;
  expirationMinutes?: number;
  fullName?: string;
}

export function LinkEmailEmail({
  linkUrl,
  expirationMinutes = 15,
  fullName = "",
}: Props) {
  const firstName = fullName ? fullName.split(" ").at(0) : "";
  const previewText = `${firstName ? `Hi ${firstName}, ` : ""}Link your email to your account`;
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
            Link your email
          </Heading>

          <Text
            className={`text-[14px] leading-[24px] ${themeClasses.text}`}
            style={{ color: lightStyles.text.color }}
          >
            {firstName ? `Hi ${firstName}` : "Hello"},
            <br />
            <br />
            Click the button below to link this email to your account. This link
            will expire in {expirationMinutes} minutes.
          </Text>

          <br />

          <Section className="mt-[32px] mb-[32px] text-center">
            <Button href={linkUrl}>Link email</Button>
          </Section>

          <Text
            className={`text-xs ${themeClasses.mutedText}`}
            style={{ color: lightStyles.mutedText.color }}
          >
            If you didn&apos;t request this link, you can safely ignore this
            email.
          </Text>

          <br />
          <Footer />
        </Container>
      </Body>
    </EmailThemeProvider>
  );
}

export default LinkEmailEmail;
