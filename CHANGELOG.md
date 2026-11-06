# Changelog

## [0.9.1](https://github.com/ldrick/trade-indicators/compare/0.9.0...0.9.1) (2026-11-06)


### Bug Fixes

* allow require() of the package from CommonJS ([3e2c4a9](https://github.com/ldrick/trade-indicators/commit/3e2c4a911df15fcb55373db875a847b9af8775c1))


### Build

* describe the package better on npm ([84df01f](https://github.com/ldrick/trade-indicators/commit/84df01f3e60160a7766e7e5a649dd9b792e2b456))
* require Node.js 22.12 for require() of the ESM-only package ([4f524c4](https://github.com/ldrick/trade-indicators/commit/4f524c4bd7f99d5b8a03e3078a39389d60209e95))

## [0.9.0](https://github.com/ldrick/trade-indicators/compare/0.8.0...0.9.0) (2026-11-06)


### ⚠ BREAKING CHANGES

* Indicators return the package's own `Result` (`{ ok: true, value } | { ok: false, error }`) instead of an fp-ts `Either`. Use `toPromise` or `toEffectResult` to convert it.
* Every output series has the length of the input, so `value[i]` belongs to `values[i]`. Positions before the first calculable value are `null`, and series are typed `NonEmptyArray<null | number>`. This also applies to `macd` (`macd`, `signal`, `histogram`) and `adx` (`adx`, `pdi`, `mdi`).
* The package has a single entry point: import everything from `@ldrick/trade-indicators`. Subpath imports such as `@ldrick/trade-indicators/averages/ema.js` are no longer available.
* `fp-ts` and `big.js` are no longer dependencies. Calculations use plain `number` math.
* `PeriodSizeMissmatchError` is renamed to `PeriodSizeMismatchError`.
* Non-finite input values (`NaN`, `±Infinity`) return the new `NotFiniteNumberError`.
* `atr` and `adx` return `UnequalArraySizesError` if `high`, `low` and `close` differ in length.

### Features

* Incremental indicators for live data: `incrementalSma`, `incrementalEma`, `incrementalSmma`, `incrementalWma`, `incrementalDema`, `incrementalTema`, `incrementalMacd`, `incrementalRsi`, `incrementalAtr` and `incrementalAdx`. Push one value (or `Candle`) at a time and get exactly the results of the batch functions. Instances are immutable.
* Relative Strength Index: `rsi` and `incrementalRsi`.
* `macd` returns a `histogram` (`macd - signal`).
* Error classes and the types `Result`, `NonEmptyArray`, `IndicatorError`, `HighLowClose`, `Candle`, `Incremental`, `MACDReturn`, `MACDValue`, `ADXReturn` and `ADXValue` are exported.
* `toEffectResult` converts a `Result` into an Effect `Result`.

### Performance

* All indicators run in linear time. EMA-based indicators previously slowed down quadratically and ran out of memory at about 20,000 values. At 100,000 values, `sma(200)` drops from 133 to 20 ms and `adx` from 298 to 46 ms.

### Bug Fixes

* `atr` and `adx` no longer return values computed from misaligned series when `high`, `low` and `close` differ in length.
* Override vulnerable minimatch and katex dev dependencies ([#63](https://github.com/ldrick/trade-indicators/issues/63)).

### Documentation

* The API reference is generated from the source. Every example is type-checked and run in CI.
* Added SECURITY.md, CONTRIBUTING.md and issue forms.

### Development

* Releases are automated with release-please.
* claudelint validates the Claude Code configuration ([#44](https://github.com/ldrick/trade-indicators/issues/44)).
