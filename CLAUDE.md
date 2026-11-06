# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`@ldrick/trade-indicators` — trading indicators (SMA, EMA, DEMA, TEMA, WMA, MACD, ATR, ADX, RSI), each as batch and incremental function, written in pure functional TypeScript with [Effect](https://effect.website) (`effect` v4: `effect/Result`, `effect/Array`, `effect/Option`, `effect/Function`) internally, using plain `number` math. Every public function returns the library's own `Result<A>` (`{ ok: true, value } | { ok: false, error }`, `src/types.ts`) instead of throwing; no Effect type may appear in an indicator's signature (only the `toEffectResult` adapter exposes one). Import Effect via subpaths (`import * as R from 'effect/Result'`), not the `effect` barrel.

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

TypeScript runs side by side as described for TypeScript 7.0: `tsc` is TypeScript 7 (devDependency alias `@typescript/native`), used by `build`, `types:check` and docgen's example check; `typescript` resolves to `@typescript/typescript6`, which provides the 6.0 API for typescript-eslint and docgen and the `tsc6` binary.

Commit messages and pull request titles must follow Conventional Commits: commitlint (`commitlint.config.ts`) checks them in the husky `commit-msg` hook and in `.github/workflows/commitlint.yml`, because releases and the changelog are derived from them.

Run a single test file or case with vitest directly:

```bash
pnpm exec vitest run tests/averages/sma.spec.ts
pnpm exec vitest run -t "test name"
```

These checks mirror the `build` job in `.github/workflows/test.yml`, run in this order: knip → format:check → types:check → lint → lint:claude → test → build → package:check → docgen (fails if the committed `docs/` differ from the regenerated ones). The `test` job in `publish.yml` runs the same sequence except docgen before publishing. The `update-dependencies` skill (`.claude/skills/update-dependencies/`) automates a full dependency bump following this same order with self-healing retries.

## Releases

`.github/workflows/publish.yml` runs release-please (`release-please-config.json`, `.release-please-manifest.json`) on every push to `main`: it maintains a release pull request with the next version and `CHANGELOG.md`, derived from Conventional Commits (breaking changes bump the minor version below 1.0.0). Merging that pull request tags the release (without `v`, e.g. `0.9.0`), creates the GitHub release and, in the same workflow, runs the checks and publishes to npm (trusted publishing, bound to the file name `publish.yml`). release-please authenticates with a GitHub App token (repository variable `RELEASE_APP_CLIENT_ID`, secret `RELEASE_APP_PRIVATE_KEY`; permissions contents, issues and pull requests: write) so that the required checks run on the release pull request; without them it falls back to `GITHUB_TOKEN`, whose pull requests trigger no workflows. Never bump `version` in `package.json` by hand. `@since` tags of new exports use the version the release pull request will create.

## Architecture

**Steppers.** Every indicator is a `Stepper` (`src/steps/stepper.ts`): a pure state machine with an `initial` state and `step(state, input) => [nextState, output]` that returns one output per input (`null` until the indicator is defined). State objects are immutable. Building blocks in `src/steps/`:

- `smoother.ts`: exponential smoothing seeded with the arithmetic mean of the first `period` inputs; `emaStepper` (factor `2 / (period + 1)`) and `smmaStepper` (factor `1 / period`, Wilder) are built on it and reused by `dema`, `tema`, `macd`, `rsi`, `atr` and `adx`. `skipNull` chains steppers (e.g. EMA of an EMA).
- `sliding.ts` + `compensatedSum.ts`: `sma` and `wma` keep Neumaier-compensated running sums over a sliding window, so every step is O(1). Batch calculation reads the value leaving the window from the input array (`slidingInputs`); incremental calculation remembers the window (`withWindow`).
- `incremental.ts`: `toIncremental` turns a stepper into the public, immutable `Incremental` API.

**Batch and incremental API.** Each indicator file (`src/averages/*.ts`, `src/movements/*.ts`, `src/oscillators/*.ts`) contains its stepper and two public functions sharing it:

- batch (`sma(values, period)`): validate with Effect `Result` (`R.all({...})` short-circuits on the first failure in key order; then `validateFinite`), `run` the stepper over all values (`Arr.mapAccum`, linear), convert to the public `Result` with `fromResult` (`src/utils/result.ts`) as the last pipe step. Every output series has the input length, so `value[i]` belongs to `values[i]`. `atr`/`adx` convert `HighLowClose` series to `Candle`s (`rec.toCandles`).
- incremental (`incrementalSma(period)`): validate the periods, then `toIncremental(stepper, emptyValue, validateInput)`; every `push` validates its input (`number_.validateFinite`, `rec.validateCandle`).

Because both run the same stepper, pushing a series value by value yields exactly (bitwise) the batch result; `tests/incremental.spec.ts` checks this for every indicator. Validation failures are one of the `Error` subclasses in `src/errors/` (`NotEnoughDataError`, `NotPositiveIntegerError`, `UnequalArraySizesError`, `PeriodSizeMismatchError`, `NotFiniteNumberError`) — never a thrown exception. New indicators are added as a stepper composed from the existing building blocks plus a batch and an incremental function.

**Public API.** The package has a single entry point: `src/index.ts` re-exports every public export by name (no `export *`), and `package.json`'s `exports` map contains only `"."` and `"./package.json"`. `tests/index.spec.ts` pins the exported runtime names. `@public` on a JSDoc comment marks the public API (enforced by `jsdoc/require-jsdoc` with `publicOnly: true`); `@internal` marks helpers exported only for reuse across `src/` and for direct unit testing; `stripInternal` removes them from the published `.d.ts`. Error classes in `src/errors/`, the types in `src/types.ts` (`Result`, `NonEmptyArray`, `IndicatorError`, `HighLowClose`, `Candle`, `Incremental`) and the indicator result types (`MACDReturn`, `MACDValue`, `ADXReturn`, `ADXValue`) are `@public` so consumers can use `instanceof` and import the types. A new public export must be added to `src/index.ts` and `tests/index.spec.ts`. `knip.config.ts`'s only entry is `src/index.ts`.

**HighLowClose shape.** Indicators needing more than a single price series (`atr`, `adx`) take a `HighLowClose<number>` record (`src/types.ts`); `src/utils/record.ts` validates it the same way `src/utils/array.ts` does for plain arrays.

**Adapters.** `src/utils/toPromise.ts` and `src/utils/toEffectResult.ts` convert a `Result` into a Promise or an Effect `Result`.

**Documentation.** `docs/modules/**` is generated by `@effect/docgen` (`docgen.json`) from the JSDoc of public exports — never edit it by hand, run `pnpm docgen` and commit the result. Every `@public` export needs a description, `@category` (`indicators`, `incremental`, `models`, `errors`, `adapters`) and `@since` (the first release that contained it; new exports get the next release version). Indicators carry an `@example` with `node:assert` checks: docgen type-checks them with `tsc` and runs them with `tsx`, so examples are tests. Examples import from `@ldrick/trade-indicators`, mapped to `src/index.ts` via `paths` in `docgen.json`. Internal-only modules and `src/index.ts` are listed in `docgen.json`'s `exclude`. `scripts/fixDocgenSourceLinks.ts` repairs docgen's "Source" links, which drop nested folders. The site is built and deployed by `.github/workflows/pages.yml` (Jekyll with the pinned remote theme `just-the-docs/just-the-docs@v0.12.0`, set in both `docs/_config.yml` and `docgen.json` because docgen rewrites the `remote_theme` line); pull requests touching `docs/` build it without deploying. `docs/index.md`, `docs/modules/index.md` and `docs/_config.yml` are hand-maintained (docgen does not overwrite the first two). `docs/modules/` and `CHANGELOG.md` (release-please) are generated and excluded from oxfmt and ESLint.

**Testing.** Test files are `tests/**/*.spec.ts`, mirroring `src/` structure (not `*.test.ts`, despite both being allowed by `vitest.config.ts`). Coverage thresholds are set to 100% (`v8` provider) — genuinely unreachable branches need a `// v8 ignore next -- <reason>` comment explaining _why_ it's unreachable (see existing examples in `dema.ts`, `tema.ts`, `macd.ts`, `adx.ts`), not a blanket ignore. `tests/prices.json` holds shared fixture data: NVDA daily candles (`query`) with indicator values from Finnhub's technical indicator API, i.e. independent reference values; the `rsi` values come from an exact-fraction reference implementation that also reproduces StockCharts' published RSI(14) example. Indicator tests build expected failures with `failure()`/`success()` from `tests/result.ts`; `aligned(expected, length)` pads fixture values (which list only calculated values) to the input length. The custom matcher `okToEqualFixedPrecision` compares with an absolute tolerance of `10^-decimals` (default 10 decimals; fixtures match up to 12).

**Linting is two-layered.** ESLint (`eslint.config.ts`) covers JS/TS (including type-aware and immutability rules via `eslint-plugin-functional`, restricted to `src/!(errors)/*.ts`) plus JSON/Markdown/package.json linting that oxlint can't do. `oxfmt` (not Prettier) handles formatting. `claudelint` separately validates the `.claude/` directory itself (skills, settings, hooks) in `--strict` mode, so any new skill/hook/setting must also pass `pnpm lint:claude`. `MIGRATION-oxlint.local.md` is a local, not-yet-implemented draft plan for replacing ESLint with oxlint — the active linter today is still ESLint.
