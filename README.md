# trade-indicators

[![build status](https://img.shields.io/github/workflow/status/ldrick/trade-indicators/Test)](https://github.com/ldrick/trade-indicators/actions?query=workflow%3ATest)
[![codecov](https://img.shields.io/codecov/c/github/ldrick/trade-indicators/main)](https://codecov.io/gh/ldrick/trade-indicators)
[![npm version](https://img.shields.io/npm/v/@ldrick/trade-indicators?color=blue)](https://www.npmjs.com/package/@ldrick/trade-indicators)
[![npm license](https://img.shields.io/npm/l/@ldrick/trade-indicators)](https://www.npmjs.com/package/@ldrick/trade-indicators)
[![made with](https://img.shields.io/github/languages/top/ldrick/trade-indicators)](https://www.typescriptlang.org/)

> Trade Indicators written in pure functional Typescript
> Results will be Either<E,A> using awesome [fp-ts](https://github.com/gcanti/fp-ts)
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

`npm install @ldrick/trade-indicators fp-ts` \
or \
`yarn add @ldrick/trade-indicators fp-ts`

## Usage

In TypeScript:

```typescript
import { either as E } from 'fp-ts/lib';
import { pipe } from 'fp-ts/lib/function';
import { dema, ema, sma, smma, tema, wma } from '@ldrick/trade-indicators';

const prices = [3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5];
const period = 3;

const demaR = pipe(
  dema(prices, period),
  E.getOrElse(() => <readonly number[]>[0]),
);

const emaR = pipe(
  ema(prices, period),
  E.getOrElse(() => <readonly number[]>[0]),
);

const smaR = pipe(
  sma(prices, period),
  E.getOrElse(() => <readonly number[]>[0]),
);

const smmaR = pipe(
  smma(prices, period),
  E.getOrElse(() => <readonly number[]>[0]),
);

const temaR = pipe(
  tema(prices, period),
  E.getOrElse(() => <readonly number[]>[0]),
);

const wmaR = pipe(
  wma(prices, period),
  E.getOrElse(() => <readonly number[]>[0]),
);
```
