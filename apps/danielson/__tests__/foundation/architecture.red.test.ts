import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const APPLICATION_ROOT = resolve(__dirname, "../..");
const REPOSITORY_ROOT = resolve(APPLICATION_ROOT, "../..");
const MANIFEST_PATH = join(
  REPOSITORY_ROOT,
  "scripts",
  "architecture",
  "architecture.manifest.json",
);

type PackageJson = {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
};

type ArchitectureManifest = {
  owners: string[];
  workspaces: Array<{
    id: string;
    path: string;
    kind: string;
    owner: string;
    layer: string;
    domainClassification: string;
    domain: string | null;
    allowedDependencies: string[];
    publicEntryPoints: string[];
    qualityCommands: Record<string, string>;
  }>;
};

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function listSourceFiles(directory: string): string[] {
  const result: string[] = [];
  for (const entry of readdirSync(directory)) {
    if (entry === "node_modules" || entry === ".next" || entry === "coverage") continue;
    const path = join(directory, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      result.push(...listSourceFiles(path));
      continue;
    }
    if (/\.(?:[cm]?[jt]sx?)$/.test(entry)) result.push(path);
  }
  return result;
}

describe("Danielson application workspace contract", () => {
  it("creates an application-owned workspace with the required product and Convex boundaries", () => {
    expect(existsSync(APPLICATION_ROOT), "apps/danielson must exist").toBe(true);
    expect(existsSync(join(APPLICATION_ROOT, "package.json"))).toBe(true);
    expect(existsSync(join(APPLICATION_ROOT, "product.md"))).toBe(true);
    expect(existsSync(join(APPLICATION_ROOT, "product-guidelines.md"))).toBe(true);
    expect(existsSync(join(APPLICATION_ROOT, "DESIGN.md"))).toBe(true);
    expect(existsSync(join(APPLICATION_ROOT, "convex", "schema.ts"))).toBe(true);

    for (const route of [
      "app/page.tsx",
      "app/auth/login/page.tsx",
      "app/unauthorized/page.tsx",
      "app/admin/page.tsx",
      "app/admin/accounts/page.tsx",
      "app/admin/departments/page.tsx",
      "app/admin/coaches/page.tsx",
      "app/api/auth/login/route.ts",
      "app/api/auth/logout/route.ts",
      "app/api/auth/session/route.ts",
    ]) {
      expect(existsSync(join(APPLICATION_ROOT, route)), `missing ${route}`).toBe(true);
    }
  });

  it("uses shared platform packages rather than copied authentication or Convex code", () => {
    const packageJson = readJson<PackageJson>(join(APPLICATION_ROOT, "package.json"));

    expect(packageJson.dependencies).toMatchObject({
      "@math-platform/core-auth": expect.any(String),
      "@math-platform/core-convex": expect.any(String),
      "@math-platform/app-shell": expect.any(String),
    });
  });

  it("defines focused workspace quality commands", () => {
    const packageJson = readJson<PackageJson>(join(APPLICATION_ROOT, "package.json"));

    for (const command of ["dev", "lint", "test", "typecheck", "build"]) {
      expect(packageJson.scripts?.[command], `missing apps/danielson ${command} command`).toEqual(
        expect.any(String),
      );
    }
  });
});

describe("Danielson architecture registration contract", () => {
  it("registers the workspace and its app-owned dependency boundary in the architecture manifest", () => {
    const manifest = readJson<ArchitectureManifest>(MANIFEST_PATH);
    const workspace = manifest.workspaces.find((item) => item.id === "app.danielson");

    expect(workspace).toMatchObject({
      id: "app.danielson",
      path: "apps/danielson",
      kind: "app",
      layer: "application",
      domainClassification: "app-owned",
      domain: "danielson",
    });
    expect(workspace?.owner).toEqual(expect.any(String));
    expect(manifest.owners).toContain(workspace?.owner);
    expect(workspace?.allowedDependencies).toEqual(
      expect.arrayContaining(["pkg.app-shell", "pkg.core-auth", "pkg.core-convex"]),
    );
    expect(workspace?.publicEntryPoints).toEqual(expect.any(Array));

    for (const command of ["lint", "test", "typecheck", "build"]) {
      expect(workspace?.qualityCommands[command], `missing manifest ${command} command`).toEqual(
        expect.any(String),
      );
    }
  });

  it("adds root shortcuts for every Danielson quality gate", () => {
    const rootPackage = readJson<PackageJson>(join(REPOSITORY_ROOT, "package.json"));

    for (const capability of ["lint", "test", "typecheck", "build"]) {
      expect(rootPackage.scripts?.[`ws:danielson:${capability}`]).toEqual(expect.any(String));
    }
  });

  it("keeps shared packages independent from the Danielson application", () => {
    const packagesRoot = join(REPOSITORY_ROOT, "packages");
    const appImportPattern = /(?:apps\/danielson|@math-platform\/danielson)/;

    for (const file of listSourceFiles(packagesRoot)) {
      const source = readFileSync(file, "utf8");
      expect(source, `${file} must not import the Danielson application`).not.toMatch(
        appImportPattern,
      );
    }
  });

  it("uses explicit return validators for every observation Convex function", () => {
    const source = readFileSync(join(APPLICATION_ROOT, "convex", "observations.ts"), "utf8");

    expect(source).not.toMatch(/returns:\s*v\.any\(\)/);
  });
});
