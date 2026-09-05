---
name: fix-git-issues
description: Help resolve common Git problems and conflicts with step-by-step commands and explanations. Use when the user types /fix-git-issues.
disable-model-invocation: true
---

## Purpose

Help resolve common Git problems and conflicts with step-by-step commands and explanations. Use global git user for any commits—never cursor/system identity. Never use `--trailer` for Co-authored-by or similar.

## Steps

1. **Merge Conflicts**: Analyze conflicting changes/context, provide resolution strategies, suggest best approach to preserve important changes, generate resolved code maintaining functionality
2. **Branch Management**: Help with branch cleanup/organization, suggest rebasing vs merging strategies, assist with cherry-picking, guide through complex branch operations
3. **Commit History**: Help with commit message improvements, assist with squashing/organizing commits, guide through interactive rebase, fix commit authorship/metadata
4. **Repository Issues**: Help recover from detached HEAD state, assist with undoing commits/changes, guide through stash management, resolve submodule/remote issues

## Completion

Read [completion evidence](../references/completion.md) before reporting completion.
