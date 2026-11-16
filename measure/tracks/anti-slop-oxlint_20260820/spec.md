# Specification: Anti-Slop Oxlint Integration

## Overview

Install the `dmmulroy/anti-slop` agent skill and use it to add the generic
anti-slop Oxlint plugin to this repository.

## Functional Requirements

1. Install the `install-anti-slop` skill for the user-level Codex environment.
2. Vendor the plugin at `tools/oxlint/anti-slop/`.
3. Add current matching `oxlint` and `@oxlint/plugins` development dependencies.
4. Create a root Oxlint configuration with all 15 generic anti-slop rules at
   error severity.
5. Ignore agent-tooling directories and the vendored plugin source in Oxlint.
6. Add a separate `npm run lint:oxlint` command.
7. Do not enable the optional Effect rules because no workspace has a direct
   `effect` dependency.

## Non-Functional Requirements

- Preserve the existing ESLint-based workspace lint commands.
- Preserve unrelated dirty worktree changes.
- Use the repository's existing npm package manager.

## Acceptance Criteria

- The installed skill contains a valid `SKILL.md` and its installer assets.
- The vendored plugin contains the generic rule entry point and all rule files.
- The root configuration loads successfully with Oxlint.
- The generic rules are present at error severity.
- The configuration and dependency files pass the relevant checks.

## Out of Scope

- Converting existing ESLint commands to Oxlint.
- Fixing all existing anti-slop findings in application source.
- Adding Effect-specific rules without a direct dependency.
