// @ts-check

import eslint from '@eslint/js';
import commentsPlugin from '@eslint-community/eslint-plugin-eslint-comments/configs';
import configPrettier from 'eslint-config-prettier';
import functionalPlugin from 'eslint-plugin-functional/flat';
import importPlugin from 'eslint-plugin-import';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import unicornPlugin from 'eslint-plugin-unicorn';
import vitestPlugin from 'eslint-plugin-vitest';
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
	unicornPlugin.configs['flat/recommended'],
	configPrettier,
	// base config
	{
		languageOptions: {
			globals: {
				...globals.es2021,
				...globals.node,
			},
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.url,
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
					peerDependencies: true,
					optionalDependencies: false,
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
			'import/order': [
				'error',
				{
					groups: ['builtin', 'external', ['sibling', 'parent'], 'index', 'object', 'type'],
					'newlines-between': 'always',
					alphabetize: {
						order: 'asc',
						caseInsensitive: true,
					},
				},
			],
			'unicorn/filename-case': ['error', { cases: { camelCase: true, pascalCase: true } }],
			'unicorn/no-null': 'off',
			'unicorn/no-array-reduce': 'off',
			'unicorn/no-array-callback-reference': 'off',
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
			'no-nested-ternary': 'off',
			'jsdoc/require-returns': 'off',
			'jsdoc/require-param': 'off',
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
			'jsdoc/require-description': [
				'error',
				{
					contexts: ['any'],
				},
			],
			'jsdoc/check-tag-names': [
				'error',
				{
					definedTags: ['internal'],
				},
			],
		},
	},
	// overrides for TypeScript Definition files
	{
		files: ['**/*.d.ts'],
		rules: {
			'unicorn/filename-case': 'off',
			'@typescript-eslint/no-empty-object-type': [
				'error',
				{ allowInterfaces: 'with-single-extends', allowObjectTypes: 'never' },
			],
		},
	},
	// overrides for functional TypeScript files
	{
		files: ['src/!(errors)/*.ts'],
		ignores: ['**/*.d.ts'],
		...functionalPlugin.configs.externalVanillaRecommended,
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
	},
	// overrides for Config files
	{
		files: ['eslint.config.js', 'vitest.config.ts'],
		rules: {
			'import/no-default-export': 'off',
		},
	},
);
