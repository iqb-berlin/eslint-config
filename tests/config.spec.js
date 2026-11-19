import assert from 'node:assert';
import { ESLint } from 'eslint';
import importX from 'eslint-plugin-import-x';
import iqbCompatConfig from '../compat.js';
import iqbTsConfig from '../index.js';
import iqbJsConfig from '../javascript.js';

describe('ESLint Config', () => {
  it('should export valid flat config arrays', () => {
    assert.ok(Array.isArray(iqbTsConfig));
    assert.ok(iqbTsConfig.length > 0);
    assert.ok(Array.isArray(iqbJsConfig));
    assert.ok(iqbJsConfig.length > 0);
  });

  for (const [profile, config] of [['default', iqbTsConfig], ['compat', iqbCompatConfig]]) {
    it(`should share the import-x plugin with consumers of the ${profile} profile`, async () => {
      const eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: [...config, {
          files: ['**/*.ts'],
          plugins: { 'import-x': importX }
        }]
      });

      const resolved = await eslint.calculateConfigForFile('tests/fixtures/sample.ts');
      assert.strictEqual(resolved.plugins['import-x'], importX);
    });
  }

  it('should lint TypeScript fixture without fatal errors', async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: iqbTsConfig
    });

    const results = await eslint.lintFiles(['tests/fixtures/sample.ts']);
    const fatalErrors = results.flatMap(result => result.messages).filter(message => message.fatal);
    assert.strictEqual(fatalErrors.length, 0, `Fatal TypeScript errors: ${JSON.stringify(fatalErrors)}`);
  });

  it('should lint JavaScript fixture without fatal errors', async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: iqbJsConfig
    });

    const results = await eslint.lintFiles(['tests/fixtures/javascript/sample.js']);
    const fatalErrors = results.flatMap(result => result.messages).filter(message => message.fatal);
    assert.strictEqual(fatalErrors.length, 0, `Fatal JavaScript errors: ${JSON.stringify(fatalErrors)}`);
  });
});
