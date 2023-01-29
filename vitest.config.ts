// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vitest/config';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
	test: {
		include: ['./tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		setupFiles: ['./tests/config/setup.ts'],
		coverage: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
	},
});
