# Dependency security

Run `npm ci` and `npm run audit` in this repository. The audit prints all
findings and fails on high or critical findings. The same check runs for every
supported Node.js / ESLint combination in CI.

## Remediation on 2026-11-04

- Upgrade the development test runner to Mocha 12, removing its old `diff` and
  `serialize-javascript` dependencies.
- Require `glob` 14.0.3+, `serialize-javascript` 7.1.4+ and `minimatch` 11.0.4+
  in the affected development dependency paths using scoped root overrides.
- Override `minimatch` for ESLint, `@eslint/config-array`,
  `@typescript-eslint/typescript-estree` and SonarJS. These paths are exercised
  by the lint, unit and installed-consumer tests on ESLint 9 and 10.

These overrides cross dependency major versions. They are intentionally scoped
to the tested parents instead of changing every `minimatch` in a consumer's
dependency tree. Recheck compatibility before changing their scope or versions.

## Remaining upstream finding

`eslint-plugin-import-x` 4.17.1 still requires `minimatch` 10, affected by
[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).
The advisory describes pattern amplification with attacker-controlled glob
patterns and `optimizationLevel >= 2`. This package's import rules use
repository-controlled configuration; no exploit was demonstrated in these
checks. This is a remaining moderate finding, not a completed security fix.

Overriding this dependency with `minimatch` 11 breaks loading the plugin:
its `no-internal-modules` rule imports `makeRe`, removed in version 11.
Disabling the rule does not repair the ESM import. Keep the compatible version
until import-x supports the new API or a compatible patched minimatch is
available, then remove this exception and rerun all consumer checks.

The audit can report both `minimatch` and its affected parent import-x for this
one advisory. Do not interpret those entries as independent vulnerabilities.

## Consumer repositories

npm uses `overrides` only from the consuming root `package.json`; the overrides
of an installed config package are **not inherited**. A clean consumer without
the following overrides can still install other affected minimatch versions.
See [npm's override documentation](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#overrides).

For npm, merge [consumer-overrides.json](consumer-overrides.json) into the
consumer's existing root `overrides` object. Preserve unrelated project
overrides. Run `npm install`, commit the updated lockfile, then run the complete
consumer lint and tests. Audit with `npm audit --audit-level=high` and review
the remaining moderate import-x finding above.

For pnpm 10/11, merge these selectors into `pnpm-workspace.yaml`:

```yaml
overrides:
  'eslint>minimatch': '^11.0.4'
  '@eslint/config-array>minimatch': '^11.0.4'
  '@typescript-eslint/typescript-estree>minimatch': '^11.0.4'
  'eslint-plugin-sonarjs>minimatch': '^11.0.4'
```

Run `pnpm install`, commit the updated lockfile, run the complete consumer lint
and tests, and audit with `pnpm audit --audit-level=high`.

`APPLY_SECURITY_OVERRIDES=1 npm run test:package` tests an isolated consumer
with these root overrides and audits its installed dependencies. Use
`PACKAGE_MANAGER=pnpm` for the non-hoisted pnpm check. Without
`APPLY_SECURITY_OVERRIDES`, the script continues to test an ordinary install
without modifying the consumer's dependency policy.
