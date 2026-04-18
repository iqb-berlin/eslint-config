import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import sonarjs from 'eslint-plugin-sonarjs';
import jsdoc from 'eslint-plugin-jsdoc';
import perfectionist from 'eslint-plugin-perfectionist';
import stylistic from '@stylistic/eslint-plugin';
import importX from 'eslint-plugin-import-x';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  sonarjs.configs.recommended,
  jsdoc.configs['flat/recommended'],
  perfectionist.configs['recommended-natural'],
  stylistic.configs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  {
    plugins: {
      'import-x': importX
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: true
      }
    },
    rules: {
      '@stylistic/comma-dangle': ['error', 'never'],
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
      'arrow-parens': ['error', 'as-needed'],
      'max-len': ['warn', 120],
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
      'function-paren-newline': ['off'],
      'sonarjs/no-duplicate-string': 'off'
    }
  }
);
