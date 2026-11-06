import type { KnipConfig } from 'knip';

const config: KnipConfig = {
	entry: [
		'src/utils/toPromise.ts',
		'src/utils/toEither.ts',
		'src/averages/dema.ts',
		'src/averages/ema.ts',
		'src/averages/macd.ts',
		'src/averages/sma.ts',
		'src/averages/smma.ts',
		'src/averages/tema.ts',
		'src/averages/wma.ts',
		'src/movements/adx.ts',
		'src/movements/atr.ts',
		'src/oscillators/rsi.ts',
		'src/errors/*.ts',
		'src/types.ts',
	],
};

export default config;
