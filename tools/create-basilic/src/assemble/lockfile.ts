import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'

export function regenerateLockfile({ destRoot }: { destRoot: string }) {
  if (!existsSync(destRoot)) throw new Error(`Assembled tree missing: ${destRoot}`)
  const childEnv = { ...process.env }
  Reflect.set(childEnv, 'CI', '1')
  const result = spawnSync(
    'pnpm',
    ['install', '--lockfile-only', '--ignore-scripts', '--config.engine-strict=true'],
    {
      cwd: destRoot,
      stdio: 'inherit',
      env: childEnv,
    },
  )
  if (result.status !== 0)
    throw new Error(`pnpm lockfile regeneration failed (exit ${result.status ?? 1})`)
}
