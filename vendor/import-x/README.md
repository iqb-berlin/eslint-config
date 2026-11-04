# Pinned import-x runtime

This directory contains the published CommonJS runtime bundle of
`eslint-plugin-import-x` 4.17.1, with four changed lines in
`no-internal-modules`. The surrounding rule implementation and all other rules
come from the pinned upstream artifact. The MIT license is retained in LICENSE.

Upstream: https://github.com/un-ts/eslint-plugin-import-x/tree/v4.17.1

The plugin still imports minimatch's removed `makeRe` API. The patch creates
`Minimatch` objects and calls their supported `match` method. Empty and comment
patterns are filtered, retaining the old rule's treatment of patterns whose
`makeRe` returned false. Existing allow/forbid options and rule names remain.

All runtime dependencies are declared directly in the config package, including
`minimatch` 11.0.4+. The unmodified npm plugin is not a runtime dependency.
The local package metadata identifies this patched runtime as `4.17.1-iqb.1`.

Regenerate or verify byte-for-byte with:

```sh
npm run vendor:import-x
npm run vendor:check
```

The generator verifies the exact npm tarball SHA-512 before extracting the
bundle, metadata and license. It applies each replacement exactly once and
records original and patched bundle SHA-256 values in source.json. CI verifies
these files against the pinned tarball and checks the direct dependency ranges.
No source generation or package installation scripts run in consumer projects.

The matching regression tests cover import/export/require, globstar, braces,
extglobs, negation, path normalization, hidden files, scoped packages, empty
patterns and restricted-path exceptions. Installed npm/pnpm tests also execute
the patched rule through both exported TypeScript profiles.

Once an upstream release supports minimatch 11, replace this runtime with the
regular dependency, restore the three import locations, remove this directory
and its generator, and retain the regression tests for the upstream runtime.
