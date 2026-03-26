import assert from 'node:assert';
import { ESLint } from 'eslint';
import iqbConfig from '../index.js';

describe('ESLint Config', () => {
  it('should be a valid flat config array', () => {
    assert.ok(Array.isArray(iqbConfig));
    assert.ok(iqbConfig.length > 0);
  });

  it('should load and lint a sample file without fatal errors', async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: iqbConfig
    });

    const results = await eslint.lintFiles(['tests/fixtures/sample.ts']);
    
    // We don't necessarily expect 0 warnings/errors (sample might violate rules),
    // but we expect the linter to run successfully.
    assert.ok(results.length > 0);
    assert.strictEqual(results[0].filePath.endsWith('sample.ts'), true);
    
    // Check for fatal errors (e.g. config loading issues)
    const fatalErrors = results[0].messages.filter(m => m.fatal);
    assert.strictEqual(fatalErrors.length, 0, `Fatal errors found: ${JSON.stringify(fatalErrors)}`);
  });
});
