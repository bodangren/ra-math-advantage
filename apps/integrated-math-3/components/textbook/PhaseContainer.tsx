import { ReactNode } from 'react';
import { getPhaseDisplayInfo, type PhaseType } from '@/lib/curriculum/phase-types';

export interface PhaseContainerProps {
  phaseType: PhaseType;
  children: ReactNode;
}

// Maps phaseType bgColor tokens (Tailwind) to matching border color
const borderColorMap: Record<string, string> = {
  'bg-blue-50':   'border-blue-200',
  'bg-purple-50': 'border-purple-200',
  'bg-amber-50':  'border-amber-200',
  'bg-yellow-50': 'border-yellow-200',
  'bg-green-50':  'border-green-200',
  'bg-cyan-50':   'border-cyan-200',
  'bg-indigo-50': 'border-indigo-200',
  'bg-red-50':    'border-red-200',
  'bg-pink-50':   'border-pink-200',
  'bg-gray-50':   'border-gray-200',
};

export function PhaseContainer({ phaseType, children }: PhaseContainerProps) {
  const { label, color, bgColor } = getPhaseDisplayInfo(phaseType);
  const borderColor = borderColorMap[bgColor] ?? 'border-border';

  return (
    <section
      aria-label={`${label} phase`}
      className={`my-6 rounded-lg border ${bgColor} ${borderColor} p-6`}
    >
      <div className={`flex items-center gap-2 mb-4`}>
        <span className={`text-xs font-semibold uppercase tracking-widest font-mono-num ${color}`}>
          {label}
        </span>
      </div>
      <div>{children}</div>
    </section>
  );
}
