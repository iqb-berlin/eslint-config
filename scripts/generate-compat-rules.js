import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import stylistic from '@stylistic/eslint-plugin';

export const removedRules = [
  'global-require',
  'lines-around-directive',
  'no-buffer-constructor',
  'no-new-require',
  'no-path-concat'
];

// Default banned types from typescript-eslint 7.18.0. Using no-restricted-types
// preserves ban-types checks without adding checks for empty interfaces.
const bannedTypes = {
  String: { message: 'Use string instead', fixWith: 'string' },
  Boolean: { message: 'Use boolean instead', fixWith: 'boolean' },
  Number: { message: 'Use number instead', fixWith: 'number' },
  Symbol: { message: 'Use symbol instead', fixWith: 'symbol' },
  BigInt: { message: 'Use bigint instead', fixWith: 'bigint' },
  Function: {
    message: [
      'The `Function` type accepts any function-like value.',
      'It provides no type safety when calling the function, which can be a common source of bugs.',
      'It also accepts things like class declarations, which will throw at runtime as they will not be called with `new`.',
      'If you are expecting the function to accept certain arguments, you should explicitly define the function shape.'
    ].join('\n')
  },
  Object: {
    message: [
      'The `Object` type actually means "any non-nullish value", so it is marginally better than `unknown`.',
      '- If you want a type meaning "any object", you probably want `object` instead.',
      '- If you want a type meaning "any value", you probably want `unknown` instead.',
      '- If you really want a type meaning "any non-nullish value", you probably want `NonNullable<unknown>` instead.'
    ].join('\n'),
    suggest: ['object', 'unknown', 'NonNullable<unknown>']
  },
  '{}': {
    message: [
      '`{}` actually means "any non-nullish value".',
      '- If you want a type meaning "any object", you probably want `object` instead.',
      '- If you want a type meaning "any value", you probably want `unknown` instead.',
      '- If you want a type meaning "empty object", you probably want `Record<string, never>` instead.',
      '- If you really want a type meaning "any non-nullish value", you probably want `NonNullable<unknown>` instead.'
    ].join('\n'),
    suggest: ['object', 'unknown', 'Record<string, never>', 'NonNullable<unknown>']
  }
};

export function migrateLegacyRules(legacyRules) {
  const rules = {};
  for (const [name, originalOptions] of Object.entries(legacyRules)) {
    // no-spaced-func duplicates the more explicit func-call-spacing setting.
    if (removedRules.includes(name) || name === 'no-spaced-func') continue;
    let target = name;
    let options = structuredClone(originalOptions);
    if (name.startsWith('import/')) {
      target = name.replace('import/', 'import-x/');
    } else if (name === 'no-new-object') {
      target = 'no-object-constructor';
    } else if (name === '@typescript-eslint/ban-types') {
      assert.equal(options.length, 1, 'Review custom ban-types options before migrating');
      target = '@typescript-eslint/no-restricted-types';
      options = [options[0], { types: bannedTypes }];
    } else if (name === '@typescript-eslint/no-throw-literal') {
      target = '@typescript-eslint/only-throw-error';
      options = [options[0], {
        allowRethrowing: false,
        allowThrowingAny: true,
        allowThrowingUnknown: true,
        ...options[1]
      }];
    } else if (name === '@typescript-eslint/func-call-spacing') {
      target = '@stylistic/function-call-spacing';
    } else if (name.startsWith('@typescript-eslint/') && name.slice(19) in stylistic.rules) {
      target = name.replace('@typescript-eslint/', '@stylistic/');
    } else if (name in stylistic.rules) {
      target = `@stylistic/${name}`;
    }

    // These options are absent from the successor rule schemas. The old false
    // settings selected their normal behavior, which remains the default.
    if (target === 'import-x/no-cycle') delete options[1].disableScc;
    if (target === '@stylistic/object-property-newline') {
      delete options[1].allowMultiplePropertiesPerLine;
    }
    if (target in rules) {
      assert.deepEqual(rules[target], options, `Conflicting legacy rules for ${target}`);
    }
    rules[target] = options;
  }
  return Object.fromEntries(Object.entries(rules).sort(([a], [b]) => a.localeCompare(b, 'en')));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const snapshot = JSON.parse(readFileSync(new URL('../tests/fixtures/legacy/rules.json', import.meta.url)));
  const rules = migrateLegacyRules(snapshot.rules);
  const content = [
    '// Generated from the effective TypeScript rules of @iqb/eslint-config 2.2.0.',
    '// Regenerate with: node scripts/generate-compat-rules.js',
    '// See docs/migration.md and THIRD_PARTY_NOTICES.md for provenance and exceptions.',
    'export default {',
    Object.entries(rules).map(([name, options]) => `  ${JSON.stringify(name)}: ${JSON.stringify(options)}`).join(',\n'),
    '};',
    ''
  ].join('\n');
  writeFileSync(new URL('../compat-rules.js', import.meta.url), content);
  console.log(`Generated ${Object.keys(rules).length} compatibility rules.`);
}
