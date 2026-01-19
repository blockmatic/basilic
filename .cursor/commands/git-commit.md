# Git Create Commit

## Overview
Create short, focused commit message and commit staged changes.

## Steps
1. **Review changes**: Check diff `git diff --cached` (staged) or `git diff` (unstaged), understand what changed and why
2. **Ask for issue key (optional)**: Check branch name for issue key (Linear, Jira, GitHub issue, etc.), optionally ask user if they want to include one, this is optional
3. **Stage changes (if not already staged)**: `git add -A`
4. **Create short commit message**: Base message on actual changes in diff

## Template
- `git commit -m "<type>(<scope>): <short summary>"`
- With issue key: `git commit -m "<issue-key>: <type>(<scope>): <short summary>"`

## Rules
- **Length:** <= 72 characters
- **Imperative mood:** Use "fix", "add", "update" (not "fixed", "added", "updated")
- **Capitalize:** First letter of summary should be capitalized
- **No period:** Don't end subject line with period
- **Describe why:** Not just what - "fix stuff" is meaningless
