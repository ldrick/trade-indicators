# trade-indicators

> Trade Indicators written in Typescript
>
> - Double Exponential Moving Average (dema)
> - Exponential Moving Average (ema)
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
import { dema, ema, sma, smma, tema, wma } = from "@ldrick/trade-indicators"

const prices = [3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5];
const period = 3;

dema(prices, period);
ema(prices, period);
sma(prices, period);
smma(prices, period);
tema(prices, period);
wma(prices, period);
```
