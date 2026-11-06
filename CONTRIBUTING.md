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
- New indicators need tests against independent reference values (not values computed by this library).
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `ci:`, `build:`, `chore:`; `!` marks breaking changes).
