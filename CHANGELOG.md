# Changelog

## 3.0.0 (2026-10-01)

### Breaking changes

- Use ESM and ESLint Flat Config; migrate `.eslintrc*` and `package.json#eslintConfig` to `eslint.config.mjs`.
- Require ESLint 9 or 10, a matching major of `@eslint/js`, and Node.js 20.19+, 22.13+, or 24+.
- Apply the TypeScript entry points only to `.ts`, `.tsx`, `.mts`, and `.cts` files. Combine them with the JavaScript entry point in mixed repositories.
- Resolve typed projects with `projectService: true`; explicit `project` overrides must turn the service off.
- The default TypeScript entry point uses the richer SonarJS, JSDoc, Perfectionist and Stylistic profiles. Use `/compat` to retain the effective TypeScript rules from 2.2.0.

### Added

- `@iqb/eslint-config/compat`, generated from a versioned snapshot of the legacy TypeScript configuration, with documented successor rules and removed rules.
- Project-reference, alias, compatibility and clean installed-package regression tests.
- CI coverage for ESLint 9/10 on Node.js 20/22.

### Fixed

- Upgrade Stylistic and the other plugins to versions supporting ESLint 10.
- Declare runtime plugins and the TypeScript import resolver as installed dependencies.
- Preserve semicolons in the default TypeScript profile and migrate the arrow-parenthesis override to Stylistic, avoiding conflicting rules.
- Disable `import-x/no-unresolved` and `import-x/named` for TypeScript, which already checks module paths.
- Use the TypeScript JSDoc preset, without requiring redundant JSDoc parameter types.
- Register the installed TypeScript parser by absolute path so import analysis also works without dependency hoisting.
- Select the richer profile's import-analysis TSConfig from each source file, preserving aliases when ESLint and the calling process have different working directories.
- Scope the JavaScript presets to JavaScript files and support `.cjs` configuration files.

See [the migration guide](docs/migration.md) before upgrading a consumer project.
