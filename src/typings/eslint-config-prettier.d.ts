declare module 'eslint-config-prettier' {
	import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';

	const toBeExported: FlatConfig.Config;
	export default toBeExported;
}
