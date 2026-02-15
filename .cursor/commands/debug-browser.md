Iterate on the current task using debug instrumentation and browser tools without asking the user to test manually. Add debug traces, reproduce issues using browser tools, analyze traces, identify problems, and make fixes until resolved. Follow architecture, strategies, and decisions in `@apps/docu/`. After implementation (for both new features and fixes), update docs, readme, and cursor rules if required to keep them aligned.

1. **Add debug traces**: Add debug.log traces to key locations in the code
2. **Reproduce issue**: Use the browser tools (browser_navigate, browser_click, browser_snapshot, etc.) to reproduce the issue and collect trace output
3. **Analyze and fix**: Analyze the traces, identify the problem, and make a fix
4. **Repeat**: Repeat until the issue is resolved
