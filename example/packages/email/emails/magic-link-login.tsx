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
  magicLink: string;
  loginCode: string;
  expirationMinutes?: number;
  fullName?: string;
}

export function MagicLinkLoginEmail({
  magicLink,
  loginCode,
  expirationMinutes = 15,
  fullName = "",
}: Props): React.JSX.Element {
  const firstName = fullName ? fullName.split(" ").at(0) : "";
  const previewText = `${firstName ? `Hi ${firstName}, ` : ""}Sign in to your account`;
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
            Sign in to your account
          </Heading>

          <Text
            className={`text-[14px] leading-[24px] ${themeClasses.text}`}
            style={{ color: lightStyles.text.color }}
          >
            {firstName ? `Hi ${firstName}` : "Hello"},
            <br />
            <br />
            Use the code below or click the button to sign in. This link will
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

          <Section className="mt-[32px] mb-[32px] text-center">
            <Button href={magicLink}>Sign in</Button>
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

export default MagicLinkLoginEmail;
