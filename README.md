# trade-indicators

[![build status](https://img.shields.io/github/workflow/status/ldrick/trade-indicators/Test)](https://github.com/ldrick/trade-indicators/actions?query=workflow%3ATest)
[![codecov](https://img.shields.io/codecov/c/github/ldrick/trade-indicators/main)](https://codecov.io/gh/ldrick/trade-indicators)
[![npm version](https://img.shields.io/npm/v/@ldrick/trade-indicators?color=blue)](https://www.npmjs.com/package/@ldrick/trade-indicators)
[![npm license](https://img.shields.io/npm/l/@ldrick/trade-indicators)](https://www.npmjs.com/package/@ldrick/trade-indicators)
[![made with](https://img.shields.io/github/languages/top/ldrick/trade-indicators)](https://www.typescriptlang.org/)

> Trade Indicators written in Typescript
>
> - Average Directional Index (adx)
> - Average True Range (atr)
> - Double Exponential Moving Average (dema)
> - Exponential Moving Average (ema)
> - Positive Directional Index (pdi)
> - Negative Directional Index (mdi)
> - Simple Moving Average (sma)
> - Smoothed Moving Average (smma)
> - Triple Exponential Moving Average (tema)
> - Weighted Moving Average (wma)

## Install

`npm install @ldrick/trade-indicators` \
or \
`yarn add @ldrick/trade-indicators`

## Usage

In JavaScript:

```javascript
const { dema, ema, sma, smma, tema, wma } = require('@ldrick/trade-indicators');
const prices = [3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5];
const period = 3;

dema(prices, period);
ema(prices, period);
sma(prices, period);
smma(prices, period);
tema(prices, period);
wma(prices, period);
```

In TypeScript:

```typescript
import { dema, ema, sma, smma, tema, wma } from '@ldrick/trade-indicators';

const prices = [3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5];
const period = 3;

dema(prices, period);
ema(prices, period);
sma(prices, period);
smma(prices, period);
tema(prices, period);
wma(prices, period);
```
