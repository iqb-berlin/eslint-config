module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "airbnb-typescript/base",
        "plugin:@typescript-eslint/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 12,
        "sourceType": "module",
        "project": "./tsconfig.base.json"
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
      "no-plusplus": ["error",
        {
          "allowForLoopAfterthoughts": true
        }
      ],
      "arrow-parens": ["error", "as-needed"],
      "max-len": ["warn", 120],
      "@typescript-eslint/no-inferrable-types": "off",
      "no-underscore-dangle": ["error", {"allowAfterThis": true}],
      "prefer-destructuring": ["off"],
      "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
      "@typescript-eslint/no-unused-expressions": [2, {"allowTernary": true}],
      "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }]
    }
};
