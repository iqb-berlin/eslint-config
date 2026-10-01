# @iqb/eslint-config

ESLint rules for TypeScript and JavaScript development, with rules agreed by IQB developers. Uses ESLint 9/10 Flat Config and ESM.

This branch prepares the unreleased 3.0.0 major version. See the
[migration guide](docs/migration.md) and [changelog](CHANGELOG.md) before upgrading.

## Features

- **Flat Config Support**: Native support for the new ESLint configuration format.
- **TypeScript & JavaScript**: First-class support for both.
- **SonarJS Integration**: Advanced code quality and bug detection.
- **JSDoc Linting**: Ensuring well-documented APIs.
- **Perfectionist**: Consistent sorting and organization of code.
- **ESM Native**: Fast and compatible with modern tools.
- **Compatibility profile**: Upgrade an existing TypeScript project without adopting the richer profile's new style rules.

## Installation

Requires Node.js `^20.19.0 || ^22.13.0 || >=24.0.0`. After 3.0.0 is published:
```bash
npm install --save-dev @iqb/eslint-config@^3 eslint@^10 @eslint/js@^10 typescript@~5.9.3
```

For ESLint 9, use `eslint@^9` and `@eslint/js@^9` together. The package installs
its parsers, plugins and import resolver as runtime dependencies.

## Choose a profile

| Import | Purpose |
| --- | --- |
| `@iqb/eslint-config/compat` | Effective TypeScript rules from 2.2.0 on the modern tools; recommended first step for existing repositories |
| `@iqb/eslint-config` | Richer TypeScript profile with SonarJS, JSDoc, Perfectionist and Stylistic presets |
| `@iqb/eslint-config/javascript` | JavaScript rules; combine with either TypeScript profile in a mixed repository |

The TypeScript profiles apply only to `.ts`, `.tsx`, `.mts` and `.cts` files.
Use one TypeScript profile at a time. `/compat` preserves the old TypeScript
rules, including semicolons and arrow parentheses; it does not support the old
`.eslintrc` format or mirror the old Airbnb JavaScript profile.

## Usage (ESLint 9/10)

Create `eslint.config.mjs` in your project root. This also works in a CommonJS
project without changing its `package.json#type`.

### TypeScript

```javascript
import iqbConfig from '@iqb/eslint-config/compat';

export default [
  ...iqbConfig,
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    rules: {
      // Your project-specific overrides
    }
  }
];
```

Both TypeScript profiles use `projectService: true`, which follows the nearest
TSConfig and its project references. To choose the richer profile, change the
import to `@iqb/eslint-config`. Review that change separately from the tools upgrade.

### JavaScript

```javascript
import iqbJavaScriptConfig from '@iqb/eslint-config/javascript';

export default [
  ...iqbJavaScriptConfig,
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
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

### Test the installed package

```bash
ESLINT_VERSION=9 npm run test:package
ESLINT_VERSION=10 npm run test:package
```

These checks pack the package, install it in a clean temporary consumer and
lint TypeScript project references, path aliases, ESM and CommonJS. CI runs the
unit tests and these consumer checks with both ESLint majors on Node.js 20/22.

The legacy snapshot and rule mappings can be regenerated with
`npm run capture:legacy` and `npm run generate:compat`; see the migration guide
for their provenance and the documented adaptations.

## Governance und Teamarbeit

- Lint-Governance und Entscheidungsregeln:
  - [`docs/lint-policy.md`](docs/lint-policy.md)
- CI-Checkliste fuer Consumer-Repositories:
  - [`docs/consumer-ci-checklist.md`](docs/consumer-ci-checklist.md)
- Vorlage fuer Regel-Aenderungsantraege:
  - [`.github/ISSUE_TEMPLATE/rule-change.yml`](.github/ISSUE_TEMPLATE/rule-change.yml)

## Troubleshooting

Source files must belong to a TypeScript project. Files outside the TSConfigs
need an explicit override or inclusion in a TSConfig. If you intentionally use
an explicit `parserOptions.project`, also set `projectService: false`; enabling
both is unsupported. See [the migration guide](docs/migration.md) for examples.
