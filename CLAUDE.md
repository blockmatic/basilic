@AGENTS.md

## Claude Code

Project skills live in `.agents/skills/` after `pnpm setup` (not `.claude/skills/` in this repo).
Recommended daily workflow: [mattpocock/skills](https://www.aihero.dev/skills). Basilic `/w-*` is a lightweight alternative under `.agents/skills/w-<name>/`. Publish with `/w-ship`. Do not `claude plugins install mattpocock-skills`.
Optional: `npx skills@latest add mattpocock/skills --all` and `npx skills@latest add blockmatic/basilic-skills --all` — do not commit `.claude/`.
