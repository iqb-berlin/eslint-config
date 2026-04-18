# @iqb/eslint-config

ESLint rules for TypeScript and JavaScript development, with rules agreed by IQB developers. Optimized for ESLint Flat Config (ESLint 9 and 10) and ESM.

## Installation

```bash
npm install @iqb/eslint-config --save-dev
```

## Usage (ESLint 9+ / 10+)

Create an `eslint.config.js` in your project root. This package is ESM-based, so your ESLint config should also use ESM (`import`/`export`).

### TypeScript

```javascript
import iqbConfig from '@iqb/eslint-config';

export default [
  ...iqbConfig,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname
      },
    }
  },
  {
    rules: {
      // Your project-specific overrides
    }
  }
];
```

### JavaScript

```javascript
import iqbJavaScriptConfig from '@iqb/eslint-config/javascript';

export default [
  ...iqbJavaScriptConfig,
  {
    rules: {
      // Your project-specific overrides
    }
  }
];
```

## Migration from legacy `.eslintrc*`

This package no longer supports legacy `extends` usage in `package.json` for new setups.

Old (legacy):

```json
{
  "eslintConfig": {
    "extends": "@iqb/eslint-config"
  }
}
```

New (flat config):

```javascript
import iqbConfig from '@iqb/eslint-config';

export default [...iqbConfig];
```

## Compatibility

- ESLint: `^9.0.0 || ^10.0.0`
- `@eslint/js`: `^9.0.0 || ^10.0.0`
- `typescript-eslint`: `^8.0.0`
