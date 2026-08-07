import type { KnipConfig } from 'knip';

const config: KnipConfig = {
	entry: [
		'src/utils/toPromise.ts',
		'src/averages/dema.ts',
		'src/averages/dma.ts',
		'src/averages/ema.ts',
		'src/averages/ma.ts',
		'src/averages/macd.ts',
		'src/averages/sma.ts',
		'src/averages/smma.ts',
		'src/averages/tema.ts',
		'src/averages/wma.ts',
		'src/movements/adx.ts',
		'src/movements/atr.ts',
	],
};

export default config;
