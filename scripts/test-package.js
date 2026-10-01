import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { cpSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const root = fileURLToPath(new URL('../', import.meta.url));
const temporary = mkdtempSync(join(tmpdir(), 'iqb-eslint-package-'));
const consumer = join(temporary, 'consumer');
const version = process.env.ESLINT_VERSION || '10';
const jsVersion = version.split('.')[0];

try {
  const packed = await exec('npm', ['pack', '--json', '--pack-destination', temporary], { cwd: root });
  const [tarball] = JSON.parse(packed.stdout);
  assert.ok(tarball.files.some(file => file.path === 'compat-rules.js'));
  assert.ok(tarball.files.some(file => file.path === 'THIRD_PARTY_NOTICES.md'));
  assert.ok(!tarball.files.some(file => /^(tests|scripts|node_modules)\//u.test(file.path)));
  mkdirSync(consumer);
  writeFileSync(join(consumer, 'package.json'), JSON.stringify({ name: 'iqb-package-consumer', private: true, type: 'module' }));
  await exec('npm', [
    'install', '--ignore-scripts', '--no-audit', '--no-fund',
    join(temporary, tarball.filename), `eslint@${version}`, `@eslint/js@${jsVersion}`, 'typescript@5.9.3'
  ], { cwd: consumer, maxBuffer: 4 * 1024 * 1024 });
  cpSync(join(root, 'tests/fixtures/nx'), consumer, { recursive: true });
  writeFileSync(join(consumer, 'sample.mjs'), 'export const sum = (a, b) => a + b;\n');
  writeFileSync(join(consumer, 'sample.cjs'), 'module.exports = value => value;\n');
  writeFileSync(join(consumer, 'check.mjs'), `
import assert from 'node:assert/strict';
import { ESLint } from 'eslint';
import modern from '@iqb/eslint-config';
import compat from '@iqb/eslint-config/compat';
import javascript from '@iqb/eslint-config/javascript';

for (const [name, config] of [['modern', modern], ['compat', compat]]) {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [...javascript, ...config, {
      files: ['**/*.{ts,tsx,mts,cts}'],
      languageOptions: { parserOptions: { tsconfigRootDir: import.meta.dirname } }
    }]
  });
  const results = await eslint.lintFiles(['apps/frontend/src/sample.ts', 'libs/shared/src/value.ts', 'sample.mjs', 'sample.cjs']);
  assert.equal(results.length, 4);
  for (const result of results) {
    assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages));
    assert.ok(!result.messages.some(message => /resolve error/iu.test(message.message)), JSON.stringify(result.messages));
    if (/\\.(mjs|cjs)$/u.test(result.filePath)) assert.equal(result.errorCount, 0, JSON.stringify(result.messages));
  }
  if (name === 'compat') {
    assert.ok(results[0].messages.some(message => message.ruleId === '@typescript-eslint/only-throw-error'));
  }
  console.log(name + ': installed package lints TypeScript project references, aliases, ESM and CommonJS');
}
`);
  const checked = await exec(process.execPath, ['check.mjs'], { cwd: consumer, maxBuffer: 4 * 1024 * 1024 });
  process.stdout.write(checked.stdout);
  console.log(`Packed consumer check passed with ESLint ${version}.`);
} catch (error) {
  if (error.stdout) process.stderr.write(error.stdout);
  if (error.stderr) process.stderr.write(error.stderr);
  throw error;
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
