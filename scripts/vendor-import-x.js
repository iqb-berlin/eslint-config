import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const temporary = mkdtempSync(join(tmpdir(), 'iqb-import-x-source-'));
const check = process.argv.includes('--check');
const upstream = 'eslint-plugin-import-x@4.17.1';
const integrity = 'sha512-4cdstYkKCyjumM2Q9NSI03K8D2a9F4Ssz33K2lv2hQa4KmR9jPLwk3uWGtNvclfqBrPGfGuMBwsGMbe6dMRbfg==';

function replaceOnce(source, before, after) {
  assert.equal(source.split(before).length, 2, `Expected one exact patch location: ${before}`);
  return source.replace(before, after);
}

try {
  const [packed] = JSON.parse(execFileSync('npm', [
    'pack', upstream, '--ignore-scripts', '--json', '--pack-destination', temporary
  ], { encoding: 'utf8' }));
  const archive = join(temporary, packed.filename);
  assert.equal('sha512-' + createHash('sha512').update(readFileSync(archive)).digest('base64'), integrity);
  execFileSync('tar', ['-xzf', archive, '-C', temporary,
    'package/lib/index.cjs', 'package/package.json', 'package/LICENSE']);
  const original = readFileSync(join(temporary, 'package/lib/index.cjs'), 'utf8');
  let source = original;
  for (const kind of ['allow', 'forbid']) {
    source = replaceOnce(source,
      `const ${kind}Regexps = (options.${kind} || []).map((p) => (0, minimatch.makeRe)(p)).filter(Boolean);`,
      `const ${kind}Matchers = (options.${kind} || []).map((p) => new minimatch.Minimatch(p)).filter((matcher) => !matcher.empty && !matcher.comment);`);
    source = replaceOnce(source,
      `return ${kind}Regexps.some((re) => re.test(importPath));`,
      `return ${kind}Matchers.some((matcher) => matcher.match(importPath));`);
  }
  const metadata = {
    name: 'eslint-plugin-import-x', version: '4.17.1-iqb.1', private: true, license: 'MIT'
  };
  const provenance = {
    upstream, integrity,
    originalBundleSha256: createHash('sha256').update(original).digest('hex'),
    patchedBundleSha256: createHash('sha256').update(source).digest('hex'),
    regeneration: 'npm run vendor:import-x',
    runtimeDependencies: {
      ...JSON.parse(readFileSync(join(temporary, 'package/package.json'))).dependencies,
      minimatch: '^11.0.4'
    }
  };
  const files = {
    'lib/index.cjs': source,
    'package.json': JSON.stringify(metadata, null, 2) + '\n',
    'source.json': JSON.stringify(provenance, null, 2) + '\n',
    LICENSE: readFileSync(join(temporary, 'package/LICENSE'), 'utf8').trimEnd() + '\n'
  };
  for (const [name, content] of Object.entries(files)) {
    const target = join(root, 'vendor/import-x', name);
    if (check) {
      assert.equal(readFileSync(target, 'utf8'), content, `Vendored source differs: ${name}`);
    } else {
      mkdirSync(join(target, '..'), { recursive: true });
      writeFileSync(target, content);
    }
  }
  const runtime = JSON.parse(readFileSync(join(root, 'package.json'))).dependencies;
  for (const [name, range] of Object.entries(provenance.runtimeDependencies)) {
    assert.equal(runtime[name], range, `Declare the vendored plugin's dependency ${name} directly`);
  }
  console.log(`${check ? 'Verified' : 'Generated'} the pinned import-x bundle and its four-line matching patch.`);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
