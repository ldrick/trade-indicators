import { describe, expect, it } from 'vitest';

import * as api from '../src/index.js';

describe('public API', () => {
	it('exports exactly the documented runtime values', () => {
		expect(Object.keys(api).toSorted((a, b) => a.localeCompare(b, 'en'))).toStrictEqual([
			'adx',
			'atr',
			'dema',
			'ema',
			'EmptyArrayError',
			'macd',
			'NotEnoughDataError',
			'NotFiniteNumberError',
			'NotPositiveIntegerError',
			'PeriodSizeMismatchError',
			'rsi',
			'sma',
			'smma',
			'tema',
			'toEffectResult',
			'toPromise',
			'UnequalArraySizesError',
			'wma',
		]);
	});
});
