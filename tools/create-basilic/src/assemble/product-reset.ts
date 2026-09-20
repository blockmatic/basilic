import { rmSync } from 'node:fs'
import { join } from 'node:path'

export function resetProductBrief({ destRoot }: { destRoot: string }) {
  rmSync(join(destRoot, '_first'), { recursive: true, force: true })
  rmSync(join(destRoot, '.agents/skills/f'), { recursive: true, force: true })
  rmSync(join(destRoot, 'PRODUCT.md'), { force: true })
}
