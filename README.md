# trade-indicators

[![test](https://github.com/ldrick/trade-indicators/actions/workflows/test.yml/badge.svg)](https://github.com/ldrick/trade-indicators/actions/workflows/test.yml)
[![codecov](https://img.shields.io/codecov/c/github/ldrick/trade-indicators/main)](https://codecov.io/gh/ldrick/trade-indicators)
[![npm version](https://img.shields.io/npm/v/@ldrick/trade-indicators?color=blue)](https://www.npmjs.com/package/@ldrick/trade-indicators)
[![npm license](https://img.shields.io/npm/l/@ldrick/trade-indicators)](https://www.npmjs.com/package/@ldrick/trade-indicators)
[![made with](https://img.shields.io/github/languages/top/ldrick/trade-indicators)](https://www.typescriptlang.org/)

> Trade Indicators written in pure functional Typescript. \
> Results will be \
> `Either<Error, ReadonlyArray<number> | Readonly<Record<string, ReadonlyArray<number>>>>` \
> depending on what is returned using these amazing libraries: \
> 🚀 [fp-ts](https://github.com/gcanti/fp-ts) \
> 🌟 [big.js](https://github.com/MikeMcl/big.js/)
>
> - Average Directional Index (adx)
> - Average True Range (atr)
> - Double Exponential Moving Average (dema)
> - Exponential Moving Average (ema)
> - Moving Average Convergence / Divergence (macd)
> - Simple Moving Average (sma)
> - Smoothed Moving Average (smma)
> - Triple Exponential Moving Average (tema)
> - Weighted Moving Average (wma)

## Install

`npm install @ldrick/trade-indicators fp-ts big.js` \
or \
`yarn add @ldrick/trade-indicators fp-ts big.js`

## Usage

In TypeScript:

```typescript
import { either as E, function as F } from 'fp-ts/lib';
import { ema, toPromise } from '@ldrick/trade-indicators';

const prices = [3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5];
const period = 3;

// possible usage to pipe the Result E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>>
const expMovingAverage = F.pipe(
	ema(prices, period),
	E.getOrElse(() => <ReadonlyArray<number>>[]),
);

// or convert the Result to Promise<RNEA.ReadonlyNonEmptyArray<number>>
toPromise(ema(prices, period)).then(
	(result) => console.log(result),
	(error) => console.log(error),
);
```
