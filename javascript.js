import js from '@eslint/js';
import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin';

export default [
  {
    ...js.configs.recommended,
    files: ['**/*.{js,jsx,mjs,cjs}']
  },
  {
    name: 'iqb/javascript',
    files: ['**/*.{js,jsx,mjs,cjs}'],
    plugins: {
      '@stylistic': stylistic
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } }
    },
    rules: {
      '@stylistic/comma-dangle': ['error', 'never'],
      '@stylistic/arrow-parens': ['error', 'as-needed'],
      '@stylistic/max-len': ['warn', 120],
      '@stylistic/indent': [
        'error', 2,
        {
          SwitchCase: 1,
          FunctionExpression: {
            parameters: 'first'
          }
        }
      ],
      'prefer-destructuring': ['error', {
        VariableDeclarator: {
          array: false,
          object: false
        },
        AssignmentExpression: {
          array: false,
          object: false
        }
      }]
    }
  },
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node
    }
  }
];
