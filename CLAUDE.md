@AGENTS.md

## Claude Code

Project skills live in `.agents/skills/` after `pnpm setup` (not `.claude/skills/` in this repo).
When a playbook is requested, read its `SKILL.md` under `.agents/skills/w-<name>/`.
Optional: `npx skills@latest add blockmatic/basilic-skills --all` and the same for `mattpocock/skills` — do not commit `.claude/`.
