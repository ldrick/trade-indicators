---
name: update-dependencies
description: Update all dependencies via pnpm, reinstall clean, and run the same checks as the CI test workflow with self-healing retries
---

## Usage

Invoke this skill (`/update-dependencies` or by asking to update dependencies) from the project root. Run the steps below in order.

## 1. Toolchain versions (pnpm & Node.js)

1. **pnpm**: run `pnpm self-update` to bump the `packageManager` field in [package.json](../../../package.json) to the latest pnpm release.
2. **Node.js**: check the current official Node.js release schedule (e.g. via [nodejs.org/en/about/previous-releases](https://nodejs.org/en/about/previous-releases) or [endoflife.date/nodejs](https://endoflife.date/nodejs)) for all lines currently in **Active LTS** or **Maintenance LTS** (exclude anything EOL'd, and exclude the "Current"/non-LTS line — it hasn't graduated to LTS yet). Update these to match exactly that set of LTS majors:
    - `engines.node` in [package.json](../../../package.json) (lower bound = oldest supported LTS major, minor from that line's initial LTS release, but never below `22.12`: the package is ESM-only and `require()` of ESM works without a flag from Node.js 22.12)
    - the `node-version` matrix in [.github/workflows/test.yml](../../../.github/workflows/test.yml) (should list every currently supported LTS major)
    - `node-version` in [.github/workflows/publish.yml](../../../.github/workflows/publish.yml) (pin to the newest Active LTS major)

    If nothing changed since the last run, say so explicitly rather than silently skipping.

If any of these fail, stop and report — do not attempt to fix issues without asking first.

## 2. Update & clean reinstall

1. `pnpm update --latest` — update all dependencies (dependencies and devDependencies) to their latest versions
2. `pnpm clean --lockfile`
3. `pnpm install` — regenerates `node_modules` and a fresh `pnpm-lock.yaml` from the updated `package.json`

If any of these fail, stop and report — do not attempt to fix issues without asking first. Note: [pnpm-workspace.yaml](../../../pnpm-workspace.yaml) enforces a `minimumReleaseAge` (supply-chain cooldown) — if `pnpm install` rejects a version as too new, relax that specific dependency's version range back down (pnpm will then resolve the newest release that already satisfies the cooldown) rather than disabling or lowering the policy.

## 3. Checks (mirrors the `build` job in [.github/workflows/test.yml](../../../.github/workflows/test.yml))

Run in this order:

- **A.** `pnpm knip`
- **B.** `pnpm format:check`
- **C.** `pnpm types:check`
- **D.** `pnpm lint`
- **E.** `pnpm lint:claude`
- **F.** `pnpm test`
- **G.** `pnpm build && pnpm package:check`
- **H.** `pnpm docgen`, then `git status --porcelain -- docs` must be empty

Self-healing rule when a check fails:

- **A fails** → an updated dependency likely introduced (or removed the last usage of) a devDependency, or an export became unused — fix the actual cause (remove the unused devDependency, or the unused export), then re-run **A**.
- **B fails** → run `pnpm format` (auto-fixes formatting), then re-run **A**, then **B** again.
- **C fails** → try to fix the type errors, then re-run **A**, **B**, then **C** again.
- **D fails** → try to fix the lint errors, then re-run **A**, **B**, **C**, then **D** again.
- **E fails** → a `claude-code-lint` update likely tightened its rules — fix the reported `.claude/` files (`pnpm lint:claude:fix` handles formatting issues), then re-run **A**–**D**, then **E** again.
- **F fails** → try to fix the failing tests, then re-run **A**–**E**, then **F** again.
- **G fails** → a TypeScript or packaging change broke the published package shape (build output, `exports` map, typings) — fix the cause, then re-run **A**–**F**, then **G** again.
- **H fails** → if docgen errors, an `effect`/`@effect/docgen`/TypeScript update broke an `@example` or the docgen config — fix it. If it succeeds but `docs/` changed (e.g. a new docgen version renders differently), the regenerated docs are part of the update: keep them, then re-run **A**–**G**, then **H** again.

In general: whenever a check fails and you make a fix, restart from **A** and work forward through the failed check again before moving on. Only proceed past a check once it passes. If a check keeps failing after a reasonable fix attempt, stop and report instead of looping indefinitely.

## 4. Done

Once A–H all pass, summarize which dependencies were updated (`git diff package.json`) and remind the user to review the changes (including the regenerated `pnpm-lock.yaml`) before committing.
