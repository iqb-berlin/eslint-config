[![npm](https://img.shields.io/npm/v/@iqb/eslint-config.svg?style=flat-square)](https://www.npmjs.com/package/@iqb/eslint-config)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

# @iqb/eslint-config

ESLint rules for TypeScript and JavaScript development, with rules agreed by
IQB developers.

## Installation

```bash
npm install @iqb/eslint-config --save-dev
```

## Available entry points

- `@iqb/eslint-config` (alias of `@iqb/eslint-config/typescript`)
- `@iqb/eslint-config/base`
- `@iqb/eslint-config/typescript`
- `@iqb/eslint-config/javascript`

## Usage

### TypeScript (default alias)

```json
{
  "eslintConfig": {
    "extends": "@iqb/eslint-config"
  }
}
```

### TypeScript (explicit entry point)

```json
{
  "eslintConfig": {
    "extends": "@iqb/eslint-config/typescript"
  }
}
```

### JavaScript

```json
{
  "eslintConfig": {
    "extends": "@iqb/eslint-config/javascript"
  }
}
```

### Optional overlays

For project-specific requirements, define local overrides in your repository:

```json
{
  "eslintConfig": {
    "extends": "@iqb/eslint-config/typescript",
    "rules": {
      "max-len": ["warn", 140]
    }
  }
}
```

## Troubleshooting

In case you are not using *Solution Style tsconfig.json* files (older Angular
versions), add *parserOptions/project* to your package.json and make sure the
path points to your main *tsconfig.json* file.

```json
{
  "eslintConfig": {
    "extends": "@iqb/eslint-config/typescript",
    "parserOptions": {
      "project": "./tsconfig.json"
    }
  }
}
```

## Internal Development

Run smoke tests for both TypeScript and JavaScript fixtures:

```bash
npm test
```
