# Contributing

## Setup

Requires Node.js (see `engines` in `package.json`) and pnpm (see `packageManager`).

```bash
pnpm install
```

## Checks

Every pull request runs these checks in CI (`.github/workflows/test.yml`), in this order:

```bash
pnpm knip            # unused files, dependencies and exports
pnpm format:check    # oxfmt (run `pnpm format` to fix)
pnpm types:check     # tsc
pnpm lint            # eslint
pnpm lint:claude     # claudelint for .claude/
pnpm test            # vitest with 100% coverage
pnpm build
pnpm package:check   # publint + arethetypeswrong
pnpm docgen          # regenerates docs/modules; commit the result
```

## Conventions

- Every public function returns `Result<A>` and never throws. Invalid input is an error class from `src/errors/`.
- The package has one entry point, `src/index.ts`. New public exports are added there and to `tests/index.spec.ts`.
- Public exports need JSDoc with a description, `@category`, `@since` and `@public`.
  Indicators also need an `@example` with `node:assert` checks, which `pnpm docgen` type-checks and runs.
- `docs/modules/` is generated: change the JSDoc and run `pnpm docgen`, never edit it by hand.
- Indicators are pure steppers (`src/steps/`) shared by a batch function and an `incremental...` function; see CLAUDE.md for the building blocks.
- New indicators need tests against independent reference values (not values computed by this library). Add every new indicator to the batch/incremental equivalence test in `tests/incremental.spec.ts`.
- Commit messages and pull request titles follow [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `ci:`, `build:`, `chore:`; `!` marks breaking changes).
  commitlint checks them in the `commit-msg` hook and in CI.

## Releases

Releases are automated with [release-please](https://github.com/googleapis/release-please)
in `.github/workflows/publish.yml`:

1. Every push to `main` creates or updates a release pull request. It sets the next version in
   `package.json` and `.release-please-manifest.json` and adds the changes to `CHANGELOG.md`,
   both derived from the Conventional Commits since the last release.
   While the version is below 1.0.0, breaking changes raise the minor version.
2. Merging the release pull request creates the Git tag (e.g. `0.9.0`) and the GitHub release,
   runs all checks and publishes the package to npm (trusted publishing) and GitHub Packages.

Merge pull requests with a merge commit, not squashed, when their individual commits should
appear in the changelog.
