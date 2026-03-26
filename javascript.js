import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021
      },
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      'comma-dangle': ['error', 'never'],
      'arrow-parens': ['error', 'as-needed'],
      'max-len': ['warn', 120],
      indent: [
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
  }
];
