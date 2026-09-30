import { rmSync } from "node:fs";
import { join } from "node:path";

export function resetProductBrief({ destRoot }: { destRoot: string }) {
  rmSync(join(destRoot, "_first"), { force: true, recursive: true });
  rmSync(join(destRoot, ".agents/skills/f"), { force: true, recursive: true });
}
