const assert = require('node:assert');
const path = require('node:path');
const { ESLint } = require('eslint');
const tsConfig = require('../index');
const jsConfig = require('../javascript');

const fixturesDir = path.join(__dirname, 'fixtures');
const tsFixtureDir = path.join(fixturesDir, 'typescript');
const jsFixtureDir = path.join(fixturesDir, 'javascript');

describe('ESLint Config Smoke Tests', () => {
  it('loads TypeScript config and lints fixture without fatal errors', async () => {
    const eslint = new ESLint({
      cwd: tsFixtureDir,
      useEslintrc: false,
      overrideConfig: {
        ...tsConfig,
        parserOptions: {
          ...tsConfig.parserOptions,
          project: './tsconfig.json',
          tsconfigRootDir: tsFixtureDir
        }
      }
    });

    const results = await eslint.lintFiles(['sample.ts']);
    const fatalErrors = results.flatMap(result => result.messages).filter(message => message.fatal);
    assert.strictEqual(fatalErrors.length, 0, `Fatal TypeScript lint errors: ${JSON.stringify(fatalErrors)}`);
  });

  it('loads JavaScript config and lints fixture without fatal errors', async () => {
    const eslint = new ESLint({
      cwd: jsFixtureDir,
      useEslintrc: false,
      overrideConfig: jsConfig
    });

    const results = await eslint.lintFiles(['sample.js']);
    const fatalErrors = results.flatMap(result => result.messages).filter(message => message.fatal);
    assert.strictEqual(fatalErrors.length, 0, `Fatal JavaScript lint errors: ${JSON.stringify(fatalErrors)}`);
  });
});
