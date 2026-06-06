/**
 * Registry sweep — runs every generator in the registry through the
 * domain-neutral correctness harness and produces a structured report.
 *
 * Quarantined keys (via `qaSkip`) are tracked as debt rows instead of
 * failures, per test-strategy §5.
 */

import {
  verifyGenerator,
  type VerifyGeneratorReport,
  type GeneratorLike,
} from '@math-platform/practice-core/generator-qa';

import type { MathGenerator, QaSkipSpec } from './registry';

// ── Exported types ────────────────────────────────────────────────────

export type { QaSkipSpec } from './registry';

export interface DebtLogEntry {
  readonly key: string;
  readonly checkName: string;
  readonly reason: string;
  readonly trackId: string;
}

export interface RegistrySweepOptions {
  readonly debtLogSink?: (entry: DebtLogEntry) => void;
}

export interface PerKeyReport {
  readonly key: string;
  readonly report: VerifyGeneratorReport;
  readonly quarantined: boolean;
  readonly skippedChecks: readonly string[];
  readonly skipReason?: string;
}

export interface RegistrySweepReport {
  readonly verdict: 'pass' | 'fail';
  readonly totalGenerators: number;
  readonly passedKeys: readonly string[];
  readonly failedKeys: readonly string[];
  readonly quarantinedKeys: readonly string[];
  readonly perKey: readonly PerKeyReport[];
  readonly debtRows: readonly string[];
}

// ── Constants ─────────────────────────────────────────────────────────

const TRACK_ID = 'generated-math-correctness-qa_20260605';

// ── Helpers ───────────────────────────────────────────────────────────

/**
 * Adapt a `MathGenerator` (math-content registry) to the `GeneratorLike`
 * interface expected by the domain-neutral `verifyGenerator` harness.
 *
 * Maps `expectedAnswer` → `correctAnswer` so the harness's
 * unique-answer check can evaluate real generators.
 */
function adaptToGeneratorLike(gen: MathGenerator): GeneratorLike {
  return {
    generate: (input) => {
      const output = gen.generate({
        nodeId: input.nodeId,
        seed: input.seed,
        difficulty: input.difficulty,
        learnerContext: input.learnerContext as Record<string, unknown> | undefined,
      });
      return {
        problem: output.prompt,
        correctAnswer: output.expectedAnswer,
        distractors: [],
        solutionSteps: output.solutionSteps,
      };
    },
  };
}

// ── Public API ────────────────────────────────────────────────────────

export function runRegistrySweep(
  registry: Record<string, MathGenerator>,
  options?: RegistrySweepOptions,
): RegistrySweepReport {
  const perKey: PerKeyReport[] = [];
  const debtRows: string[] = [];

  for (const [key, gen] of Object.entries(registry)) {
    const skip = gen.qaSkip;
    const quarantined = skip !== undefined;

    if (quarantined) {
      const skippedChecks: string[] = [];
      if (skip!.uniqueAnswer) {
        skippedChecks.push('unique-answer');
      }

      const report = verifyGenerator(adaptToGeneratorLike(gen));
      const entry: PerKeyReport = {
        key,
        report,
        quarantined: true,
        skippedChecks,
        skipReason: skip!.reason,
      };
      perKey.push(entry);

      for (const checkName of skippedChecks) {
        const debtRow = `[${TRACK_ID}] ${key}/${checkName}: ${skip!.reason}`;
        debtRows.push(debtRow);
        options?.debtLogSink?.({
          key,
          checkName,
          reason: skip!.reason,
          trackId: TRACK_ID,
        });
      }
    } else {
      const report = verifyGenerator(adaptToGeneratorLike(gen));
      perKey.push({
        key,
        report,
        quarantined: false,
        skippedChecks: [],
      });
    }
  }

  const passedKeys = perKey
    .filter((p) => !p.quarantined && p.report.verdict === 'pass')
    .map((p) => p.key);
  const failedKeys = perKey
    .filter((p) => !p.quarantined && p.report.verdict === 'fail')
    .map((p) => p.key);
  const quarantinedKeys = perKey
    .filter((p) => p.quarantined)
    .map((p) => p.key);

  return {
    verdict: failedKeys.length === 0 ? 'pass' : 'fail',
    totalGenerators: perKey.length,
    passedKeys,
    failedKeys,
    quarantinedKeys,
    perKey,
    debtRows,
  };
}
