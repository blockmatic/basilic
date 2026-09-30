import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { listFiles } from "../digest.js";
import type { ProjectName } from "../project-name.js";

export function applyProjectTransforms({
  destRoot,
  name,
}: {
  destRoot: string;
  name: ProjectName;
}) {
  const replacements = projectReplacements({ name });
  for (const { path, from, to } of replacements) {
    const abs = join(destRoot, path);
    if (!existsSync(abs)) {
      continue;
    }
    const source = readFileSync(abs, "utf-8");
    if (!source.includes(from)) {
      continue;
    }
    writeFileSync(abs, source.replaceAll(from, to));
  }

  rewriteRootPackage({ destRoot, name });
  rewriteMobileScheme({ destRoot, name });
  rewriteNextConfig({ destRoot, name });
  rewriteWebEnvUrls({ destRoot });
  rewriteHosts({ destRoot, name });
}

function projectReplacements({ name }: { name: ProjectName }) {
  return [
    {
      from: "Welcome to Basilic",
      path: "apps/web/app/auth/login/login-form.tsx",
      to: `Welcome to ${name.displayName}`,
    },
    {
      from: 'name="Basilic"',
      path: "apps/web/app/(dashboard)/page.tsx",
      to: `name="${name.displayName}"`,
    },
    {
      from: 'name: "Basilic"',
      path: "apps/web/app/(dashboard)/page.tsx",
      to: `name: "${name.displayName}"`,
    },
    {
      from: "Welcome to Basilic",
      path: "apps/mobile/src/app/index.tsx",
      to: `Welcome to ${name.displayName}`,
    },
    {
      from: 'name: "Basilic"',
      path: "apps/agents/agents/command/agent/tools/get_application_status.ts",
      to: `name: "${name.displayName}"`,
    },
    {
      from: "Welcome to Basilic",
      path: "apps/web/e2e/public.spec.ts",
      to: `Welcome to ${name.displayName}`,
    },
    {
      from: "default: 'Basilic'",
      path: "apps/web/app/layout.tsx",
      to: `default: '${name.displayName}'`,
    },
    {
      from: "'%s | Basilic'",
      path: "apps/web/app/layout.tsx",
      to: `'%s | ${name.displayName}'`,
    },
    {
      from: "Basilic web dashboard",
      path: "apps/web/app/layout.tsx",
      to: `${name.displayName} web dashboard`,
    },
    {
      from: "            Basilic\n",
      path: "apps/web/app/(dashboard)/sidebar.tsx",
      to: `            ${name.displayName}\n`,
    },
    {
      from: "              Basilic\n",
      path: "apps/web/app/auth/login/page.tsx",
      to: `              ${name.displayName}\n`,
    },
    {
      from: "Enter code - Basilic",
      path: "apps/web/app/auth/callback/magiclink/route.ts",
      to: `Enter code - ${name.displayName}`,
    },
    {
      from: "using Basilic",
      path: "apps/web/app/terms/page.tsx",
      to: `using ${name.displayName}`,
    },
    {
      from: "title: 'Basilic API'",
      path: "apps/api/src/plugins/openapi.ts",
      to: `title: '${name.displayName} API'`,
    },
    {
      from: "Basilic API documentation",
      path: "apps/api/src/plugins/openapi.ts",
      to: `${name.displayName} API documentation`,
    },
    {
      from: "title: 'Basilic API'",
      path: "apps/api/scripts/generate-openapi.ts",
      to: `title: '${name.displayName} API'`,
    },
    {
      from: "Basilic API documentation",
      path: "apps/api/scripts/generate-openapi.ts",
      to: `${name.displayName} API documentation`,
    },
    {
      from: "Basilic Fastify API",
      path: "apps/api/src/routes/root.ts",
      to: `${name.displayName} Fastify API`,
    },
    {
      from: "Basilic Fastify API",
      path: "apps/api/src/routes/root.spec.ts",
      to: `${name.displayName} Fastify API`,
    },
    {
      from: "API Reference - Basilic",
      path: "apps/api/src/routes/reference/template.ts",
      to: `API Reference - ${name.displayName}`,
    },
    {
      from: "CLI for Basilic API",
      path: "packages/cli/src/cli.ts",
      to: `CLI for ${name.displayName} API`,
    },
    {
      from: "Basilic Fastify API",
      path: "packages/cli/package.json",
      to: `${name.displayName} Fastify API`,
    },
    {
      from: "the Basilic Fastify API",
      path: "packages/cli/README.md",
      to: `the ${name.displayName} Fastify API`,
    },
    {
      from: 'id: "app"',
      path: ".deepsec/deepsec.config.ts",
      to: `id: "${name.slug}"`,
    },
    {
      from: "https://github.com/example/app/blob/main",
      path: ".deepsec/deepsec.config.ts",
      to: `https://github.com/example/${name.slug}/blob/main`,
    },
  ];
}

function rewriteRootPackage({
  destRoot,
  name,
}: {
  destRoot: string;
  name: ProjectName;
}) {
  const path = join(destRoot, "package.json");
  const pkg = JSON.parse(readFileSync(path, "utf-8")) as {
    name: string;
    basilic?: unknown;
  };
  pkg.name = name.packageName;
  writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`);
}

function rewriteMobileScheme({
  destRoot,
  name,
}: {
  destRoot: string;
  name: ProjectName;
}) {
  const scheme = `com.example.${name.slug.replaceAll(".", "-")}`;
  const appJsonPath = join(destRoot, "apps/mobile/app.json");
  if (existsSync(appJsonPath)) {
    const app = JSON.parse(readFileSync(appJsonPath, "utf-8")) as {
      expo?: { name?: string; scheme?: string; slug?: string };
    };
    if (app.expo) {
      app.expo.name = name.displayName;
      app.expo.scheme = (
        app.expo.scheme ?? "com.blockmatic.basilic"
      ).replaceAll("com.blockmatic.basilic", scheme);
      app.expo.slug = name.hostnameLabel;
    }
    writeFileSync(appJsonPath, `${JSON.stringify(app, null, 2)}\n`);
  }
  const maestroPath = join(destRoot, "apps/mobile/.maestro/flows/home.yml");
  if (existsSync(maestroPath)) {
    const source = readFileSync(maestroPath, "utf-8").replaceAll(
      "com.blockmatic.basilic",
      scheme
    );
    writeFileSync(maestroPath, source);
  }
}

function rewriteNextConfig({
  destRoot,
  name,
}: {
  destRoot: string;
  name: ProjectName;
}) {
  const path = join(destRoot, "apps/web/next.config.mjs");
  if (!existsSync(path)) {
    return;
  }
  const slug = name.slug.replaceAll(".", "-");
  const source = readFileSync(path, "utf-8")
    .replace(
      "const apiProjectName = 'basilic-fastify'",
      `const apiProjectName = '${slug}-api'`
    )
    .replace("const teamSlug = 'gaboesquivel'", "const teamSlug = 'your-team'");
  writeFileSync(path, source);
}

function rewriteHosts({
  destRoot,
  name,
}: {
  destRoot: string;
  name: ProjectName;
}) {
  const label = name.hostnameLabel;
  for (const path of listFiles({ root: destRoot })) {
    if (/\.(png|jpe?g|gif|webp|ico|woff2?|ttf|zip|gz|wasm)$/i.test(path))
      continue;
    const abs = join(destRoot, path);
    const source = readFileSync(abs, "utf-8");
    if (source.includes("\u0000")) continue;
    let next = source.replaceAll("basilic.localhost", `${label}.localhost`);
    if (path === "portless.json") {
      next = next
        .replaceAll("agents.basilic", `agents.${label}`)
        .replaceAll("api.basilic", `api.${label}`)
        .replaceAll("email.basilic", `email.${label}`)
        .replaceAll("docu.basilic", `docu.${label}`)
        .replaceAll('"name": "basilic"', `"name": "${label}"`);
    }
    if (next !== source) writeFileSync(abs, next);
  }
}

function rewriteWebEnvUrls({ destRoot }: { destRoot: string }) {
  for (const file of ["apps/web/.env.production", "apps/web/.env.staging"]) {
    const path = join(destRoot, file);
    if (!existsSync(path)) {
      continue;
    }
    const source = readFileSync(path, "utf-8").replaceAll(
      "https://basilic-fastify.vercel.app",
      "https://your-api.vercel.app"
    );
    writeFileSync(path, source);
  }
}
