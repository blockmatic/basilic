import { Hr, Section, Text } from '@react-email/components'
import { getEmailInlineStyles, getEmailThemeClasses } from './theme'

export function Footer() {
  const themeClasses = getEmailThemeClasses()
  const lightStyles = getEmailInlineStyles('light')

  return (
    <Section className="w-full">
      <Hr
        className={themeClasses.border}
        style={{ borderColor: lightStyles.container.borderColor }}
      />

      <br />

      <Text
        className={`text-xs ${themeClasses.secondaryText}`}
        style={{ color: lightStyles.secondaryText.color }}
      >
        {process.env.APP_URL ? (
          <a
            href={`${process.env.APP_URL}/settings/notifications`}
            style={{ color: lightStyles.mutedText.color }}
          >
            Notification preferences
          </a>
        ) : (
          'Manage your notification preferences'
        )}
      </Text>

      <br />
    </Section>
  )
}
