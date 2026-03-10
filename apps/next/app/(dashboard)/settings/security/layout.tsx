import { SecurityTabs } from './security-tabs'

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <SecurityTabs />
      <div className="mt-6">{children}</div>
    </div>
  )
}
