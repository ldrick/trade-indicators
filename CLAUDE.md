# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`@ldrick/trade-indicators` — trading indicators (SMA, EMA, DEMA, TEMA, WMA, MACD, ATR, ADX, RSI) written in pure functional TypeScript with [Effect](https://effect.website) (`effect` v4: `effect/Result`, `effect/Array`, `effect/Option`, `effect/Function`) internally, using plain `number` math. Every public function returns the library's own `Result<A>` (`{ ok: true, value } | { ok: false, error }`, `src/types.ts`) instead of throwing; no Effect type may appear in an indicator's signature (only the `toEffectResult` adapter exposes one). Import Effect via subpaths (`import * as R from 'effect/Result'`), not the `effect` barrel.

## Commands

```bash
pnpm install              # install deps (frozen lockfile in CI)
pnpm build                # tsc build to dist/ using tsconfig.build.json
pnpm package:check        # publint + arethetypeswrong on the packed package (needs pnpm build first)
pnpm docgen               # regenerate docs/modules from JSDoc, type-check and run every @example
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

These checks mirror the `build` job in `.github/workflows/test.yml`, run in this order: knip → format:check → types:check → lint → lint:claude → test → build → package:check → docgen (fails if the committed `docs/` differ from the regenerated ones). The `test` job in `publish.yml` runs the same sequence except docgen before publishing. The `update-dependencies` skill (`.claude/skills/update-dependencies/`) automates a full dependency bump following this same order with self-healing retries.

## Architecture

**Calculation pipeline.** Every public indicator (`src/averages/*.ts`, `src/movements/*.ts`, `src/oscillators/*.ts`) follows the same shape: validate inputs with Effect `Result` (via `R.all({...})`, which short-circuits on the first failure in key order), then check all values are finite (`validateFinite` in `src/utils/array.ts` / `src/utils/record.ts`, failing with `NotFiniteNumberError`), then run the calculation, and convert the internal Effect `Result` to the public `Result` as the last pipe step with `fromResult` (`src/utils/result.ts`). Validation failures short-circuit as one of the `Error` subclasses in `src/errors/` (`NotEnoughDataError`, `NotPositiveIntegerError`, `UnequalArraySizesError`, `EmptyArrayError`, `PeriodSizeMismatchError`, `NotFiniteNumberError`) — never a thrown exception.

**Composition over duplication.** Indicators are built from smaller internal primitives, not implemented independently:

- `src/averages/ma.ts` (generic moving average) + `src/averages/amean.ts` (arithmetic mean) → `sma`. The same `src/averages/wamean.ts` (weighted mean) feeds `wma`.
- `src/averages/dma.ts` (generic exponential smoothing given a factor) is the base for both `ema` and `smma` (different `factor`).
- `src/averages/ema.ts` exports an unchecked `emaC` (no validation) alongside the public, validated `ema`. `dema`, `tema`, `macd` all chain `emaC` internally (e.g. `dema` = 2×EMA − EMA(EMA)) rather than duplicating validation/conversion.
- `src/movements/atr.ts` exports `atrC` (unchecked True Range + `smmaC`) the same way; `src/movements/adx.ts` builds PDI/MDI/ADX on top of `atrC` and `smmaC`; `src/oscillators/rsi.ts` smooths gains and losses with `smmaC` (Wilder).
- Map over arrays with `array.traverseWithIndex` (`src/utils/array.ts`, linear via `R.all`). Never build arrays with repeated append/concat inside a reduce: that is O(n²).

This `xC` (checked-core) naming convention — public validated wrapper + internal `*C` function taking already-validated values — is how new EMA/SMMA-derived indicators should be added.

**Module boundaries via JSDoc, not folders.** There's no barrel/index file. `@public` on a JSDoc comment marks the npm package's public API (enforced by `jsdoc/require-jsdoc` with `publicOnly: true`); `@internal` marks helpers exported only for reuse across `src/` and for direct unit testing; `stripInternal` removes them from the published `.d.ts`. Error classes in `src/errors/`, the types in `src/types.ts` (`Result`, `NonEmptyArray`, `IndicatorError`, `HighLowClose`) and the indicator return types (`MACDReturn`, `ADXReturn`) are `@public` so consumers can use `instanceof` and import the types. Every new public indicator or error class needs a matching subpath entry in `package.json`'s `exports` map (source path → `dist/.../*.js` + `.d.ts`) and, if it's an entry point, in `knip.config.ts`'s `entry` list. Internal-only modules (`dma`, `ma`) are deliberately not in `exports`.

**HighLowClose shape.** Indicators needing more than a single price series (`atr`, `adx`) take a `HighLowClose<number>` record (`src/types.ts`); `src/utils/record.ts` validates it the same way `src/utils/array.ts` does for plain arrays.

**Adapters.** `src/utils/toPromise.ts` and `src/utils/toEffectResult.ts` convert a `Result` into a Promise or an Effect `Result`.

**Documentation.** `docs/modules/**` is generated by `@effect/docgen` (`docgen.json`) from the JSDoc of public exports — never edit it by hand, run `pnpm docgen` and commit the result. Every `@public` export needs a description, `@category` (`indicators`, `models`, `errors`, `adapters`) and `@since` (the first release that contained it; new exports get the next release version). Indicators carry an `@example` with `node:assert` checks: docgen type-checks them with `tsc` and runs them with `tsx`, so examples are tests. Examples import from `@ldrick/trade-indicators/...`, mapped to `src/` via `paths` in `docgen.json`. Internal-only modules are listed in `docgen.json`'s `exclude`. `scripts/fixDocgenSourceLinks.ts` repairs docgen's "Source" links, which drop nested folders. `docs/index.md`, `docs/modules/index.md` and `docs/_config.yml` are hand-maintained (docgen does not overwrite the first two). `docs/modules/` is excluded from oxfmt and ESLint.

**Testing.** Test files are `tests/**/*.spec.ts`, mirroring `src/` structure (not `*.test.ts`, despite both being allowed by `vitest.config.ts`). Coverage thresholds are set to 100% (`v8` provider) — genuinely unreachable branches need a `// v8 ignore next -- <reason>` comment explaining _why_ it's unreachable (see existing examples in `dema.ts`, `tema.ts`, `macd.ts`, `adx.ts`), not a blanket ignore. `tests/prices.json` holds shared fixture data. Indicator tests build expected failures with `failure()`/`success()` from `tests/result.ts`. The custom matcher `okToEqualFixedPrecision` compares with an absolute tolerance of `10^-decimals` (default 10 decimals; fixtures match up to 12).

**Linting is two-layered.** ESLint (`eslint.config.ts`) covers JS/TS (including type-aware and immutability rules via `eslint-plugin-functional`, restricted to `src/!(errors)/*.ts`) plus JSON/Markdown/package.json linting that oxlint can't do. `oxfmt` (not Prettier) handles formatting. `claudelint` separately validates the `.claude/` directory itself (skills, settings, hooks) in `--strict` mode, so any new skill/hook/setting must also pass `pnpm lint:claude`. `MIGRATION-oxlint.local.md` is a local, not-yet-implemented draft plan for replacing ESLint with oxlint — the active linter today is still ESLint.
