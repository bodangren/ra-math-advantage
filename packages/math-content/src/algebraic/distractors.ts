/**
 * Distractor generation utility for algebraic step-by-step problems.
 * Generates plausible incorrect answers based on common misconceptions.
 */

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

const distractorGenerators: Record<DistractorType, DistractorGenerator> = {
  factoring: generateFactoringDistractors,
  linear: generateLinearDistractors,
  quadratic_formula: generateQuadraticFormulaDistractors,
  complex: generateComplexDistractors,
  completing_square: generateCompletingSquareDistractors,
  discriminant: generateDiscriminantDistractors,
  system: generateSystemDistractors,
};

/**
 * Generate distractors for a given correct answer.
 * @param correctAnswer - The correct answer
 * @param type - The type of problem
 * @param providedDistractors - Optional pre-provided distractors to use instead
 * @returns Array of 2 distractor strings
 */
export function generateDistractors(
  correctAnswer: string,
  type: DistractorType,
  providedDistractors?: string[]
): string[] {
  // Use provided distractors if available
  if (providedDistractors && providedDistractors.length >= 2) {
    return providedDistractors.slice(0, 2);
  }

  // Generate distractors based on type
  const generator = distractorGenerators[type];
  if (generator) {
    const generated = generator(correctAnswer);
    // Ensure we return exactly 2 distractors
    return generated.slice(0, 2);
  }

  // Fallback to generic distractors for unknown types
  return generateGenericDistractors(correctAnswer);
}

function generateFactoringDistractors(correctAnswer: string): string[] {
  const distractors: string[] = [];

  const factoredMatch = correctAnswer.match(/\(x\s*([+-])\s*(\d+)\)\(x\s*([+-])\s*(\d+)\)/);

  if (factoredMatch) {
    const [, sign1, num1, sign2, num2] = factoredMatch;
    const n1 = parseInt(num1, 10);
    const n2 = parseInt(num2, 10);

    const flippedSign1 = sign1 === '+' ? '-' : '+';
    distractors.push(`(x ${flippedSign1} ${n1})(x ${sign2} ${n2})`);

    if (n1 !== n2) {
      distractors.push(`(x ${sign1} ${n2})(x ${sign2} ${n1})`);
    } else {
      const flippedSign2 = sign2 === '+' ? '-' : '+';
      distractors.push(`(x ${sign1} ${n1})(x ${flippedSign2} ${n2})`);
    }
  } else {
    return generateGenericDistractors(correctAnswer);
  }

  return distractors;
}

function generateLinearDistractors(correctAnswer: string): string[] {
  const distractors: string[] = [];

  const solutionMatch = correctAnswer.match(/x\s*=\s*(-?\d+(?:\.\d+)?)/);

  if (solutionMatch) {
    const value = parseFloat(solutionMatch[1]);

    distractors.push(`x = ${value + 1}`);

    if (value !== 0) {
      distractors.push(`x = ${-value}`);
    } else {
      distractors.push(`x = ${value + 2}`);
    }
  } else {
    return generateGenericDistractors(correctAnswer);
  }

  return distractors;
}

function generateQuadraticFormulaDistractors(correctAnswer: string): string[] {
  const distractors: string[] = [];

  const solutionsMatch = correctAnswer.match(/x\s*=\s*(-?\d+(?:\.\d+)?).*x\s*=\s*(-?\d+(?:\.\d+)?)/);

  if (solutionsMatch) {
    const [, sol1, sol2] = solutionsMatch;
    const s1 = parseFloat(sol1);
    const s2 = parseFloat(sol2);

    distractors.push(`x = ${-s1}, x = ${s2}`);

    if (s1 !== s2) {
      distractors.push(`x = ${s2}, x = ${s1}`);
    } else {
      distractors.push(`x = ${s1}, x = ${-s2}`);
    }
  } else {
    return generateLinearDistractors(correctAnswer);
  }

  return distractors;
}

function generateComplexDistractors(correctAnswer: string): string[] {
  const distractors: string[] = [];

  const complexMatch = correctAnswer.match(/x\s*=\s*(-?\d+(?:\.\d+)?)\s*([+-])\s*(\d+(?:\.\d+)?)i.*x\s*=\s*(-?\d+(?:\.\d+)?)\s*([+-])\s*(\d+(?:\.\d+)?)i/);

  if (complexMatch) {
    const [, real1, sign1, imag1] = complexMatch;
    const r1 = parseFloat(real1);
    const i1 = parseFloat(imag1);

    const sameSign = sign1 === '+' ? '+' : '-';
    distractors.push(`x = ${r1} ${sameSign} ${i1}i, x = ${r1} ${sameSign} ${i1}i`);

    const flippedSign = sign1 === '+' ? '-' : '+';
    distractors.push(`x = ${r1} ${flippedSign} ${i1}i, x = ${r1} ${flippedSign} ${i1}i`);
  } else {
    return generateGenericDistractors(correctAnswer);
  }

  return distractors;
}

function generateCompletingSquareDistractors(correctAnswer: string): string[] {
  const distractors: string[] = [];

  const vertexMatch = correctAnswer.match(/\(x\s*([+-])\s*(\d+(?:\.\d+)?)\)\^2\s*=\s*(-?\d+(?:\.\d+)?)/);

  if (vertexMatch) {
    const [, sign, h, k] = vertexMatch;
    const hVal = parseFloat(h);
    const kVal = parseFloat(k);

    const flippedSign = sign === '+' ? '-' : '+';
    distractors.push(`(x ${flippedSign} ${hVal})^2 = ${kVal}`);

    distractors.push(`(x ${sign} ${hVal})^2 = ${kVal + 1}`);
  } else {
    return generateGenericDistractors(correctAnswer);
  }

  return distractors;
}

function generateDiscriminantDistractors(correctAnswer: string): string[] {
  const distractors: string[] = [];

  if (correctAnswer.toLowerCase().includes('real')) {
    if (correctAnswer.includes('2')) {
      distractors.push('1 real solution');
    } else if (correctAnswer.includes('1')) {
      distractors.push('2 real solutions');
    }

    distractors.push('2 complex solutions');
  } else if (correctAnswer.toLowerCase().includes('complex')) {
    distractors.push('2 real solutions');

    distractors.push('1 real solution');
  } else {
    return generateGenericDistractors(correctAnswer);
  }

  return distractors;
}

function generateSystemDistractors(correctAnswer: string): string[] {
  const distractors: string[] = [];

  const solutionMatch = correctAnswer.match(/\(x,\s*y\)\s*=\s*\(([^,]+),\s*([^)]+)\)/);

  if (solutionMatch) {
    const [, xSol, ySol] = solutionMatch;

    distractors.push(`(x, y) = (${ySol}, ${xSol})`);

    if (ySol.startsWith('-')) {
      distractors.push(`(x, y) = (${xSol}, ${ySol.slice(1)})`);
    } else {
      distractors.push(`(x, y) = (${xSol}, -${ySol})`);
    }
  } else {
    return generateGenericDistractors(correctAnswer);
  }

  return distractors;
}

function generateGenericDistractors(correctAnswer: string): string[] {
  const distractors: string[] = [];

  if (correctAnswer.includes('=')) {
    const parts = correctAnswer.split('=');
    if (parts.length > 1) {
      distractors.push(`${parts[0]} = ${parseFloat(parts[1] || '0') + 1}`);
    }
  } else {
    distractors.push(`${correctAnswer} + 1`);
  }

  if (correctAnswer.includes('-')) {
    distractors.push(correctAnswer.replace(/-/g, '+'));
  } else if (correctAnswer.includes('+')) {
    distractors.push(correctAnswer.replace(/\+/g, '-'));
  } else {
    distractors.push(`-${correctAnswer}`);
  }

  return distractors;
}
