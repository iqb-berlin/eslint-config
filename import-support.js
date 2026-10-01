import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import ts from 'typescript';
import { createNodeResolver } from 'eslint-plugin-import-x';
import {
  createTypeScriptImportResolver,
  defaultExtensions,
  defaultExtensionAlias
} from 'eslint-import-resolver-typescript';

// Resolve through the package that owns the parser, including isolated installs.
const requireTypeScriptEslint = createRequire(import.meta.resolve('typescript-eslint'));
export const typescriptParserPath = requireTypeScriptEslint.resolve('@typescript-eslint/parser');

export function createProjectImportResolver() {
  const resolvers = new Map();
  const fallback = createNodeResolver({
    extensions: defaultExtensions,
    extensionAlias: defaultExtensionAlias
  });
  return {
    interfaceVersion: 3,
    name: 'iqb/typescript-project',
    resolve(source, file) {
      // Match project service: the source file selects its nearest TSConfig.
      // An absolute project avoids binding the resolver to process.cwd().
      const project = ts.findConfigFile(dirname(file), ts.sys.fileExists, 'tsconfig.json');
      if (!project) return fallback.resolve(source, file);
      if (!resolvers.has(project)) {
        resolvers.set(project, createTypeScriptImportResolver({ project }));
      }
      return resolvers.get(project).resolve(source, file);
    }
  };
}
