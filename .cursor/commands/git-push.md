Push current branch to origin and sync with remote updates, including all changes such as untracked files, after removing any debug instrumentations. Use global git user for commits—never cursor/system identity.

1. **Check changes**: Look at the current git changes to understand what will be pushed
2. **Remove debug code**: Remove all debug instrumentations that you've added before pushing
3. **Stage and commit**: Stage all changes including untracked files, create commit with conventional commit message summarizing the changes nicely
4. **Push**: Push the branch to the remote repository
