export type DistractorType =
  | 'factoring'
  | 'linear'
  | 'quadratic_formula'
  | 'complex'
  | 'completing_square'
  | 'discriminant'
  | 'system';

export interface DistractorGenerator {
  (correctAnswer: string): string[];
}

export interface DistractorResult {
  correctAnswer: string;
  type: DistractorType;
  distractors: string[];
  providedDistractors?: string[];
}
