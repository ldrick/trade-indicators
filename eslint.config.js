// @ts-check

import commentsPlugin from '@eslint-community/eslint-plugin-eslint-comments/configs';
import eslint from '@eslint/js';
import vitestPlugin from '@vitest/eslint-plugin';
import configPrettier from 'eslint-config-prettier';
import functionalPlugin from 'eslint-plugin-functional';
import importPlugin from 'eslint-plugin-import';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import perfectionist from 'eslint-plugin-perfectionist';
import unicornPlugin from 'eslint-plugin-unicorn';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';

export default typescriptEslint.config(
	// register all of the plugins upfront
	{
		plugins: {
			['@typescript-eslint']: typescriptEslint.plugin,
			['functional']: functionalPlugin,
			['import']: importPlugin,
			['jsdoc']: jsdocPlugin,
			['vitest']: vitestPlugin,
		},
	},
	// ignored files
	{
		ignores: ['node_modules', 'dist', 'coverage'],
	},
	// extends
	eslint.configs.recommended,
	commentsPlugin.recommended,
	...typescriptEslint.configs.strictTypeChecked,
	...typescriptEslint.configs.stylisticTypeChecked,
	unicornPlugin.configs['recommended'],
	perfectionist.configs['recommended-natural'],
	// base config
	{
		languageOptions: {
			ecmaVersion: 2023,
			globals: {
				...globals.es2023,
				...globals.node,
			},
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
				warnOnUnsupportedTypeScriptVersion: false,
			},
		},
		rules: {
			// disallow non-import statements appearing before import statements
			'import/first': 'error',
			// Require a newline after the last import/require in a group
			'import/newline-after-import': 'error',
			// Forbid import of modules using absolute paths
			'import/no-absolute-path': 'error',
			// disallow AMD require/define
			'import/no-amd': 'error',
			// forbid default exports - we want to standardize on named exports so that imported names are consistent
			'import/no-default-export': 'error',
			// disallow imports from duplicate paths
			'import/no-duplicates': 'error',
			// Forbid the use of extraneous packages
			'import/no-extraneous-dependencies': [
				'error',
				{
					devDependencies: true,
					optionalDependencies: false,
					peerDependencies: true,
				},
			],
			// Forbid mutable exports
			'import/no-mutable-exports': 'error',
			// Prevent importing the default as if it were named
			'import/no-named-default': 'error',
			// Prohibit named exports
			'import/no-named-export': 'off', // we want everything to be a named export
			// Forbid a module from importing itself
			'import/no-self-import': 'error',
			// Require modules with a single export to use a default export
			'import/prefer-default-export': 'off', // we want everything to be named
			'unicorn/filename-case': ['error', { cases: { camelCase: true, pascalCase: true } }],
			'unicorn/no-array-callback-reference': 'off',
			'unicorn/no-array-reduce': 'off',
			'unicorn/no-null': 'off',
		},
	},
	// overrides for JavaScript files
	{
		files: ['*.js'],
		...typescriptEslint.configs.disableTypeChecked,
	},
	// overrides for TypeScript files
	{
		files: ['*.ts'],
		ignores: ['**/*.d.ts'],
		rules: {
			...jsdocPlugin.configs['flat/recommended-typescript-error'].rules,
			'jsdoc/check-tag-names': [
				'error',
				{
					definedTags: ['internal'],
				},
			],
			'jsdoc/require-description': [
				'error',
				{
					contexts: ['any'],
				},
			],
			'jsdoc/require-jsdoc': [
				'error',
				{
					publicOnly: {
						esm: true,
					},
					require: {
						ArrowFunctionExpression: true,
						ClassDeclaration: true,
						ClassExpression: true,
						FunctionDeclaration: true,
						FunctionExpression: true,
						MethodDefinition: false,
					},
				},
			],
			'jsdoc/require-param': 'off',
			'jsdoc/require-returns': 'off',
			'no-nested-ternary': 'off',
		},
	},
	// overrides for TypeScript Definition files
	{
		files: ['**/*.d.ts'],
		rules: {
			'@typescript-eslint/no-empty-object-type': [
				'error',
				{ allowInterfaces: 'with-single-extends', allowObjectTypes: 'never' },
			],
			'import/no-default-export': 'off',
			'unicorn/filename-case': 'off',
		},
	},
	// overrides for functional TypeScript files
	{
		files: ['src/!(errors)/*.ts'],
		ignores: ['**/*.d.ts'],
		...functionalPlugin.configs.externalTypescriptRecommended,
		...functionalPlugin.configs.recommended,
		...functionalPlugin.configs.stylistic,
	},
	// overrides for Test files
	{
		files: ['*.spec.ts'],
		languageOptions: {
			globals: {
				...vitestPlugin.environments.env.globals,
			},
		},
		rules: {
			...vitestPlugin.configs.recommended.rules,
			'vitest/consistent-test-it': [
				'error',
				{
					fn: 'it',
					withinDescribe: 'it',
				},
			],
		},
		settings: {
			vitest: {
				typecheck: true,
			},
		},
	},
	// overrides for Config files
	{
		files: ['eslint.config.js', 'vitest.config.ts'],
		rules: {
			'import/no-default-export': 'off',
		},
	},
	// prettier has to be the last extension
	configPrettier,
);
