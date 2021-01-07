module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'airbnb-base'
  ],
  parserOptions: {
    ecmaVersion: 12,
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
};
