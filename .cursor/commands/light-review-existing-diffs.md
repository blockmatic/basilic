# Light Review Existing Diffs

## Overview
Perform quick quality pass on current diffs to surface risky areas, ensure polish, and flag follow-up actions for deeper review.

## Steps
1. **Scan recent changes**: List open branches or pending commits requiring review, skim side-by-side diffs focusing on new/modified files, note files/modules with large/complex edits
2. **Assess quality signals**: Watch for TODOs/debug code/commented blocks needing cleanup, verify naming/formatting/imports follow project standards, check that tests/documentation were updated when behavior changed
3. **Flag next actions**: Mark sections warranting full review or pair programming, capture questions/uncertainties to raise with author, document quick fixes you can apply immediately

## Checklist
- [ ] High-risk files identified
- [ ] Debugging artifacts removed or flagged
- [ ] Style and conventions validated
- [ ] Tests/docs updates confirmed or requested
- [ ] Follow-up items recorded for deeper review
