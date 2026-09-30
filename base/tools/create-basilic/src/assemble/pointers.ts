import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { listFiles } from "../digest.js";
import { docsUrl } from "../docs-url.js";

const pointerGlobs = [
  "AGENTS.md",
  ".cursor/rules/",
  ".agents/",
  "apps/",
  "packages/",
  "scripts/",
];

const skipRewrite =
  /\.(png|jpe?g|gif|webp|ico|woff2?|ttf|eot|zip|gz|tgz|wasm|mp4|sqlite3?)$/i;

export function rewritePointers({ destRoot }: { destRoot: string }) {
  for (const path of listFiles({ root: destRoot })) {
    if (!shouldRewrite({ path })) {
      continue;
    }
    const abs = join(destRoot, path);
    const original = readFileSync(abs, "utf-8");
    const next = rewriteFilePointers({ content: original });
    if (next !== original) {
      writeFileSync(abs, next);
    }
  }
}

export function rewriteFilePointers({ content }: { content: string }) {
  let next = content;
  next = next.replaceAll("apps/docu/content/docs/", `${docsUrl}/docs/`);
  next = next.replaceAll("@apps/docu/content/docs/", `${docsUrl}/docs/`);
  next = next.replaceAll("apps/docu/content/docs", `${docsUrl}/docs`);
  next = next.replaceAll("_first/basilic/", "");
  next = next.replaceAll(
    'globs: "apps/docu/**/*.mdx"',
    'globs: "docs/**/*.mdx"'
  );
  next = next.replaceAll(
    /(\.\.\/)+docu\/content\/docs\/([^\s)"'`]+)/g,
    (_full, _dots, slug: string) =>
      `${docsUrl}/docs/${slug.replace(/\.mdx$/, "")}`
  );
  return next;
}

function shouldRewrite({ path }: { path: string }) {
  if (path.startsWith("docs/basilic/")) {
    return false;
  }
  if (skipRewrite.test(path)) {
    return false;
  }
  return pointerGlobs.some(
    (rule) => path === rule || path.startsWith(rule) || path.endsWith(rule)
  );
}
