'use client'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@repo/ui/components/navigation-menu'
import { cn } from '@repo/ui/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Menu() {
  const pathname = usePathname()

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {navOptions.map((option) => (
          <NavigationMenuItem key={option.text}>
            {option.options ? (
              <>
                <NavigationMenuTrigger className="text-md font-normal data-[state=open]:rounded-full hover:rounded-full text-neutral-dark hover:text-foreground px-2 py-1 h-auto">
                  {option.text}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {option.options.map((item) => (
                      <ListItem
                        key={item.title}
                        title={item.title}
                        href={item.href}
                      >
                        {item.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </>
            ) : (
              <Link href={option.href} legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    'flex items-center gap-2 px-2 py-1 rounded-full hover:bg-secondary text-neutral-dark hover:text-foreground',
                    isActive(option.href, pathname) &&
                      'bg-secondary text-foreground',
                  )}
                >
                  {/* {option.icon && (
                      <option.icon isActive={isActive(option.href, pathname)} />
                    )} */}
                  {option.text}
                </NavigationMenuLink>
              </Link>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function ListItem({
  title,
  href,
  children,
}: {
  title: string
  href: string
  children: React.ReactNode
}) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          href={href}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
}

function isActive(href: string, pathname: string) {
  return pathname.startsWith(href)
}

const navOptions = [
  { text: 'Markets', href: '/', icon: null },
  { text: 'Swap', href: '/swap', icon: null },
  { text: 'Wallet', href: '/wallet', icon: null },
  {
    text: 'More',
    options: [
      {
        title: 'Blog',
        href: '/',
        description: 'Read the latest news and updates from Basilic.',
      },
      {
        title: 'FAQ',
        href: '/',
        description: 'Find answers to frequently asked questions.',
      },
    ],
  },
]
