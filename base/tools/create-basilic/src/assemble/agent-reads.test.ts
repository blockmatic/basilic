import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { repoRootFromPackage } from "../paths.js";
import { classifyPath, loadManifest } from "./classify.js";
import { agentReadPaths } from "./index.js";

describe("assembled agent reads", () => {
  it("keeps mandatory agent files in the classified tree", () => {
    const manifest = loadManifest();
    for (const path of agentReadPaths) {
      expect(existsSync(join(repoRootFromPackage, path)), path).toBe(true);
      expect(classifyPath({ path, manifest })?.kind).not.toBe("exclude");
    }
  });
});
