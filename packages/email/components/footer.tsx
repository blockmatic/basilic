import { Hr, Link, Section, Text } from '@react-email/components'
import { getEmailInlineStyles, getEmailThemeClasses } from './theme.js'

export function Footer({
  href,
  label,
  appName = 'App',
}: {
  href?: string
  label?: string
  appName?: string
}) {
  const themeClasses = getEmailThemeClasses()
  const lightStyles = getEmailInlineStyles('light')
  const year = new Date().getFullYear()

  return (
    <Section className="w-full">
      <Hr
        className={`border-solid ${themeClasses.border}`}
        style={{ borderColor: lightStyles.container.borderColor }}
      />

      <br />

      <Text
        className={`text-xs ${themeClasses.secondaryText}`}
        style={{ color: lightStyles.secondaryText.color }}
      >
        {`© ${year} ${appName}`}
      </Text>

      {href && label ? (
        <Text
          className={`text-xs ${themeClasses.secondaryText}`}
          style={{ color: lightStyles.secondaryText.color }}
        >
          <Link href={href} style={{ color: lightStyles.mutedText.color }}>
            {label}
          </Link>
        </Text>
      ) : null}

      <br />
    </Section>
  )
}
