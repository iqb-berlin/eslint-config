# eslint-config

ESLint rules for typescript and javascript development, with rules agreed by
IQB developers.

## Installation (Typescript)

Put the following lines in your package.json.

```
"eslintConfig": {
  "extends": "@iqb/eslint-config"
},
```
Run on command line:
```
npm install @iqb/eslint-config --save-dev
```

## Troubleshooting

In case you are not using *Solution Style tsconfig.json* files (older Angular versions do this), add *parserOptions/project* to your package.json and make sure the path points to your main *tsconfig.json* file.

```
"eslintConfig": {
  "extends": "@iqb/eslint-config",
  "parserOptions": {
    "project": "./tsconfig.json"
  }
},
```
