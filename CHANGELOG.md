# Changelog

## [0.9.0](https://github.com/ldrick/trade-indicators/compare/0.8.0...0.9.0) (2026-11-06)


### ⚠ BREAKING CHANGES

* EmptyArrayError is removed from the API.
* subpath imports such as '@ldrick/trade-indicators/averages/ema.js' are no longer exported; import from '@ldrick/trade-indicators' instead.
* all series are NonEmptyArray<null | number> with the length of the input instead of shorter number arrays.
* `@ldrick/trade-indicators/toEither.js` is removed, use `toEffectResult.js`. `effect` is a runtime dependency instead of fp-ts.
* indicators return `Result` instead of `Either`. Use `toEither(result)` to keep using fp-ts pipelines. fp-ts is no longer a peer dependency.
* the error class, its name property and its export path changed to the correct spelling.
* fp-ts must be installed by the consumer (as the README already instructs).
* `./averages/dma.js` and `./averages/ma.js` are no longer exported.
* non-finite input values now yield NotFiniteNumberError instead of Error('[big.js] Invalid number'); big.js is no longer a dependency.

### Features

* add claudelint to validate Claude Code configuration ([#44](https://github.com/ldrick/trade-indicators/issues/44)) ([7164950](https://github.com/ldrick/trade-indicators/commit/7164950dc0ff280a3d857210746ce9fd431c33d8))
* add histogram (macd - signal) to macd result ([3448d9b](https://github.com/ldrick/trade-indicators/commit/3448d9bbcd36a487b16790b227b7d00637cf2559))
* add Relative Strength Index (rsi) ([ccb91e8](https://github.com/ldrick/trade-indicators/commit/ccb91e84befc20b0c5e369136474e010b497a4d9))
* align every indicator output to the input length ([5732278](https://github.com/ldrick/trade-indicators/commit/573227804aaec334da7b20a1b7f56ec1d9a0171f))
* incremental API on shared steppers, O(1) sliding sums ([c00c407](https://github.com/ldrick/trade-indicators/commit/c00c4078d175b3cd40b42ea85250498147e82f9a))
* publish error classes and result types, clean up exports map ([71ae4cf](https://github.com/ldrick/trade-indicators/commit/71ae4cfae368d3f0dac45d032dc4233a2dc8f2f1))
* return own Result type instead of fp-ts Either ([b4f9f35](https://github.com/ldrick/trade-indicators/commit/b4f9f35aa1789f088340a8e7b8314934b5a2409d))
* single package entry point via src/index.ts ([fbf5731](https://github.com/ldrick/trade-indicators/commit/fbf57314c414f9a0bd2cccefa3254484f23f5a15))


### Bug Fixes

* override vulnerable minimatch and katex dev dependencies ([#63](https://github.com/ldrick/trade-indicators/issues/63)) ([9e71589](https://github.com/ldrick/trade-indicators/commit/9e715897bceae8a70c0cdb95ac96a69eaee8e20b))
* reject high/low/close series of unequal length in atr and adx ([8cc2b73](https://github.com/ldrick/trade-indicators/commit/8cc2b732aaa4e42f793e14b355082e83f46bf256))
* rename PeriodSizeMissmatchError to PeriodSizeMismatchError ([61c8f0e](https://github.com/ldrick/trade-indicators/commit/61c8f0e1ba226c591da02de9ce2bb29f11a62dd5))


### Refactoring

* replace big.js with plain number math ([1dd043e](https://github.com/ldrick/trade-indicators/commit/1dd043ec323d8bf9cee9052a1ab95a8875505f92))
* switch internals from fp-ts to Effect, add toEffectResult ([e669be8](https://github.com/ldrick/trade-indicators/commit/e669be8841c1f69f63d0a8db053bd8fc58aad530))


### Build

* declare fp-ts as peer dependency ([2032d37](https://github.com/ldrick/trade-indicators/commit/2032d375ceddf8f1b305f4c5a35f7c7d42dec5be))


### Documentation

* add SECURITY, CONTRIBUTING, issue forms and PR template ([f07b808](https://github.com/ldrick/trade-indicators/commit/f07b80847bd98813f1b255950367418f391b09f9))
* describe the current state precisely in README and docs index ([ef48d51](https://github.com/ldrick/trade-indicators/commit/ef48d513a7fc4241978b37715d9ff9162c1ff015))
* generate module docs with @effect/docgen ([e8eee75](https://github.com/ldrick/trade-indicators/commit/e8eee75bb801e1b64f423e40ae9079e98733b16f))
* regenerate module reference and update README ([d430001](https://github.com/ldrick/trade-indicators/commit/d430001d345e58f131b467e506bd453318373f89))
