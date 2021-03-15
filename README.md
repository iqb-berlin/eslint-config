[![npm](https://img.shields.io/npm/v/@iqb/eslint-config.svg?style=flat-square)](https://www.npmjs.com/package/@iqb/eslint-config)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

# eslint-config

ESLint rules for typescript and javascript development, with rules agreed by
IQB developers.

## Installation

Run on command line:
```
npm install @iqb/eslint-config --save-dev
```

Put the following lines in your package.json, depending on whether you use Typescript or Javascript.
#### Typescript
```
"eslintConfig": {
  "extends": "@iqb/eslint-config"
},
```
#### Javascript
```
"eslintConfig": {
  "extends": "@iqb/eslint-config/javascript"
},
```


## Troubleshooting

In case you are not using *Solution Style tsconfig.json* files (older Angular versions do this; when you
have a tsconfig.base.json in your project root, you are using solution style), add *parserOptions/project*
to your package.json and make sure the path points to your main *tsconfig.json* file.

```
"eslintConfig": {
  "extends": "@iqb/eslint-config",
  "parserOptions": {
    "project": "./tsconfig.json"
  }
},
```
