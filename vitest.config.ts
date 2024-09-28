import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		coverage: {
			/**
			 * Type-only or interface-only files need to be excluded,
			 * as v8 collects them,	but they won't be covered.
			 * @see https://github.com/vitest-dev/vitest/issues/3605
			 */
			exclude: ['src/types.ts', 'src/**/*.d.ts'],
			include: ['src/**/*.ts'],
			provider: 'v8',
			thresholds: {
				100: true,
			},
		},
		globals: true,
		include: ['./tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		setupFiles: ['./tests/config/setup.ts'],
	},
});
