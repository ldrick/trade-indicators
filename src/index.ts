// Public API of @ldrick/trade-indicators. Everything exported here is part of the package's API.

export { dema } from './averages/dema.js';
export { ema } from './averages/ema.js';
export { macd, type MACDReturn } from './averages/macd.js';
export { sma } from './averages/sma.js';
export { smma } from './averages/smma.js';
export { tema } from './averages/tema.js';
export { wma } from './averages/wma.js';
export { EmptyArrayError } from './errors/EmptyArrayError.js';
export { NotEnoughDataError } from './errors/NotEnoughDataError.js';
export { NotFiniteNumberError } from './errors/NotFiniteNumberError.js';
export { NotPositiveIntegerError } from './errors/NotPositiveIntegerError.js';
export { PeriodSizeMismatchError } from './errors/PeriodSizeMismatchError.js';
export { UnequalArraySizesError } from './errors/UnequalArraySizesError.js';
export { adx, type ADXReturn } from './movements/adx.js';
export { atr } from './movements/atr.js';
export { rsi } from './oscillators/rsi.js';
export {
	type HighLowClose,
	type IndicatorError,
	type NonEmptyArray,
	type Result,
} from './types.js';
export { toEffectResult } from './utils/toEffectResult.js';
export { toPromise } from './utils/toPromise.js';
