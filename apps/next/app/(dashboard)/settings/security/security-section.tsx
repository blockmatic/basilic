'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/tabs'
import { KeyRoundIcon, ShieldCheckIcon, TerminalIcon } from 'lucide-react'
import { parseAsStringLiteral, useQueryState } from 'nuqs'
import { ApiKeysCard } from './api-keys-card'
import { PasskeysCard } from './passkeys-card'
import { TotpCard } from './totp-card'

const sectionParser = parseAsStringLiteral(['passkeys', 'totp', 'apikeys']).withDefault('passkeys')

export function SecuritySection() {
  const [section, setSection] = useQueryState('section', sectionParser)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Tabs value={section} onValueChange={v => setSection(v as 'passkeys' | 'totp' | 'apikeys')}>
        <TabsList className="grid w-full grid-cols-3 [&>[data-slot=tabs-trigger]]:min-w-0">
          <TabsTrigger value="passkeys">
            <ShieldCheckIcon />
            <span className="truncate">Passkeys</span>
          </TabsTrigger>
          <TabsTrigger value="totp">
            <KeyRoundIcon />
            <span className="truncate">Authenticator</span>
          </TabsTrigger>
          <TabsTrigger value="apikeys">
            <TerminalIcon />
            <span className="truncate">API keys</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="passkeys" className="mt-6">
          <PasskeysCard />
        </TabsContent>
        <TabsContent value="totp" className="mt-6">
          <TotpCard />
        </TabsContent>
        <TabsContent value="apikeys" className="mt-6">
          <ApiKeysCard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
