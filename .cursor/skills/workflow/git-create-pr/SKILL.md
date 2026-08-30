---
name: git-create-pr
description: Create well-structured pull request with proper description, labels, and reviewers. Use when the user types /git-create-pr.
disable-model-invocation: true
---

Create well-structured pull request with proper description, labels, and reviewers. Use global git user for any commits—never cursor/system identity. Never use `--trailer` for Co-authored-by or similar.

1. **Prepare branch**: Ensure all changes committed, push branch to remote, verify branch up to date with main
2. **Write PR description**: Summarize changes clearly, include context/motivation, list breaking changes, add screenshots if UI changes
3. **Set up PR**: Create PR with descriptive title, add appropriate labels, assign reviewers, link related issues

