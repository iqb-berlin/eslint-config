# Migration from 2.2.0 to 3.0.0

Version 3.0.0 is prepared for release. Publishing remains a separate maintainer step.

## Choose the TypeScript profile

Use `@iqb/eslint-config/compat` for an existing project whose immediate goal is
updating the tools while retaining its TypeScript rules. The default
`@iqb/eslint-config` export retains the richer profile introduced by the Flat
Config migration: SonarJS, JSDoc, Perfectionist, Stylistic and import-x presets.
Changing from `/compat` to the default is a separate style and quality rollout.

`/compat` preserves the TypeScript rules, rather than the legacy configuration
format. It is also Flat Config. It has no automatic expiration; retiring it
requires a deliberate major-version migration decision under the lint policy.
There is no compatibility export for the old Airbnb JavaScript profile.

## Upgrade the tools

Use Node.js `^20.19.0 || ^22.13.0 || >=24.0.0`. Install matching ESLint and
`@eslint/js` majors, for example after 3.0.0 is published:

```sh
npm install --save-dev @iqb/eslint-config@^3 eslint@^10 @eslint/js@^10 typescript@~5.9.3
```

ESLint 9 also works; replace both `@^10` ranges with `@^9`. The declared TypeScript
range follows typescript-eslint 8; the consumer regression tests use 5.9.3.
The package installs its parsers, plugins and import resolver automatically.

## Replace the legacy configuration

Remove the old `.eslintrc*` or `package.json#eslintConfig` settings and create
`eslint.config.mjs`. This filename also works in projects that use CommonJS:

```js
import compat from '@iqb/eslint-config/compat';
import javascript from '@iqb/eslint-config/javascript';

export default [
  { ignores: ['dist/**', 'coverage/**', '.nx/**'] },
  ...javascript,
  ...compat,
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname }
    }
  }
];
```

Carry over each project's old ignores, globals and rule overrides explicitly.
Update inline `eslint-disable` comments to use the successor rule names in the
mapping below, and review unused-disable warnings after changing profiles.
Flat Config does not read `.eslintignore`, and its ignores use different glob
semantics. Apply TypeScript rule overrides only to the TypeScript file patterns.

The service follows the nearest `tsconfig.json` and its project references,
including solution-style Nx configurations. Source files must still belong to
a configured TypeScript project. Files outside those projects need an explicit
override or inclusion in a TSConfig; do not broadly route them through the
default project service. See the upstream
[project-service documentation](https://typescript-eslint.io/packages/parser/#projectservice).

If a project intentionally uses `tsconfig.eslint.json`, override both options:

```js
{
  files: ['**/*.{ts,tsx,mts,cts}'],
  languageOptions: {
    parserOptions: {
      projectService: false,
      project: './tsconfig.eslint.json',
      tsconfigRootDir: import.meta.dirname
    }
  }
}
```

TypeScript checks module names and aliases, so `import-x/no-unresolved` and
`import-x/named` are off in both TypeScript profiles. Keep a separate TypeScript
typecheck/build in CI. `/compat` retains the old Node-style import resolution;
the richer profile uses the installed TypeScript resolver for additional
alias-aware import analysis, following the source file's nearest `tsconfig.json`
and its references even when ESLint's working directory differs from the
calling process. To select a custom import-analysis TSConfig, override
`import-x/resolver-next` with your own TypeScript resolver. That analysis can
reveal duplicate imports the older resolver did not see and should be reviewed
as part of the richer-profile rollout.

## Compatibility provenance and adaptations

The approach was proposed by studio-lite in
[issue #10](https://github.com/iqb-berlin/eslint-config/issues/10#issuecomment-5833927654).
Its rule file was used as a reference, then checked against an independently
captured effective configuration of the published `@iqb/eslint-config` 2.2.0.

`tests/fixtures/legacy/rules.json` records the exact top-level dependency versions
and the resulting active rule settings. Capture and regenerate them with:

```sh
npm run capture:legacy
npm run generate:compat
npm test
```

The capture uses a temporary installation of ESLint 8 and TypeScript 5.5.4;
these dependencies are not installed by consumers and are not part of the
modern runtime. The captured snapshot contains 234 active settings. Migration
produces 227 rules after five removals and two duplicate-rule consolidations.
Counts depend on the captured dependency versions and are not an equivalence
guarantee by themselves.

| Legacy setting | Compatibility setting |
| --- | --- |
| Formatting rules in ESLint or typescript-eslint | Corresponding Stylistic rule, retaining options |
| `@typescript-eslint/func-call-spacing` | `@stylistic/function-call-spacing` |
| `import/*` | `import-x/*`, retaining options |
| `no-new-object` | `no-object-constructor` |
| `@typescript-eslint/no-throw-literal` | `@typescript-eslint/only-throw-error`, with rethrow exemptions disabled to retain the older behavior |
| `@typescript-eslint/ban-types` | `@typescript-eslint/no-restricted-types`, with the old banned types, fixes and suggestions explicitly configured |
| `no-spaced-func` | Consolidated into the existing function-call-spacing setting |
| Core and TypeScript `no-extra-semi` | One Stylistic setting with the same severity |
| `global-require`, `no-buffer-constructor`, `no-new-require`, `no-path-concat`, `lines-around-directive` | Removed; no longer available in modern ESLint |

Two obsolete options are omitted because the successor schemas reject them:
`import/no-cycle.disableScc: false` and
`object-property-newline.allowMultiplePropertiesPerLine: false`. The remaining
options retain their captured values. Future changes to `/compat` should be
reviewed against this baseline, rather than importing new recommended presets.

Both TypeScript profiles register the parser by its absolute installed path,
resolved through the `typescript-eslint` dependency. This preserves the parser
selection without requiring transitive dependencies to be hoisted or installed
again in the consumer.

Upstream rule implementations and their implicit defaults can still change
between tool versions; the compatibility profile is not a promise of identical
findings on every input. For example, Stylistic fixes some indentation cases
missed by the old TypeScript indentation rule. Run the complete project lint
before merging a consumer upgrade and review autofixes.

## Validation before rollout

Run the project lint, typecheck and its usual tests. Adopt the compatibility
profile in a tools-only upgrade first. Evaluate switching to the richer profile
in a separate change, with a reviewed rule diff and a consumer canary, following
[the lint policy](lint-policy.md).

The package tests cover solution-style project references, path aliases,
semicolons, arrow parentheses, object order and actual type-aware violations.
`npm run test:package` packs and installs the package into a clean temporary
consumer and lints TypeScript, ESM JavaScript and CommonJS there. Set
`ESLINT_VERSION=9` or `ESLINT_VERSION=10` to choose the consumer tool version.
With pnpm installed, set `PACKAGE_MANAGER=pnpm` to test without dependency
hoisting. These checks assert real cycle/duplicate-import findings and run
ESLint from outside the consumer directory; absence of unresolved-import
warnings alone is not evidence that alias resolution works.

### studio-lite canary

The candidate was tested against 1,047 TypeScript files in studio-lite at
commit `f81f90203954af070ddf87245c8d46066fb11660`, without changing source files.
The existing local profile reported no errors and 65 line-length warnings.

With `/compat` and project service, `apps/api/jest.setup.esm.ts` needs a scoped
override because it is outside the referenced projects:

```js
{
  files: ['apps/api/jest.setup.esm.ts'],
  languageOptions: {
    parserOptions: {
      projectService: false,
      project: './tsconfig.base.json',
      tsconfigRootDir: import.meta.dirname
    }
  }
}
```

After that override, all files parse successfully. The candidate reports two
`import-x/no-cycle` errors in the mutually importing `Review` and `ReviewUnit`
TypeORM entities, the same 65 line-length warnings, and 21 unused-disable
warnings. The cycle checks remain enabled and need a consumer decision.
The legacy import settings include explicit TypeScript parser registration,
which studio-lite's local profile does not carry over.

Keeping studio-lite's explicit `project: './tsconfig.base.json'` for all
TypeScript files, with `projectService: false`, also parses all files; it leaves
the same two cycle errors and reduces unused-disable warnings to two. This
demonstrates that changing the typed project model can affect findings even
when rule options are retained. These canaries validate migration behavior,
not studio-lite's build or application tests; consumer CI remains required.
