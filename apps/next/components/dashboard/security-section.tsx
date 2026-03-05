'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/tabs'
import { ApiKeysCard } from 'components/dashboard/security/api-keys-card'
import { PasskeysCard } from 'components/dashboard/security/passkeys-card'
import { TotpCard } from 'components/dashboard/security/totp-card'
import { KeyRoundIcon, ShieldCheckIcon } from 'lucide-react'
import { parseAsStringLiteral, useQueryState } from 'nuqs'

const sectionParser = parseAsStringLiteral(['passkeys', 'totp', 'apikeys']).withDefault('passkeys')

export function SecuritySection() {
  const [section, setSection] = useQueryState('section', sectionParser)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Tabs value={section} onValueChange={v => setSection(v as 'passkeys' | 'totp' | 'apikeys')}>
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
          <TabsTrigger value="passkeys">
            <ShieldCheckIcon />
            Passkeys
          </TabsTrigger>
          <TabsTrigger value="totp">
            <KeyRoundIcon />
            Authenticator
          </TabsTrigger>
          <TabsTrigger value="apikeys">API keys</TabsTrigger>
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
