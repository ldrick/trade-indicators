// @ts-check

import commentsPlugin from '@eslint-community/eslint-plugin-eslint-comments/configs';
import eslint from '@eslint/js';
import jsonPlugin from '@eslint/json';
import markdownPlugin from '@eslint/markdown';
import vitestPlugin from '@vitest/eslint-plugin';
import configPrettier from 'eslint-config-prettier';
import functionalPlugin from 'eslint-plugin-functional';
import importPlugin from 'eslint-plugin-import';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import perfectionist from 'eslint-plugin-perfectionist';
import unicornPlugin from 'eslint-plugin-unicorn';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';

const EXTENSIONS_MINIMATCH = {
	JavaScript: ['**/*.cjs', '**/*.mjs', '**/*.js'],
	JavaScriptReact: ['**/*.jsx'],
	JSON: ['**/*.json'],
	JSONC: ['**/*.jsonc'],
	Markdown: ['**/*.md'],
	TypeScript: ['**/*.cts', '**/*.mts', '**/*.ts'],
	TypeScriptDefinition: ['**/*.d.ts'],
	TypeScriptReact: ['**/*.tsx'],
};

export default defineConfig(
	// register all of the plugins upfront
	{
		plugins: {
			['@eslint-community/eslint-comments']:
				commentsPlugin.recommended.plugins['@eslint-community/eslint-comments'],
			['@typescript-eslint']: typescriptEslint.plugin,
			// @ts-expect-error Plugin seems improperly typed
			// @see https://github.com/eslint-functional/eslint-plugin-functional/issues/998
			['functional']: functionalPlugin,
			['import']: importPlugin,
			['jsdoc']: jsdocPlugin,
			['perfectionist']: perfectionist,
			['unicorn']: unicornPlugin,
			['vitest']: vitestPlugin,
		},
	},
	// ignored files
	{
		ignores: ['node_modules', 'dist', 'coverage', 'package-lock.json'],
	},
	// restrict eslint recommended only to js and ts files
	{
		...eslint.configs.recommended,
		files: [
			...EXTENSIONS_MINIMATCH.JavaScript,
			...EXTENSIONS_MINIMATCH.JavaScriptReact,
			...EXTENSIONS_MINIMATCH.TypeScript,
			...EXTENSIONS_MINIMATCH.TypeScriptReact,
		],
	},
	// extend typescript-eslint recommended configs as in their docs
	typescriptEslint.configs.strictTypeChecked,
	typescriptEslint.configs.stylisticTypeChecked,
	// base config for js and ts files
	{
		files: [
			...EXTENSIONS_MINIMATCH.JavaScript,
			...EXTENSIONS_MINIMATCH.JavaScriptReact,
			...EXTENSIONS_MINIMATCH.TypeScript,
			...EXTENSIONS_MINIMATCH.TypeScriptReact,
			...EXTENSIONS_MINIMATCH.TypeScriptDefinition,
		],
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
			...commentsPlugin.recommended.rules,
			...unicornPlugin.configs['recommended'].rules,
			...perfectionist.configs['recommended-natural'].rules,
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
		settings: {
			'import/resolver': {
				typescript: {
					alwaysTryTypes: true,
					project: import.meta.dirname,
				},
			},
		},
	},
	// disable type-checked rules according to file types without typings
	// https://typescript-eslint.io/troubleshooting/typed-linting/#how-can-i-disable-type-aware-linting-for-a-set-of-files
	{
		files: [
			...EXTENSIONS_MINIMATCH.JavaScript,
			...EXTENSIONS_MINIMATCH.JavaScriptReact,
			...EXTENSIONS_MINIMATCH.JSON,
			...EXTENSIONS_MINIMATCH.JSONC,
			...EXTENSIONS_MINIMATCH.Markdown,
		],
		...typescriptEslint.configs.disableTypeChecked,
	},
	// overrides for TypeScript files
	{
		files: [...EXTENSIONS_MINIMATCH.TypeScript, ...EXTENSIONS_MINIMATCH.TypeScriptReact],
		ignores: EXTENSIONS_MINIMATCH.TypeScriptDefinition,
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
		files: EXTENSIONS_MINIMATCH.TypeScriptDefinition,
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
		ignores: EXTENSIONS_MINIMATCH.TypeScriptDefinition,
		...functionalPlugin.configs.externalTypescriptRecommended,
		...functionalPlugin.configs.recommended,
		...functionalPlugin.configs.stylistic,
	},
	// overrides for Test files
	{
		files: ['**/*.spec.ts'],
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
	// overrides for json files
	{
		extends: ['json/recommended'],
		files: EXTENSIONS_MINIMATCH.JSON,
		language: 'json/json',
		plugins: {
			['json']: jsonPlugin,
		},
	},
	// overrides for jsonc files
	{
		extends: ['json/recommended'],
		files: [...EXTENSIONS_MINIMATCH.JSONC, '**/tsconfig.json', '.vscode/*.json'],
		language: 'json/jsonc',
		plugins: {
			['json']: jsonPlugin,
		},
	},
	// overrides for markdown files
	{
		extends: ['markdown/recommended'],
		files: EXTENSIONS_MINIMATCH.Markdown,
		plugins: {
			['markdown']: markdownPlugin,
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
