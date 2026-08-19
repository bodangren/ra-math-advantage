import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import {
  APPROVED_TLAC_SOURCE_INVENTORY,
  DANIELSON_SOURCE_SNAPSHOT,
  RUNTIME_OVERLAP_SOURCE_INVENTORY,
  RUNTIME_SOURCE_INVENTORY,
} from '../../lib/proficiency/source-inventory';

const siblingRoot = resolve(process.cwd(), '../../../hdkwa-danielson');
const standaloneRoot = resolve(siblingRoot, 'src/data/techniques');
const runtimeSourcePath = resolve(siblingRoot, 'src/data/techniques.ts');
const frameworkSourcePath = resolve(siblingRoot, 'src/data/danielson.ts');
const sourceIsAvailable = existsSync(runtimeSourcePath) && existsSync(standaloneRoot);

type SourceRow = {
  id: string;
  title: string;
  componentId: string;
  source: string;
  sourceLocation: string;
};

function sourceHash(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function standaloneHash(path: string): string {
  const hash = createHash('sha256');
  for (const filename of readdirSync(path).filter((item) => item.endsWith('.ts')).sort()) {
    hash.update(filename);
    hash.update('\0');
    hash.update(readFileSync(resolve(path, filename)));
    hash.update('\0');
  }
  return hash.digest('hex');
}

function stringProperty(object: ts.ObjectLiteralExpression, name: string): string {
  const property = object.properties.find((item): item is ts.PropertyAssignment => (
    ts.isPropertyAssignment(item)
    && ts.isIdentifier(item.name)
    && item.name.text === name
  ));
  if (!property || !ts.isStringLiteral(property.initializer)) {
    throw new Error(`Missing string property ${name}`);
  }
  return property.initializer.text;
}

function objectRows(path: string, sourceLocation: string, arrayName?: string): SourceRow[] {
  const source = ts.createSourceFile(
    path,
    readFileSync(path, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const objects: ts.ObjectLiteralExpression[] = [];
  if (arrayName) {
    source.forEachChild((node) => {
      if (!ts.isVariableStatement(node)) return;
      for (const declaration of node.declarationList.declarations) {
        if (
          ts.isIdentifier(declaration.name)
          && declaration.name.text === arrayName
          && declaration.initializer
          && ts.isArrayLiteralExpression(declaration.initializer)
        ) {
          objects.push(...declaration.initializer.elements.filter(ts.isObjectLiteralExpression));
        }
      }
    });
  } else {
    source.forEachChild((node) => {
      if (!ts.isVariableStatement(node)) return;
      for (const declaration of node.declarationList.declarations) {
        if (declaration.initializer && ts.isObjectLiteralExpression(declaration.initializer)) {
          objects.push(declaration.initializer);
        }
      }
    });
  }
  return objects.map((object) => ({
    id: stringProperty(object, 'id'),
    title: stringProperty(object, 'title'),
    componentId: stringProperty(object, 'subdomain'),
    source: stringProperty(object, 'source'),
    sourceLocation,
  }));
}

function byId(left: SourceRow, right: SourceRow): number {
  return left.id.localeCompare(right.id);
}

describe.runIf(sourceIsAvailable)('sibling source oracle', () => {
  it('matches all source hashes and every approved standalone TLAC row', () => {
    expect(execFileSync('git', ['-C', siblingRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim())
      .toBe(DANIELSON_SOURCE_SNAPSHOT.siblingCommit);
    expect(sourceHash(runtimeSourcePath)).toBe(DANIELSON_SOURCE_SNAPSHOT.runtimeSourceHash);
    expect(sourceHash(frameworkSourcePath)).toBe(DANIELSON_SOURCE_SNAPSHOT.frameworkSourceHash);
    expect(standaloneHash(standaloneRoot)).toBe(DANIELSON_SOURCE_SNAPSHOT.standaloneSourceHash);

    const sourceRows = readdirSync(standaloneRoot)
      .filter((filename) => filename.endsWith('.ts'))
      .map((filename) => objectRows(
        resolve(standaloneRoot, filename),
        `src/data/techniques/${filename}`,
      )[0])
      .sort(byId);
    expect(sourceRows).toEqual(APPROVED_TLAC_SOURCE_INVENTORY.map((row) => ({
      id: row.id,
      title: row.title,
      componentId: row.componentId,
      source: 'TLAC 3.0',
      sourceLocation: row.sourceLocation,
    })).sort(byId));
  });

  it('matches all 23 overlap rows and all 40 runtime-only rows', () => {
    const sourceRows = objectRows(
      runtimeSourcePath,
      'src/data/techniques.ts',
      'techniques',
    ).sort(byId);
    const frozenRows = [
      ...RUNTIME_OVERLAP_SOURCE_INVENTORY,
      ...RUNTIME_SOURCE_INVENTORY,
    ].map((row) => ({
      id: row.id,
      title: row.title,
      componentId: row.componentId,
      source: row.source,
      sourceLocation: row.sourceLocation,
    })).sort(byId);

    expect(sourceRows).toHaveLength(63);
    expect(sourceRows).toEqual(frozenRows);
  });
});
