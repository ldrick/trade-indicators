---
description: Update all dependencies via pnpm, reinstall clean, and run the same checks as the CI test workflow with self-healing retries
---

Run these steps in order, in the project root.

## 1. Toolchain versions (pnpm & Node.js)

1. **pnpm**: run `corepack use pnpm@latest` to bump the `packageManager` field in [package.json](package.json) to the latest pnpm release.
2. **Node.js**: check the current official Node.js release schedule (e.g. via [nodejs.org/en/about/previous-releases](https://nodejs.org/en/about/previous-releases) or [endoflife.date/nodejs](https://endoflife.date/nodejs)) for all lines currently in **Active LTS** or **Maintenance LTS** (exclude anything EOL'd, and exclude the "Current"/non-LTS line — it hasn't graduated to LTS yet). Update these to match exactly that set of LTS majors:
    - `engines.node` in [package.json](package.json) (lower bound = oldest supported LTS major, minor from that line's initial LTS release)
    - the `node-version` matrix in [.github/workflows/test.yml](.github/workflows/test.yml) (should list every currently supported LTS major)
    - `node-version` in [.github/workflows/publish.yml](.github/workflows/publish.yml) (pin to the newest Active LTS major)

    If nothing changed since the last run, say so explicitly rather than silently skipping.

If any of these fail, stop and report — do not attempt to fix issues without asking first.

## 2. Update & clean reinstall

1. `pnpm update --latest` — update all dependencies (dependencies and devDependencies) to their latest versions
2. `pnpm clean --lockfile`
3. `pnpm install` — regenerates `node_modules` and a fresh `pnpm-lock.yaml` from the updated `package.json`

If any of these fail, stop and report — do not attempt to fix issues without asking first. Note: [pnpm-workspace.yaml](pnpm-workspace.yaml) enforces a `minimumReleaseAge` (supply-chain cooldown) — if `pnpm install` rejects a version as too new, relax that specific dependency's version range back down (pnpm will then resolve the newest release that already satisfies the cooldown) rather than disabling or lowering the policy.

## 3. Checks (mirrors the `build` job in [.github/workflows/test.yml](.github/workflows/test.yml))

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

## 4. Done

Once A–D all pass, summarize which dependencies were updated (`git diff package.json`) and remind the user to review the changes (including the regenerated `pnpm-lock.yaml`) before committing.
