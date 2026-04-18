'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, BookOpen, Target, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PhaseType } from '@/lib/curriculum/phase-types';
import { getPhaseDisplayInfo } from '@/lib/curriculum/phase-types';

export interface LessonMetadata {
  id: string;
  title: string;
  slug: string;
  unitNumber: number;
  orderIndex: number;
  learningObjectives: string[];
  estimatedMinutes?: number;
  phaseSequence: Array<{
    phaseNumber: number;
    phaseType: PhaseType;
    title?: string;
    estimatedMinutes?: number;
  }>;
  standards: Array<{
    standardCode: string;
    standardDescription: string;
    studentFriendlyDescription?: string;
    isPrimary: boolean;
  }>;
  vocabulary: string[];
}

export interface LessonMetadataPanelProps {
  metadata: LessonMetadata;
  defaultExpanded?: boolean;
  className?: string;
}

export function LessonMetadataPanel({
  metadata,
  defaultExpanded = false,
  className,
}: LessonMetadataPanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const totalMinutes = metadata.estimatedMinutes ?? metadata.phaseSequence.reduce(
    (sum, p) => sum + (p.estimatedMinutes ?? 0),
    0
  );

  return (
    <div className={cn('border rounded-lg', className)}>
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground font-mono-num text-sm font-bold flex items-center justify-center">
            {metadata.orderIndex}
          </span>
          <div>
            <h3 className="font-semibold text-foreground">{metadata.title}</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              {totalMinutes > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {totalMinutes} min
                </span>
              )}
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {metadata.phaseSequence.length} phases
              </span>
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                {metadata.standards.filter(s => s.isPrimary).length} primary standards
              </span>
            </div>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t pt-4">
          {metadata.learningObjectives.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-primary" />
                Learning Objectives
              </h4>
              <ul className="list-disc list-inside text-sm text-foreground space-y-1">
                {metadata.learningObjectives.map((obj, idx) => (
                  <li key={idx}>{obj}</li>
                ))}
              </ul>
            </div>
          )}

          {metadata.vocabulary.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Vocabulary
              </h4>
              <div className="flex flex-wrap gap-2">
                {metadata.vocabulary.map((term, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-primary" />
              Phase Sequence
            </h4>
            <div className="flex flex-wrap gap-2">
              {metadata.phaseSequence.map((phase) => {
                const displayInfo = getPhaseDisplayInfo(phase.phaseType);
                return (
                  <span
                    key={phase.phaseNumber}
                    className={cn(
                      'px-2 py-1 rounded text-xs font-medium',
                      displayInfo.bgColor,
                      displayInfo.color
                    )}
                    title={phase.title}
                  >
                    {phase.phaseNumber}. {displayInfo.label}
                    {phase.estimatedMinutes && ` (${phase.estimatedMinutes}m)`}
                  </span>
                );
              })}
            </div>
          </div>

          {metadata.standards.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Standards Alignment</h4>
              <div className="space-y-2">
                {metadata.standards.map((standard, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'p-2 rounded text-xs',
                      standard.isPrimary ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                    )}
                  >
                    <span className="font-mono font-semibold">{standard.standardCode}</span>
                    <span className="text-muted-foreground ml-2">
                      {standard.studentFriendlyDescription ?? standard.standardDescription}
                    </span>
                    {standard.isPrimary && (
                      <span className="ml-2 text-green-600 font-medium">(Primary)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
