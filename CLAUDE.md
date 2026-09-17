@AGENTS.md

## Claude Code

Project skills live in `.agents/skills/` after `pnpm setup` (not `.claude/skills/` in this repo).
When a playbook is requested, read its `SKILL.md` under `.agents/skills/workflow/` (including group folders such as `git/commit`).
Optional local symlink: `pnpm dlx skills@latest add blockmatic/basilic-skills --skill '*' -a claude-code -y` — do not commit `.claude/`.
