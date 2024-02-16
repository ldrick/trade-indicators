declare module 'eslint-config-prettier' {
	import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';

	declare const exprt: FlatConfig.Config;
	export = exprt;
}
