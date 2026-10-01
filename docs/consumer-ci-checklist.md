# CI Checklist for Consumer Repositories

Diese Checkliste hilft Teams, `@iqb/eslint-config` stabil und einheitlich in Anwendungen zu nutzen.

## 1. Paketinstallation

```bash
npm install --save-dev @iqb/eslint-config
```

## 2. ESLint Flat Config anlegen

TypeScript (`eslint.config.mjs`; use `/compat` first in existing projects):

```js
import iqbConfig from '@iqb/eslint-config/compat';

export default [
  ...iqbConfig,
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname
      }
    }
  }
];
```

JavaScript (`eslint.config.mjs`):

```js
import iqbJavaScriptConfig from '@iqb/eslint-config/javascript';

export default [...iqbJavaScriptConfig];
```

## 3. NPM Scripts vereinheitlichen

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "ci:lint": "npm run lint"
  }
}
```

## 4. GitHub Actions einbinden

```yaml
name: Lint

on:
  pull_request:
  push:
    branches: [main, master]

jobs:
  lint:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        node-version: [20.x, 22.x]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm install
      - run: npm run ci:lint
```

## 5. Pre-Commit (empfohlen)

`lint-staged` + `husky` fuer schnelles lokales Feedback:

```json
{
  "lint-staged": {
    "*.{js,cjs,mjs,ts,tsx}": "eslint --fix"
  }
}
```

## 6. Rollout in bestehenden Projekten

- Erst einmalig `npm run lint -- --fix` ausfuehren
- Restliche Verstosse gezielt bereinigen
- Falls noetig temporaer einzelne Regeln als `warn` konfigurieren
- Lokale Sonderregeln mit Begruendung dokumentieren

## 7. Upgrade-Prozess

- Neue `@iqb/eslint-config` Version in einer technischen PR anheben
- Werkzeug-Upgrade mit `/compat` und Wechsel zum umfangreicheren Regelsatz getrennt pruefen
- [Migrationsanleitung](migration.md) und Node-/ESLint-Voraussetzungen beachten
- Changelog/Migrationshinweise pruefen
- CI + lokale Lint-Checks pruefen
- Bei Abweichungen Rule-Change-Issue im Config-Repo anlegen
