# Claude Project Instructions

You are working in a repository that uses **Cursor-native AI workflows**.

## Source of Truth

All project standards, architecture decisions, coding conventions, and workflows are defined in:

- `.cursor/rules/` → Project rules and engineering guidelines (must be followed according to the specified globs; these take precedence over skills)
- `.cursor/skills/` → Reusable technical patterns and domain knowledge  

These directories define the **authoritative development standards**.

## How You Should Behave

When generating code, documentation, refactors, or suggestions:

1. **Follow Cursor rules first**  
   If a rule exists in `.cursor/rules`, it overrides any general best practice.

2. **Use Cursor skills as implementation references**  
   Skills represent proven internal patterns and should be preferred over generic solutions.

3. **Do NOT introduce alternative frameworks or patterns**  
   Unless explicitly asked, stay aligned with the stack and patterns defined in Cursor rules.

4. **Assume this repo is Cursor-optimized**
   Even though you are Claude, you are operating inside a Cursor-structured engineering system.

## Conflict Resolution

If:
- A request conflicts with Cursor rules
- A pattern differs from project standards

You should:
- Follow the project rules
- Explain the conflict briefly
- Propose a solution aligned with existing rules
