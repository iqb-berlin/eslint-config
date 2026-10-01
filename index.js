import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import sonarjs from 'eslint-plugin-sonarjs';
import jsdoc from 'eslint-plugin-jsdoc';
import perfectionist from 'eslint-plugin-perfectionist';
import stylistic from '@stylistic/eslint-plugin';
import importX from 'eslint-plugin-import-x';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';

export default tseslint.config(
  {
    name: 'iqb/typescript',
    files: ['**/*.{ts,tsx,mts,cts}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      sonarjs.configs.recommended,
      jsdoc.configs['flat/recommended-typescript'],
      perfectionist.configs['recommended-natural'],
      stylistic.configs.recommended,
      importX.flatConfigs.recommended,
      importX.flatConfigs.typescript,
      {
        plugins: {
          'import-x': importX
        },
        settings: {
          'import-x/resolver-next': [createTypeScriptImportResolver()]
        },
        languageOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
          globals: {
            ...globals.browser,
            ...globals.es2021
          },
          parserOptions: {
            projectService: true
          }
        },
        rules: {
          '@stylistic/comma-dangle': ['error', 'never'],
          '@stylistic/semi': ['error', 'always'],
          // TypeScript checks module names and paths, including workspace aliases.
          'import-x/no-unresolved': 'off',
          'import-x/named': 'off',
          'import-x/prefer-default-export': 'off',
          'import-x/no-extraneous-dependencies': ['error', { devDependencies: true }],
          '@stylistic/lines-between-class-members': [
            'error', 'always',
            {
              exceptAfterSingleLine: true
            }
          ],
          '@stylistic/operator-linebreak': [2, 'after'],
          '@stylistic/indent': [
            'error', 2,
            {
              SwitchCase: 1,
              FunctionExpression: {
                parameters: 'first'
              }
            }
          ],
          '@stylistic/arrow-parens': ['error', 'as-needed'],
          '@stylistic/max-len': ['warn', 120],
          '@typescript-eslint/no-inferrable-types': 'off',
          'no-underscore-dangle': ['error', { allowAfterThis: true }],
          'prefer-destructuring': ['off'],
          '@typescript-eslint/no-unused-expressions': [2, { allowTernary: true }],
          'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
          'no-param-reassign': ['error', { props: false }],
          '@typescript-eslint/explicit-member-accessibility': [
            'error',
            {
              accessibility: 'no-public',
              overrides: {
                accessors: 'no-public',
                constructors: 'no-public',
                methods: 'no-public',
                properties: 'no-public',
                parameterProperties: 'no-public'
              }
            }
          ],
          'no-use-before-define': ['off'],
          '@typescript-eslint/no-use-before-define': ['off'],
          'object-shorthand': ['off'],
          '@stylistic/function-paren-newline': ['off'],
          'sonarjs/no-duplicate-string': 'off'
        }
      }
    ]
  }
);
