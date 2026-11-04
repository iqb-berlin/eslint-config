# Releasing and repository protection

## Prerequisites

- A clean checkout of the exact reviewed commit on `master`.
- All six Node.js 20/22/24 and ESLint 9/10 CI jobs and the `Validation` check pass.
- Review the dependency audit and the documented remaining upstream finding in
  [security.md](security.md). The audit threshold is high, not zero findings.
- An npm maintainer account for `@iqb/eslint-config`; verify with `npm whoami`.
- GitHub write permission for tags/releases; admin permission for branch protection.

## Publish the tested package

1. Run `npm ci`, `npm run lint`, `npm test` and `npm run audit`.
2. Run `APPLY_SECURITY_OVERRIDES=1 ESLINT_VERSION=9 npm run test:package` and
   repeat with `ESLINT_VERSION=10`.
3. Run `APPLY_SECURITY_OVERRIDES=1 PACKAGE_MANAGER=pnpm ESLINT_VERSION=10 npm run test:package`.
4. Run `npm publish --dry-run` and inspect the package contents. Confirm that
   runtime files, licenses and documentation are present and fixtures and
   development scripts are absent.
5. Confirm that `npm view @iqb/eslint-config@3.0.0 version` returns E404 before
   the first release. Never attempt to overwrite an existing published version.
6. Pack once with `npm pack --pack-destination /tmp` and publish that exact
   tarball using `npm publish /tmp/iqb-eslint-config-3.0.0.tgz --access public`.
   Complete npm's interactive authentication when requested.
7. Verify `npm view @iqb/eslint-config@3.0.0 version dist.integrity` and
   `npm view @iqb/eslint-config dist-tags --json`. Compare registry integrity
   with the packed tarball's integrity from `npm pack --json`.
8. Create tag `v3.0.0` at the tested commit and a GitHub release containing the
   major-version migration notes and the remaining security limitation.
9. Record the commit, CI run, registry verification and remaining external
   setup in the release report. A prepared package or GitHub tag alone does
   not establish npm availability.

## Protect master

An administrator must apply this after the `Validation` check has appeared on
the branch. Read any existing branch protection/rulesets first and preserve
newer repository policy. For the initial setup:

```sh
gh api --method PUT repos/iqb-berlin/eslint-config/branches/master/protection \
  --input .github/master-protection.json
gh api repos/iqb-berlin/eslint-config/branches/master/protection
```

The supplied settings require the aggregate CI check, an up-to-date branch,
one approval and resolved conversations, also for administrators. Force pushes
and branch deletion are disabled. Existing issue acceptance and closure remain
separate from merging pull requests.

The aggregate `Validation` job fails if any matrix job fails or is cancelled,
so adding another supported runtime does not require renaming protected checks.
