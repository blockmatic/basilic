import { DashboardShell } from './_dashboard-shell'

export default async function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>): Promise<React.JSX.Element> {
  return <DashboardShell>{children}</DashboardShell>
}
