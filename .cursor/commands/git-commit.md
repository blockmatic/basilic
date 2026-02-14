Create short, focused commit message and commit staged changes.

1. **Review changes**: Check diff `git diff --cached` (staged) or `git diff` (unstaged), understand what changed and why
2. **Stage changes (if not already staged)**: `git add -A`
3. **Create short commit message**: Follow [Conventional Commits](https://www.conventionalcommits.org/) standard. Format: `<type>(<scope>): <short summary>` or `<issue-key>: <type>(<scope>): <short summary>`. Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`. Length <= 72 chars, imperative mood (use "fix", "add", "update" not "fixed", "added", "updated"), capitalize first letter, no period at end, describe why not just what
