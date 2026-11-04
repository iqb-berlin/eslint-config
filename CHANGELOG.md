# Changelog

## 3.0.1

- Use the pinned import-x 4.17.1 runtime with a four-line adaptation from the
  removed `makeRe` API to `Minimatch.match`, allowing a fixed minimatch 11.0.4+
  dependency without disabling import rules. Preserve upstream provenance and
  license and verify the runtime against the pinned tarball in CI.
- Cover import/export/require matching, allow/forbid patterns, negation,
  globstar, extglobs, braces, hidden files and restricted-path exceptions.
- Test the patched rule through both profiles in clean installed npm/pnpm
  consumers. Require zero findings at every severity in dependency audits.
- Document five scoped root overrides for other lint dependencies, including
  ESLint 9's legacy eslintrc dependency, and test its CommonJS FlatCompat bridge.

## 3.0.0

Source preparation began on 2026-10-01. Confirm npm availability using the
[release procedure](docs/releasing.md); the source version is not publication evidence.

### Breaking changes

- Use ESM and ESLint Flat Config; migrate `.eslintrc*` and `package.json#eslintConfig` to `eslint.config.mjs`.
- Require ESLint 9 or 10, a matching major of `@eslint/js`, and Node.js 20.19+, 22.13+, or 24+.
- Apply the TypeScript entry points only to `.ts`, `.tsx`, `.mts`, and `.cts` files. Combine them with the JavaScript entry point in mixed repositories.
- Resolve typed projects with `projectService: true`; explicit `project` overrides must turn the service off.
- The default TypeScript entry point uses the richer SonarJS, JSDoc, Perfectionist and Stylistic profiles. Use `/compat` to retain the effective TypeScript rules from 2.2.0.

### Added

- `@iqb/eslint-config/compat`, generated from a versioned snapshot of the legacy TypeScript configuration, with documented successor rules and removed rules.
- Project-reference, alias, compatibility and clean installed-package regression tests.
- CI coverage for ESLint 9/10 on Node.js 20/22/24, dependency audits and an
  aggregate `Validation` check for branch protection.
- A reproducible release procedure and initial master-protection settings.

### Fixed

- Upgrade Stylistic and the other plugins to versions supporting ESLint 10.
- Declare runtime plugins and the TypeScript import resolver as installed dependencies.
- Preserve semicolons in the default TypeScript profile and migrate the arrow-parenthesis override to Stylistic, avoiding conflicting rules.
- Disable `import-x/no-unresolved` and `import-x/named` for TypeScript, which already checks module paths.
- Use the TypeScript JSDoc preset, without requiring redundant JSDoc parameter types.
- Register the installed TypeScript parser by absolute path so import analysis also works without dependency hoisting.
- Select the richer profile's import-analysis TSConfig from each source file, preserving aliases when ESLint and the calling process have different working directories.
- Scope the JavaScript presets to JavaScript files and support `.cjs` configuration files.
- Upgrade the test runner to Mocha 12 and apply scoped security overrides for
  affected dependencies. Consumers must apply their own root overrides;
  import-x still has a moderate upstream minimatch finding. See
  [dependency security](docs/security.md) for the limitation and tested setup.

See [the migration guide](docs/migration.md) before upgrading a consumer project.
