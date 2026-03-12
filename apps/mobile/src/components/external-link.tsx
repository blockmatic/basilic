import type { Href } from 'expo-router'
import { Link } from 'expo-router'
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser'
import type { ComponentProps } from 'react'

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: Href & string }

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href}
      onPress={async event => {
        const isExternal = /^[a-z][a-z0-9+.-]*:/.test(String(href))
        if (process.env.EXPO_OS !== 'web' && isExternal) {
          event.preventDefault()
          await openBrowserAsync(href, {
            presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
          })
        }
      }}
    />
  )
}
