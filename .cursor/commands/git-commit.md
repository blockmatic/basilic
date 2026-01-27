Create short, focused commit message and commit staged changes.

1. **Review changes**: Check diff `git diff --cached` (staged) or `git diff` (unstaged), understand what changed and why
2. **Ask for issue key (optional)**: Check branch name for issue key (Linear, Jira, GitHub issue, etc.), optionally ask user if they want to include one, this is optional
3. **Stage changes (if not already staged)**: `git add -A`
4. **Create short commit message**: Base message on actual changes in diff, use format `<type>(<scope>): <short summary>` or with issue key `<issue-key>: <type>(<scope>): <short summary>`, length <= 72 characters, imperative mood (use "fix", "add", "update" not "fixed", "added", "updated"), capitalize first letter, no period at end, describe why not just what
