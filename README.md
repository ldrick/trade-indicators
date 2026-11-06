# trade-indicators

[![test](https://github.com/ldrick/trade-indicators/actions/workflows/test.yml/badge.svg)](https://github.com/ldrick/trade-indicators/actions/workflows/test.yml)
[![codecov](https://img.shields.io/codecov/c/github/ldrick/trade-indicators/main)](https://codecov.io/gh/ldrick/trade-indicators)
[![npm version](https://img.shields.io/npm/v/@ldrick/trade-indicators?color=blue)](https://www.npmjs.com/package/@ldrick/trade-indicators)
[![npm license](https://img.shields.io/npm/l/@ldrick/trade-indicators)](https://www.npmjs.com/package/@ldrick/trade-indicators)
[![made with](https://img.shields.io/github/languages/top/ldrick/trade-indicators)](https://www.typescriptlang.org/)

> Trade Indicators written in pure functional TypeScript. \
> No function throws: every indicator returns a `Result`, \
> either `{ ok: true, value }` or `{ ok: false, error }`. \
> Every result series has one entry per input value (`value[i]` belongs to `values[i]`), \
> starting with `null` until enough values are available. \
> Indicators expose no third-party types; adapters for Promises and [Effect](https://effect.website) are included.
>
> - Average Directional Index (adx)
> - Average True Range (atr)
> - Double Exponential Moving Average (dema)
> - Exponential Moving Average (ema)
> - Moving Average Convergence / Divergence (macd)
> - Relative Strength Index (rsi)
> - Simple Moving Average (sma)
> - Smoothed Moving Average (smma)
> - Triple Exponential Moving Average (tema)
> - Weighted Moving Average (wma)

## Install

`npm install @ldrick/trade-indicators` \
or \
`pnpm add @ldrick/trade-indicators`

## Usage

In TypeScript:

```typescript
import { ema, toEffectResult, toPromise } from '@ldrick/trade-indicators';

const prices = [3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5];
const period = 3;

// check the Result directly
const result = ema(prices, period);
if (result.ok) {
	console.log(result.value);
} else {
	console.log(result.error);
}

// or convert the Result to a Promise
toPromise(ema(prices, period)).then(
	(values) => console.log(values),
	(error) => console.log(error),
);

// or to an Effect Result
const effectResult = toEffectResult(ema(prices, period));
```

## Errors

No function throws. Invalid input is returned as `{ ok: false, error }` with one of the error classes
exported by the package (e.g. `NotEnoughDataError`, `NotFiniteNumberError`),
so errors can be distinguished with `instanceof`.

## Documentation

See [ldrick.github.io/trade-indicators](https://ldrick.github.io/trade-indicators/) for every
indicator's signature, output length and an example.
