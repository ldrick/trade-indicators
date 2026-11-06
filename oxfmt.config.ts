import { defineConfig } from 'oxfmt';

export default defineConfig({
	// generated: docs/modules by @effect/docgen (`pnpm docgen`), CHANGELOG.md by release-please
	ignorePatterns: ['**/node_modules/', 'dist/', 'coverage/', 'docs/modules/', 'CHANGELOG.md'],
	singleQuote: true,
	// key order is enforced by eslint-plugin-package-json's order-properties rule instead
	sortPackageJson: false,
});
