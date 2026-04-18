module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'airbnb-base',
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    'comma-dangle': ['error', 'never'],
    'arrow-parens': ['error', 'as-needed'],
    'max-len': ['warn', 120],
    'operator-linebreak': [2, 'after'],
    'no-underscore-dangle': ['error', { allowAfterThis: true }],
    'prefer-destructuring': ['off'],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-param-reassign': ['error', { props: false }],
    'object-shorthand': ['off'],
    'function-paren-newline': ['off']
  }
};
