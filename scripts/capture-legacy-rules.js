import { execFile } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const snapshotPath = new URL('../tests/fixtures/legacy/rules.json', import.meta.url);
const { dependencies } = JSON.parse(readFileSync(snapshotPath));
const temporary = mkdtempSync(join(tmpdir(), 'iqb-eslint-legacy-'));

try {
  writeFileSync(join(temporary, 'package.json'), JSON.stringify({ name: 'iqb-legacy-reference', private: true, dependencies }));
  await exec('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], { cwd: temporary });
  const requireLegacy = createRequire(join(temporary, 'package.json'));
  const { ESLint } = requireLegacy('eslint');
  const eslint = new ESLint({
    cwd: temporary,
    useEslintrc: false,
    overrideConfig: { extends: ['@iqb/eslint-config'] }
  });
  const config = await eslint.calculateConfigForFile('sample.ts');
  const rules = Object.fromEntries(Object.entries(config.rules)
    .filter(([, options]) => ![0, 'off'].includes(options[0]))
    .sort(([a], [b]) => a.localeCompare(b, 'en')));
  writeFileSync(snapshotPath, JSON.stringify({ dependencies, rules, settings: config.settings }, null, 2) + '\n');
  console.log(`Captured ${Object.keys(rules).length} effective legacy TypeScript rules.`);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
