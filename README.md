# @iqb/eslint-config

ESLint rules for TypeScript and JavaScript development, with rules agreed by IQB developers. Optimized for ESLint 9 (Flat Config) and ESM.

## Features

- **Flat Config Support**: Native support for the new ESLint configuration format.
- **TypeScript & JavaScript**: First-class support for both.
- **SonarJS Integration**: Advanced code quality and bug detection.
- **JSDoc Linting**: Ensuring well-documented APIs.
- **Perfectionist**: Consistent sorting and organization of code.
- **ESM Native**: Fast and compatible with modern tools.

## Installation

Run on command line:
```bash
npm install @iqb/eslint-config --save-dev
```

## Usage (ESLint 9+)

ESLint 9 uses the new "Flat Config" format. Create an `eslint.config.js` in your project root. Since this package is ESM-based, your `eslint.config.js` should also use ESM (`import`/`export`).

### TypeScript

```javascript
import iqbConfig from '@iqb/eslint-config';

export default [
  ...iqbConfig,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json', // Required for type-aware rules
        tsconfigRootDir: import.meta.dirname,
      },
    },
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

## Internal Development

### Run Linting
```bash
npm run lint
```

### Run Tests
```bash
npm run test
```

## Troubleshooting

In case you are not using *Solution Style tsconfig.json* files, make sure the `project` path in `parserOptions` points to your main `tsconfig.json` file.
For ESM environments, use `import.meta.dirname` instead of `__dirname`.
