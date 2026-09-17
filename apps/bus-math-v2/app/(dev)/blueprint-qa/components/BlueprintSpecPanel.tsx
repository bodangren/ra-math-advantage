import type { PracticeMode, ReviewBlueprint } from '../types';

interface BlueprintSpecPanelProps {
  blueprint: ReviewBlueprint | null;
  mode: PracticeMode;
}

function Missing() {
  return (
    <div className="border border-amber-400 bg-amber-50 p-4 text-sm text-amber-950">
      <p className="font-semibold">Missing</p>
      <p className="mt-1">This blueprint does not define this modality.</p>
    </div>
  );
}

export function BlueprintSpecPanel({ blueprint, mode }: BlueprintSpecPanelProps) {
  if (!blueprint) return <Missing />;

  const spec = mode === 'worked_example'
    ? blueprint.workedExampleSpec
    : mode === 'guided_practice'
      ? blueprint.guidedPracticeSpec
      : blueprint.independentPracticeSpec;

  if (!spec) return <Missing />;

  return (
    <details className="border border-[#8A958E] bg-[#EEEADF] text-[#0A1C1A]">
      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">
        Stored blueprint fields
      </summary>
      <p className="border-t border-[#C9C4B5] px-4 pt-3 text-xs text-[#365451]">
        These source fields are for diagnosis. The student view above is the approval subject.
      </p>
      <pre className="m-4 overflow-auto bg-[#0A1C1A] p-3 text-xs text-[#FDFCF5]">
        {JSON.stringify(spec, null, 2)}
      </pre>
    </details>
  );
}
