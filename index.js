module.exports = {
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "airbnb-base",
    "airbnb-typescript/base",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "rules": {
    "@typescript-eslint/comma-dangle": ["error", "never"],
    "import/prefer-default-export": "off",
    "import/no-extraneous-dependencies": ["error", {"devDependencies": true}],
    "@typescript-eslint/lines-between-class-members": [
      "error", "always",
      {
        "exceptAfterSingleLine": true
      }
    ],
    "operator-linebreak": [2, "after"],
    "@typescript-eslint/indent": [
      "error", 2,
      {
        "SwitchCase": 1,
        "FunctionExpression": {
          "parameters": "first"
        }
      }
    ],
    "arrow-parens": ["error", "as-needed"],
    "max-len": ["warn", 120],
    "@typescript-eslint/no-inferrable-types": "off",
    "no-underscore-dangle": ["error", {"allowAfterThis": true}],
    "prefer-destructuring": ["off"],
    "@typescript-eslint/no-unused-expressions": [2, {"allowTernary": true}],
    "no-plusplus": ["error", {"allowForLoopAfterthoughts": true}],
    "no-param-reassign": ["error", {"props": false}],
    "@typescript-eslint/explicit-member-accessibility": [
      "error",
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
    "no-use-before-define": ["off"],
    "@typescript-eslint/no-use-before-define": ["off"],
    "object-shorthand": ["off"]
  }
};
