# Publishing Scripts

These scripts handle the dual-mode export configuration for monorepo packages that need to work both in development and when published to npm.

## Why These Scripts Exist

Our packages use a **dual-mode export strategy**:

- **Development mode**: Exports point to `src/` for fast local development without requiring builds
- **Publishing mode**: Exports point to `dist/` for npm consumers who need built artifacts

This allows:
- ✅ Fast local development (no build step needed)
- ✅ Next.js can transpile `src/` directly via `transpilePackages`
- ✅ Clean `dist/`-only packages for npm publishing
- ✅ Proper TypeScript types in both modes

## How It Works

### `prepare-publish.mjs`

Runs during the `prepack` lifecycle hook (before `pnpm pack` or `pnpm publish`):

1. Builds the package (`pnpm build` runs first via the prepack script)
2. Stores original `package.json` exports/main/types in `.package-originals.json`
3. Switches `exports`, `main`, and `types` to point to `dist/`
4. Sets `files: ["dist"]` to ensure only built files are included

### `restore-publish.mjs`

Runs during the `postpack` lifecycle hook (after packing):

1. Reads the stored originals from `.package-originals.json`
2. Restores the original `package.json` configuration
3. Removes the temporary `.package-originals.json` file

## Usage

These scripts are automatically invoked via npm/pnpm lifecycle hooks in `package.json`:

```json
{
  "scripts": {
    "prepack": "pnpm build && node ../../scripts/prepare-publish.mjs",
    "postpack": "node ../../scripts/restore-publish.mjs"
  }
}
```

## When They Run

- `prepack`: Before `pnpm pack` or `pnpm publish`
- `postpack`: After `pnpm pack` or `pnpm publish`

## Package Configuration

Packages that use these scripts should have:

**Development exports** (in `package.json`):
```json
{
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./src/index.ts"
    }
  }
}
```

**Publishing exports** (automatically set by `prepare-publish.mjs`):
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"]
}
```

## Notes

- The scripts use `process.cwd()` to find the package's `package.json` (they run from within each package directory)
- If `.package-originals.json` doesn't exist, `restore-publish.mjs` exits gracefully (useful for first-time runs)
- These scripts are only needed for packages that will be published to npm
- Private workspace-only packages don't need these scripts
