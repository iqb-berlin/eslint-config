import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import importX from 'eslint-plugin-import-x';
import globals from 'globals';
import nodeResolver from 'eslint-import-resolver-node';
import rules from './compat-rules.js';

// Flat Config with the effective TypeScript rules from @iqb/eslint-config 2.2.0.
// No recommended presets: upgrading tools must not add new style rules here.
export default [
  {
    name: 'iqb/compat-typescript',
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.es2021 },
      parserOptions: { projectService: true }
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      '@stylistic': stylistic,
      'import-x': importX
    },
    settings: {
      'import-x/parsers': { '@typescript-eslint/parser': ['.ts', '.tsx', '.d.ts'] },
      'import-x/extensions': ['.js', '.mjs', '.jsx', '.ts', '.tsx', '.d.ts'],
      'import-x/external-module-folders': ['node_modules', 'node_modules/@types'],
      'import-x/core-modules': [],
      'import-x/ignore': ['node_modules', '\\.(coffee|scss|css|less|hbs|svg|json)$'],
      // Retain the legacy Node resolution policy. Alias-aware import analysis
      // is an additional behavior change in the richer TypeScript profile.
      'import-x/resolver-next': [{
        interfaceVersion: 3,
        name: 'iqb/legacy-node',
        resolve: (source, file) => nodeResolver.resolve(source, file, {
          extensions: ['.mjs', '.js', '.json', '.ts', '.d.ts']
        })
      }]
    },
    rules: {
      ...rules,
      'import-x/no-unresolved': 'off',
      'import-x/named': 'off'
    }
  }
];
