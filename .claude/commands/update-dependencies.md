---
description: Update all dependencies via pnpm, reinstall clean, and run the same checks as the CI test workflow with self-healing retries
---

Run these steps in order, in the project root.

## 1. Update & clean reinstall

1. `pnpm update --latest` — update all dependencies (dependencies and devDependencies) to their latest versions
2. `rm -rf node_modules`
3. `rm -f pnpm-lock.yaml`
4. `pnpm install` — regenerates `node_modules` and a fresh `pnpm-lock.yaml` from the updated `package.json`

If any of these fail, stop and report — do not attempt to fix issues without asking first.

## 2. Checks (mirrors the `build` job in [.github/workflows/test.yml](.github/workflows/test.yml))

Run in this order:

- **A.** `pnpm format:check`
- **B.** `pnpm types:check`
- **C.** `pnpm lint`
- **D.** `pnpm test`

Self-healing rule when a check fails:

- **A fails** → run `pnpm format` (auto-fixes formatting), then re-run **A** to confirm.
- **B fails** → try to fix the type errors, then re-run **A**, then **B** again.
- **C fails** → try to fix the lint errors, then re-run **A**, **B**, then **C** again.
- **D fails** → try to fix the failing tests, then re-run **A**, **B**, **C**, then **D** again.

In general: whenever a check fails and you make a fix, restart from **A** and work forward through the failed check again before moving on. Only proceed past a check once it passes. If a check keeps failing after a reasonable fix attempt, stop and report instead of looping indefinitely.

## 3. Done

Once A–D all pass, summarize which dependencies were updated (`git diff package.json`) and remind the user to review the changes (including the regenerated `pnpm-lock.yaml`) before committing.
