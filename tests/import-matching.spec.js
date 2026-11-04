import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import importX, { createNodeResolver } from '../import-plugin.js';

const cwd = fileURLToPath(new URL('./fixtures/import-matching/', import.meta.url));
const cases = JSON.parse(readFileSync(new URL('./fixtures/import-matching/cases.json', import.meta.url)));

function createESLint(rule, options) {
  return new ESLint({
    cwd,
    overrideConfigFile: true,
    overrideConfig: [{
      files: ['**/*.{js,mjs,cjs}'],
      plugins: { 'import-x': importX },
      settings: { 'import-x/resolver-next': [createNodeResolver({ extensions: ['.js', '.mjs'] })] },
      rules: { [`import-x/${rule}`]: ['error', options] }
    }]
  });
}

describe('Import matching with the patched plugin', () => {
  for (const [syntax, statement] of [
    ['import', path => `import ${JSON.stringify(path)};`],
    ['export', path => `export * from ${JSON.stringify(path)};`],
    ['require', path => `const value = require(${JSON.stringify(path)});`]
  ]) {
    for (const test of cases) {
      it(`${syntax}: ${test.name}`, async () => {
        const [result] = await createESLint('no-internal-modules', test.options)
          .lintText(statement(test.path), { filePath: 'entry.mjs' });
        assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages));
        assert.equal(result.errorCount, test.errors, JSON.stringify(result.messages));
        assert.ok(result.messages.every(message => message.ruleId === 'import-x/no-internal-modules'));
      });
    }
  }

  for (const [target, errors] of [['internal.js', 1], ['public.js', 0]]) {
    it(`preserves restricted-path exceptions for ${target}`, async () => {
      const [result] = await createESLint('no-restricted-paths', {
        basePath: cwd,
        zones: [{ target: './src/api', from: './src/private', except: ['./public.js'] }]
      }).lintText(`import '../private/${target}';`, { filePath: 'src/api/entry.mjs' });
      assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages));
      assert.equal(result.errorCount, errors, JSON.stringify(result.messages));
    });
  }
});
