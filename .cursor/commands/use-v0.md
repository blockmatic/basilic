# Generate v0.dev Prompt

## Overview
Generate high-quality v0.dev prompt based on current file, selection, and repository context. Follow validation workflow before opening v0.dev.

## Steps
1. **Generate prompt**: Analyze current file, selection, and repository context, include constraints: Next.js App Router, React + TypeScript, Tailwind CSS, shadcn/ui, Server Components by default, client components only when strictly necessary, accessible semantic HTML, mobile-first responsive layout, clean minimal production-ready design, no data fetching or mock APIs unless explicitly required, follow existing layout/spacing/component patterns, max 300 lines per file, max 1 react component per file
2. **Show prompt to user**: Display generated v0 prompt (plain text) with OPEN/EDIT/CANCEL instruction line, ask user to validate with single explicit choice: reply "OPEN" to open v0.dev, reply "EDIT:" followed by changes to revise prompt, reply "CANCEL" to stop
3. **Handle user response**: If user replies "EDIT:", revise prompt based on feedback and repeat validation steps (1–2), if user replies "CANCEL", stop process, if user replies "OPEN", proceed to next step
4. **Validate prompt**: Before opening, ensure prompt is concise with no repo-internal paths/secrets/private tokens, prompt avoids irrelevant implementation details, URL-encoded prompt length within browser URL limits (if too long, ask user to shorten/scope it)
5. **Open v0.dev**: URL-encode final approved prompt, open browser at `https://v0.dev?chat={url_encoded_prompt}`, output only "Opened v0.dev" (do not output the URL)

## Checklist
- [ ] Generated prompt based on current file, selection, and repository context
- [ ] Included all required constraints (Next.js, React, TypeScript, Tailwind, shadcn/ui, etc.)
- [ ] Showed prompt to user with validation options
- [ ] Handled user response (EDIT/OPEN/CANCEL)
- [ ] Validated prompt (no secrets, concise, URL length acceptable)
- [ ] Opened v0.dev with approved prompt
