# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`@ldrick/trade-indicators` — trading indicators (SMA, EMA, DEMA, TEMA, WMA, MACD, ATR, ADX) written in pure functional TypeScript with `fp-ts` and `big.js`. Every public function returns `Either<Error, Result>` instead of throwing.

## Commands

```bash
pnpm install              # install deps (frozen lockfile in CI)
pnpm build                # tsc build to dist/ using tsconfig.build.json
pnpm test                 # vitest run --coverage (100% coverage enforced)
pnpm format               # oxfmt --write
pnpm format:check         # oxfmt --check
pnpm types:check          # tsc --noEmit
pnpm lint                 # eslint --max-warnings 0 .
pnpm lint:claude          # claudelint check-all --strict (lints .claude/ config)
pnpm lint:claude:fix      # claudelint format --fix
pnpm knip                 # unused files/deps/exports check
```

Run a single test file or case with vitest directly:

```bash
pnpm exec vitest run tests/averages/sma.spec.ts
pnpm exec vitest run -t "test name"
```

These checks mirror the `build` job in `.github/workflows/test.yml`, run in this order: knip → format:check → types:check → lint → lint:claude → test. The `update-dependencies` skill (`.claude/skills/update-dependencies/`) automates a full dependency bump following this same order with self-healing retries.

## Architecture

**Calculation pipeline.** Every public indicator (`src/averages/*.ts`, `src/movements/*.ts`) follows the same shape: validate inputs with `fp-ts` `Either` (via `AP.sequenceS`), convert `number[]` to `Big[]` (`src/utils/array.ts`, `src/utils/record.ts`) for precision, run the calculation, convert back to `number[]`. Validation failures short-circuit as one of the `Error` subclasses in `src/errors/` (`NotEnoughDataError`, `NotPositiveIntegerError`, `UnequalArraySizesError`, `EmptyArrayError`, `PeriodSizeMissmatchError`) — never a thrown exception.

**Composition over duplication.** Indicators are built from smaller internal primitives, not implemented independently:

- `src/averages/ma.ts` (generic moving average) + `src/averages/amean.ts` (arithmetic mean) → `sma`. The same `src/averages/wamean.ts` (weighted mean) feeds `wma`.
- `src/averages/dma.ts` (generic exponential smoothing given a factor) is the base for both `ema` and `smma` (different `factor`).
- `src/averages/ema.ts` exports an unchecked/unconverted `emaC` (Big-typed, no validation) alongside the public, validated `ema`. `dema`, `tema`, `macd` all chain `emaC` internally (e.g. `dema` = 2×EMA − EMA(EMA)) rather than duplicating validation/conversion.
- `src/movements/atr.ts` exports `atrC` (unchecked True Range + `smmaC`) the same way; `src/movements/adx.ts` builds PDI/MDI/ADX on top of `atrC` and `smmaC`.

This `xC` (checked-core) naming convention — public validated wrapper + internal `*C` function taking already-validated `Big` values — is how new EMA/SMMA-derived indicators should be added.

**Module boundaries via JSDoc, not folders.** There's no barrel/index file. `@public` on a JSDoc comment marks the npm package's public API (enforced by `jsdoc/require-jsdoc` with `publicOnly: true`); `@internal` marks helpers exported only for reuse across `src/` and for direct unit testing. Every new public indicator needs a matching subpath entry in `package.json`'s `exports` map (source path → `dist/.../*.js` + `.d.ts`) and, if it's an entry point, in `knip.config.ts`'s `entry` list.

**HighLowClose shape.** Indicators needing more than a single price series (`atr`, `adx`) take a `HighLowClose<number>` record (`src/types.ts`); `src/utils/record.ts` validates and converts it the same way `src/utils/array.ts` does for plain arrays.

**Testing.** Test files are `tests/**/*.spec.ts`, mirroring `src/` structure (not `*.test.ts`, despite both being allowed by `vitest.config.ts`). Coverage thresholds are set to 100% (`v8` provider) — genuinely unreachable branches need a `// v8 ignore next -- <reason>` comment explaining _why_ it's unreachable (see existing examples in `dema.ts`, `tema.ts`, `macd.ts`, `adx.ts`), not a blanket ignore. `tests/prices.json` holds shared fixture data.

**Linting is two-layered.** ESLint (`eslint.config.ts`) covers JS/TS (including type-aware and immutability rules via `eslint-plugin-functional`, restricted to `src/!(errors)/*.ts`) plus JSON/Markdown/package.json linting that oxlint can't do. `oxfmt` (not Prettier) handles formatting. `claudelint` separately validates the `.claude/` directory itself (skills, settings, hooks) in `--strict` mode, so any new skill/hook/setting must also pass `pnpm lint:claude`. `MIGRATION-oxlint.local.md` is a local, not-yet-implemented draft plan for replacing ESLint with oxlint — the active linter today is still ESLint.
