# Git Push (sync with origin)

## Overview

Push current branch to origin and sync with remote updates.

## Steps

1. **Fetch and rebase onto latest main (optional but recommended)**
    - `git fetch origin`
    - `git rebase origin/main || git rebase --abort` (if not on main, rebase your feature branch onto latest main)
2. **Push current branch**
    - `git push -u origin HEAD`
3. **If push rejected due to remote updates**
    - Rebase and push: `git pull --rebase && git push`

## Notes

- Prefer `rebase` over `merge` for a linear history.
- If you need to force push after a rebase: you need to ask the user if they want to force push: `git push --force-with-lease`.
