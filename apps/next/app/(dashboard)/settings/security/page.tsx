import { redirect } from 'next/navigation'

export default function SecurityPage(): never {
  redirect('/settings/security/passkeys')
}
