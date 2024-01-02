// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vitest/config';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
	test: {
		globals: true,
		include: ['./tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		setupFiles: ['./tests/config/setup.ts'],
		coverage: {
			provider: 'v8',
			include: ['src/**/*.ts'],
			/**
			 * Type-only or interface-only files need to be excluded,
			 * as v8 collects them,	but they won't be covered.
			 * @see https://github.com/vitest-dev/vitest/issues/3605
			 */
			exclude: ['src/types.ts'],
			thresholds: {
				100: true,
			},
		},
	},
});
