# Dependency security

Run `npm ci` and `npm run audit` in this repository. The audit prints all
findings and fails on any vulnerability severity. CI uses the same threshold
for every supported Node.js / ESLint combination and for clean npm/pnpm
consumers with the documented root overrides.

## Import-x correction in 3.0.1

The upstream import-x 4.17.1 plugin depends on minimatch 9/10, affected by
[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).
Forcing minimatch 11 into the unmodified plugin breaks its `makeRe` import.
Version 3.0.0 therefore documented a remaining moderate finding.

Version 3.0.1 uses a pinned copy of the published plugin runtime with a
four-line correction in `no-internal-modules`: precompiled regular expressions
are replaced with minimatch 11's supported `Minimatch.match` API. Empty and
comment patterns retain their old treatment. All other plugin rules and their
configuration are retained. The unmodified plugin is no longer a dependency.

The runtime uses a directly declared minimatch 11.0.4+ dependency, including
when the config is installed by a consumer. No consumer install hook patches
node_modules. Source hashes, the original MIT license and the regeneration
procedure are retained in [the pinned runtime](../vendor/import-x/README.md).
`npm run vendor:check` verifies the exact upstream tarball and the four-line
patch in CI. Regression and installed-package tests exercise the patched rule,
as well as alias resolution, cycles and duplicate imports.

## Other dependency overrides

The development test runner is Mocha 12. Scoped root overrides select
`glob` 14.0.3+, `serialize-javascript` 7.1.4+ and minimatch 11.0.4+ in the
affected test-tool paths. ESLint, `@eslint/config-array`,
`@typescript-eslint/typescript-estree` and SonarJS also use scoped minimatch
overrides until their declared dependency ranges include the fixed major.

These overrides cross dependency major versions. They are intentionally scoped
to tested parents instead of changing every minimatch in a consumer tree.
Recheck compatibility before changing their scope or versions.

## Consumer repositories

npm uses `overrides` only from the consuming root `package.json`; overrides of
an installed config package are **not inherited**. The pinned import plugin
itself uses the fixed minimatch directly, but other lint dependencies still
need the following root overrides. See [npm's override documentation](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#overrides).

For npm, merge [consumer-overrides.json](consumer-overrides.json) into the
consumer's existing root `overrides` object. Preserve unrelated project
overrides, run `npm install`, commit the lockfile, and run the complete consumer
lint and tests. Audit with `npm audit --audit-level=low`.

For pnpm 10/11, merge these selectors into `pnpm-workspace.yaml`:

```yaml
overrides:
  'eslint>minimatch': '^11.0.4'
  '@eslint/config-array>minimatch': '^11.0.4'
  '@typescript-eslint/typescript-estree>minimatch': '^11.0.4'
  'eslint-plugin-sonarjs>minimatch': '^11.0.4'
```

Run `pnpm install`, commit the lockfile, run the complete consumer lint and
tests, and audit with `pnpm audit --audit-level=low`.

`APPLY_SECURITY_OVERRIDES=1 npm run test:package` tests and audits a clean
consumer with these root overrides. Use `PACKAGE_MANAGER=pnpm` for a non-hoisted
pnpm check. The expected audit result is zero findings for these clean consumer
trees. Existing applications may contain additional unrelated dependencies
that require separate remediation. Without `APPLY_SECURITY_OVERRIDES`, the
script tests an ordinary install without changing its dependency policy.
