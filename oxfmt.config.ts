import { defineConfig } from 'oxfmt';

export default defineConfig({
	ignorePatterns: ['**/node_modules/', 'dist/', 'coverage/'],
	singleQuote: true,
	// key order is enforced by eslint-plugin-package-json's order-properties rule instead
	sortPackageJson: false,
});
