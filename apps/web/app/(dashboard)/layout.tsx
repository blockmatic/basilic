import { DashboardShell } from './_dashboard-shell'

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <DashboardShell>{children}</DashboardShell>
}
