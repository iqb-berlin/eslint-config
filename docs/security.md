# Dependency security

Run `npm ci` and `npm run audit` in this repository. The audit prints all
findings and fails on any vulnerability severity. CI uses the same threshold
for every supported Node.js / ESLint combination and for clean npm/pnpm
consumers with the documented root overrides.

## Import-x and minimatch

Version 3.0.1 uses the npm package `eslint-plugin-import-x@4.18.1` directly.
The upstream `no-internal-modules` rule supports minimatch 11, which fixes
[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)
starting at 11.0.1. Import-x also accepts minimatch 9 and 10, so verify the
resolved version in existing lockfiles.

The audited consumer installs use current ESLint releases in majors 9 and 10
(9.39.5 and 10.15.0 at the time of testing) and typescript-eslint 8.73.0 or
newer within major 8. ESLint 9 uses a patched minimatch 3 release. The
documented consumer override scopes minimatch 11 to SonarJS. Mocha's
development-only overrides apply in this repository.

## Consumer repositories

npm reads `overrides` from the consuming root `package.json`. See
[npm's override documentation](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#overrides).

For npm, merge [consumer-overrides.json](consumer-overrides.json) into the
consumer's existing root `overrides` object. Preserve unrelated project
overrides, run `npm install`, commit the lockfile, and run the complete consumer
lint and tests. Audit with `npm audit --audit-level=low`.

For pnpm 10/11, merge this selector into `pnpm-workspace.yaml`:

```yaml
overrides:
  'eslint-plugin-sonarjs>minimatch': '^11.0.4'
```

Run `pnpm install`, commit the lockfile, run the complete consumer lint and
tests, and audit with `pnpm audit --audit-level=low`.

When upgrading an existing project, update ESLint within its major and refresh
the affected lockfile entries. Use `npm ls minimatch --all` or
`pnpm why minimatch` to identify the parent of each remaining finding. If
import-x still resolves to minimatch 9 or 10, refresh that resolution or use an
additional root override scoped to `eslint-plugin-import-x` (pnpm selector
`'eslint-plugin-import-x>minimatch'`) with `^11.0.4`. Repeat the audit and
lint checks on the updated lockfile.

`APPLY_SECURITY_OVERRIDES=1 npm run test:package` tests and audits a clean
consumer with the SonarJS override. Use `PACKAGE_MANAGER=pnpm` for a non-hoisted
pnpm check. The expected audit result is zero findings for these clean consumer
trees. Existing applications may contain additional unrelated dependencies
that require separate remediation. Without `APPLY_SECURITY_OVERRIDES`, the
script tests an ordinary install without changing its dependency policy.

For ESLint 9 projects using `FlatCompat`, keep the minimatch version declared
by the current `@eslint/eslintrc` release. If the project previously added an
override forcing that package to minimatch 11, remove it and test the legacy
configuration on the refreshed lockfile.
