// Public API of @ldrick/trade-indicators. Everything exported here is part of the package's API.

export { dema, incrementalDema } from './averages/dema.js';
export { ema, incrementalEma } from './averages/ema.js';
export { incrementalMacd, macd, type MACDReturn, type MACDValue } from './averages/macd.js';
export { incrementalSma, sma } from './averages/sma.js';
export { incrementalSmma, smma } from './averages/smma.js';
export { incrementalTema, tema } from './averages/tema.js';
export { incrementalWma, wma } from './averages/wma.js';
export { NotEnoughDataError } from './errors/NotEnoughDataError.js';
export { NotFiniteNumberError } from './errors/NotFiniteNumberError.js';
export { NotPositiveIntegerError } from './errors/NotPositiveIntegerError.js';
export { PeriodSizeMismatchError } from './errors/PeriodSizeMismatchError.js';
export { UnequalArraySizesError } from './errors/UnequalArraySizesError.js';
export { adx, type ADXReturn, type ADXValue, incrementalAdx } from './movements/adx.js';
export { atr, incrementalAtr } from './movements/atr.js';
export { incrementalRsi, rsi } from './oscillators/rsi.js';
export {
	type Candle,
	type HighLowClose,
	type Incremental,
	type IndicatorError,
	type NonEmptyArray,
	type Result,
} from './types.js';
export { toEffectResult } from './utils/toEffectResult.js';
export { toPromise } from './utils/toPromise.js';
