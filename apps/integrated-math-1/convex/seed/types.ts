export type PhaseType =
  | "explore"
  | "vocabulary"
  | "learn"
  | "key_concept"
  | "worked_example"
  | "guided_practice"
  | "independent_practice"
  | "assessment"
  | "discourse"
  | "reflection";

export type SectionType = "text" | "callout" | "activity" | "video" | "image";

export interface SeedTextContent {
  markdown: string;
}

export interface SeedCalloutContent {
  type: "important" | "tip" | "warning";
  title?: string;
  body: string;
}

export interface SeedActivityContent {
  componentKey: string;
  props: Record<string, unknown>;
  gradingConfig?: {
    autoGrade: boolean;
    partialCredit: boolean;
  };
}

export interface SeedSection {
  sequenceOrder: number;
  sectionType: SectionType;
  content: SeedTextContent | SeedCalloutContent | SeedActivityContent | Record<string, unknown>;
}

export interface SeedPhase {
  phaseNumber: number;
  title?: string;
  phaseType: PhaseType;
  estimatedMinutes?: number;
  sections: SeedSection[];
}
