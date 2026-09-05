# Pipelines First

## Principle

See /f-pipelines.

## Artifacts

- **Fact:** Vercel git deploys `apps/web`, `apps/api`, and `apps/docu`. EAS workflows deploy mobile. Those are app delivery, not Basilic npm distribution.
- **Fact:** Basilic distribution is **Release Please** + `create-basilic` npm tarball. Version lives on the repo root (`package.json` `version`) and is synced into `tools/create-basilic/package.json`. Tag format `vX.Y.Z`.
- **Fact:** A maintainer merge of the release PR is the publish decision. After the tag, `publish-create-basilic.yml` assembles and packs **once**, tests that tarball, publishes it with npm trusted publishing (`id-token` only on that job), and attaches the same file to the GitHub Release.
- **Fact:** Artifact identity: SHA-256 of the packed tarball. Do not rebuild at publish. Retry GitHub asset upload from the retained artifact; never overwrite an npm version.
- **Fact:** Preview: manual `0.1.0-next.1` with npm dist-tag `next`, not `latest`. Stable `1.0.0` only after Product Ready from `npx create-basilic@<version>`.
- **Fact:** Generated repos do not receive Release Please, the publish workflow, or npm credentials.
- **Fact:** R0 Quality (Product Ready) does not require a GitHub Release. Distribution releases are a separate pipeline.

## Minimum Useful Artifact

- commit that produced the tarball: the release tag SHA
- packed file + checksum: GitHub Release assets and the npm tarball
- promotion: maintainer merge → pack once → npm + GitHub asset
- rollback: patch + deprecate; never rewrite tags

## Notes

Workflow runs CI on feature PRs. Pipelines own versioned artifacts. Operations runs what was promoted.

**Navigation:** [Generic spec](https://github.com/blockmatic/first/blob/main/_first/principles/PIPELINES.md) · [Publishing](../../apps/docu/content/docs/deployment/publishing.mdx) · [GitHub Actions](../../apps/docu/content/docs/deployment/github-actions.mdx) · [ADR 012](../../apps/docu/content/docs/adrs/012-scaffolding-and-releases.mdx)
