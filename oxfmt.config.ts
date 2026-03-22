import { defineConfig } from 'oxfmt';

export default defineConfig({
	ignorePatterns: ['**/node_modules/', 'dist/', 'coverage/'],
	singleQuote: true,
});
