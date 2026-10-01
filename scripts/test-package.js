import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
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
const packageManager = process.env.PACKAGE_MANAGER || 'npm';
assert.ok(['npm', 'pnpm'].includes(packageManager), 'Use npm or pnpm for PACKAGE_MANAGER');

try {
  const packed = await exec('npm', ['pack', '--json', '--pack-destination', temporary], { cwd: root });
  const [tarball] = JSON.parse(packed.stdout);
  assert.ok(tarball.files.some(file => file.path === 'compat-rules.js'));
  assert.ok(tarball.files.some(file => file.path === 'import-support.js'));
  assert.ok(tarball.files.some(file => file.path === 'THIRD_PARTY_NOTICES.md'));
  assert.ok(!tarball.files.some(file => /^(tests|scripts|node_modules)\//u.test(file.path)));
  mkdirSync(consumer);
  writeFileSync(join(consumer, 'package.json'), JSON.stringify({ name: 'iqb-package-consumer', private: true, type: 'module' }));
  if (packageManager === 'pnpm') {
    // Configure pnpm 11 in its workspace file; .npmrc no longer owns hoisting.
    writeFileSync(join(consumer, 'pnpm-workspace.yaml'), 'packages:\n  - .\nhoist: false\nminimumReleaseAge: 0\n');
  }
  const installOptions = packageManager === 'npm'
    ? ['install', '--ignore-scripts', '--no-audit', '--no-fund']
    : ['add', '--save-dev', '--ignore-scripts', '--reporter=silent'];
  await exec(packageManager, [
    ...installOptions,
    join(temporary, tarball.filename), `eslint@${version}`, `@eslint/js@${jsVersion}`, 'typescript@5.9.3'
  ], { cwd: consumer, maxBuffer: 4 * 1024 * 1024 });
  if (packageManager === 'pnpm') {
    assert.ok(!existsSync(join(consumer, 'node_modules/.pnpm/node_modules/@typescript-eslint/parser')),
      'The pnpm consumer must not hoist the parser into its shared dependency directory');
  }
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
    cwd: import.meta.dirname,
    overrideConfigFile: true,
    overrideConfig: [...javascript, ...config, {
      files: ['**/*.{ts,tsx,mts,cts}'],
      languageOptions: { parserOptions: { tsconfigRootDir: import.meta.dirname } }
    }]
  });
  const results = await eslint.lintFiles([
    'apps/frontend/src/sample.ts', 'libs/shared/src/value.ts', 'sample.mjs', 'sample.cjs',
    'apps/frontend/src/alias-imports.ts', 'libs/shared/src/cycle-a.ts', 'libs/shared/src/cycle-b.ts'
  ]);
  assert.equal(results.length, 7);
  for (const result of results) {
    assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages));
    assert.ok(!result.messages.some(message => /resolve error|parse errors in imported module|cannot find module/iu.test(message.message)), JSON.stringify(result.messages));
    if (/\\.(mjs|cjs)$/u.test(result.filePath)) assert.equal(result.errorCount, 0, JSON.stringify(result.messages));
  }
  if (name === 'compat') {
    assert.ok(results[0].messages.some(message => message.ruleId === '@typescript-eslint/only-throw-error'));
    for (const result of results.slice(5)) {
      assert.ok(result.messages.some(message => message.ruleId === 'import-x/no-cycle'), JSON.stringify(result.messages));
    }
  } else {
    const duplicates = results[4].messages.filter(message => message.ruleId === 'import-x/no-duplicates');
    assert.equal(duplicates.length, 2, JSON.stringify(results[4].messages));
  }
  console.log(name + ': installed package checks project references, import analysis, ESM and CommonJS');
}
`);
  // Load the installed config from outside the consumer project as editors do.
  const checked = await exec(process.execPath, [join(consumer, 'check.mjs')], { cwd: temporary, maxBuffer: 4 * 1024 * 1024 });
  process.stdout.write(checked.stdout);
  console.log(`Packed consumer check passed with ESLint ${version} using ${packageManager}.`);
} catch (error) {
  if (error.stdout) process.stderr.write(error.stdout);
  if (error.stderr) process.stderr.write(error.stderr);
  throw error;
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
