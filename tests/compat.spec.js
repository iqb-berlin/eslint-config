import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import compat from '../compat.js';
import modern from '../index.js';
import javascript from '../javascript.js';
import rules from '../compat-rules.js';
import { migrateLegacyRules, removedRules } from '../scripts/generate-compat-rules.js';
import { typescriptParserPath } from '../import-support.js';

const workspace = fileURLToPath(new URL('./fixtures/nx/', import.meta.url));
const sample = 'apps/frontend/src/sample.ts';
const snapshot = JSON.parse(readFileSync(new URL('./fixtures/legacy/rules.json', import.meta.url)));

function createESLint(config) {
  return new ESLint({ cwd: workspace, overrideConfigFile: true, overrideConfig: config });
}

describe('Compatibility migration', () => {
  it('preserves the captured legacy rules and options through the documented migration', () => {
    assert.deepEqual(rules, migrateLegacyRules(snapshot.rules));
    for (const name of removedRules) assert.ok(!(name in rules));
    assert.deepEqual(rules['@stylistic/semi'], ['error', 'always']);
    assert.deepEqual(rules['@stylistic/arrow-parens'], ['error', 'as-needed']);
    assert.ok(!Object.keys(rules).some(name => /^(perfectionist|sonarjs|jsdoc)\//u.test(name)));
  });

  it('preserves the legacy import settings and Node resolution policy', () => {
    for (const [name, value] of Object.entries(snapshot.settings)) {
      if (['import/resolver', 'import/parsers'].includes(name)) continue;
      assert.deepEqual(compat[0].settings[name.replace('import/', 'import-x/')], value);
    }
    assert.deepEqual(compat[0].settings['import-x/parsers'], {
      [typescriptParserPath]: snapshot.settings['import/parsers']['@typescript-eslint/parser']
    });
    const [resolver] = compat[0].settings['import-x/resolver-next'];
    assert.equal(resolver.name, 'iqb/legacy-node');
    assert.equal(resolver.resolve('@shared/value', fileURLToPath(new URL(`./fixtures/nx/${sample}`, import.meta.url))).found, false);
  });

  it('keeps type-aware checks for thrown values and the old banned types', async () => {
    const [result] = await createESLint(compat).lintFiles([sample]);
    assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages));
    assert.ok(result.messages.some(message => message.ruleId === '@typescript-eslint/only-throw-error'));
    const bannedTypes = result.messages.filter(message => message.ruleId === '@typescript-eslint/no-restricted-types');
    assert.equal(bannedTypes.length, 3, JSON.stringify(bannedTypes));
    assert.ok(!result.messages.some(message => message.ruleId === 'no-throw-literal'));
  });

  it('allows legacy object order and semicolons without contradictory arrow rules', async () => {
    const [result] = await createESLint(compat).lintFiles([sample]);
    const unwanted = result.messages.filter(message => [
      '@stylistic/semi', '@stylistic/arrow-parens', 'perfectionist/sort-objects'
    ].includes(message.ruleId));
    assert.deepEqual(unwanted, []);
  });

  it('keeps the richer profile available as a separate choice', async () => {
    const [result] = await createESLint(modern).lintFiles([sample]);
    assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages));
    assert.ok(result.messages.some(message => message.ruleId === 'perfectionist/sort-objects'));
    assert.ok(result.messages.some(message => message.ruleId === '@stylistic/type-named-tuple-spacing'));
    assert.ok(!result.messages.some(message => ['@stylistic/semi', '@stylistic/arrow-parens'].includes(message.ruleId)));
  });
});

describe('Project references and mixed workspaces', () => {
  it('resolves aliases when ESLint cwd differs from the calling process', async () => {
    const [result] = await createESLint(modern).lintFiles(['apps/frontend/src/alias-imports.ts']);
    assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages));
    const duplicates = result.messages.filter(message => message.ruleId === 'import-x/no-duplicates');
    assert.equal(duplicates.length, 2, JSON.stringify(result.messages));
  });

  it('detects actual TypeScript import cycles in the compatibility profile', async () => {
    const results = await createESLint(compat).lintFiles(['libs/shared/src/cycle-*.ts']);
    assert.equal(results.length, 2);
    for (const result of results) {
      assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages));
      assert.ok(result.messages.some(message => message.ruleId === 'import-x/no-cycle'), JSON.stringify(result.messages));
    }
  });

  for (const [name, config] of [['compat', compat], ['modern', modern]]) {
    it(`${name} lints project references and TypeScript aliases`, async () => {
      const results = await createESLint(config).lintFiles([sample, 'libs/shared/src/value.ts']);
      assert.equal(results.length, 2);
      for (const result of results) {
        assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages));
        assert.ok(!result.messages.some(message => /resolve error/iu.test(message.message)));
        assert.ok(!result.messages.some(message => ['import-x/no-unresolved', 'import-x/named'].includes(message.ruleId)));
      }
    });
  }

  it('reproduces the project: true parsing failure in editor/watch mode', async () => {
    const config = [
      ...compat,
      {
        languageOptions: {
          parserOptions: {
            projectService: false,
            project: true,
            // CI infers single-run mode, which can behave differently for
            // project references. Reproduce the editor/watch failure explicitly.
            disallowAutomaticSingleRunInference: true
          }
        }
      }
    ];
    const [result] = await createESLint(config).lintFiles([sample]);
    assert.ok(result.messages.some(message => message.fatal && /not found|does(?: not|n't) include/iu.test(message.message)),
      JSON.stringify(result.messages));
  });

  it('combines JavaScript and compatibility rules without applying JS presets to TypeScript', async () => {
    const eslint = createESLint([...javascript, ...compat]);
    const [result] = await eslint.lintText('export const sum = (a, b) => a + b;\n', { filePath: 'build.mjs' });
    assert.equal(result.errorCount, 0, JSON.stringify(result.messages));
    const tsConfig = await eslint.calculateConfigForFile(sample);
    assert.equal(tsConfig.rules['no-undef'], undefined);
    assert.equal(tsConfig.languageOptions.parserOptions.projectService, true);
  });

  it('parses JSX in the JavaScript profile', async () => {
    const [result] = await createESLint(javascript).lintText('export const element = <div />;\n', { filePath: 'component.jsx' });
    assert.equal(result.errorCount, 0, JSON.stringify(result.messages));
  });
});
