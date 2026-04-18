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

interface DistractorGenerator {
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

/**
 * Generate distractors for factoring problems
 */
function generateFactoringDistractors(correctAnswer: string): string[] {
  const distractors: string[] = [];

  // Check if it's a factored form like (x + a)(x + b)
  const factoredMatch = correctAnswer.match(/\(x\s*([+-])\s*(\d+)\)\(x\s*([+-])\s*(\d+)\)/);
  
  if (factoredMatch) {
    const [, sign1, num1, sign2, num2] = factoredMatch;
    const n1 = parseInt(num1, 10);
    const n2 = parseInt(num2, 10);

    // Distractor 1: Sign error in first factor
    const flippedSign1 = sign1 === '+' ? '-' : '+';
    distractors.push(`(x ${flippedSign1} ${n1})(x ${sign2} ${n2})`);

    // Distractor 2: Sign error in second factor or swapped numbers
    if (n1 !== n2) {
      distractors.push(`(x ${sign1} ${n2})(x ${sign2} ${n1})`);
    } else {
      // If numbers are the same, flip second sign
      const flippedSign2 = sign2 === '+' ? '-' : '+';
      distractors.push(`(x ${sign1} ${n1})(x ${flippedSign2} ${n2})`);
    }
  } else {
    // For non-factored forms, generate generic distractors
    return generateGenericDistractors(correctAnswer);
  }

  return distractors;
}

/**
 * Generate distractors for linear equations
 */
function generateLinearDistractors(correctAnswer: string): string[] {
  const distractors: string[] = [];

  // Check if it's a solution like x = n
  const solutionMatch = correctAnswer.match(/x\s*=\s*(-?\d+(?:\.\d+)?)/);
  
  if (solutionMatch) {
    const value = parseFloat(solutionMatch[1]);

    // Distractor 1: Off by 1 error
    distractors.push(`x = ${value + 1}`);

    // Distractor 2: Sign error or off by 2
    if (value !== 0) {
      distractors.push(`x = ${-value}`);
    } else {
      distractors.push(`x = ${value + 2}`);
    }
  } else {
    // For non-solution forms, generate generic distractors
    return generateGenericDistractors(correctAnswer);
  }

  return distractors;
}

/**
 * Generate distractors for quadratic formula solutions
 */
function generateQuadraticFormulaDistractors(correctAnswer: string): string[] {
  const distractors: string[] = [];

  // Check if it's a pair of solutions like x = a, x = b
  const solutionsMatch = correctAnswer.match(/x\s*=\s*(-?\d+(?:\.\d+)?).*x\s*=\s*(-?\d+(?:\.\d+)?)/);
  
  if (solutionsMatch) {
    const [, sol1, sol2] = solutionsMatch;
    const s1 = parseFloat(sol1);
    const s2 = parseFloat(sol2);

    // Distractor 1: Sign error in first solution
    distractors.push(`x = ${-s1}, x = ${s2}`);

    // Distractor 2: Swapped solutions or sign error in second
    if (s1 !== s2) {
      distractors.push(`x = ${s2}, x = ${s1}`);
    } else {
      distractors.push(`x = ${s1}, x = ${-s2}`);
    }
  } else {
    // For single solutions, use linear distractors
    return generateLinearDistractors(correctAnswer);
  }

  return distractors;
}

/**
 * Generate distractors for complex number solutions
 */
function generateComplexDistractors(correctAnswer: string): string[] {
  const distractors: string[] = [];

  // Check if it's a conjugate pair like x = a + bi, x = a - bi
  const complexMatch = correctAnswer.match(/x\s*=\s*(-?\d+(?:\.\d+)?)\s*([+-])\s*(\d+(?:\.\d+)?)i.*x\s*=\s*(-?\d+(?:\.\d+)?)\s*([+-])\s*(\d+(?:\.\d+)?)i/);
  
  if (complexMatch) {
    const [, real1, sign1, imag1] = complexMatch;
    const r1 = parseFloat(real1);
    const i1 = parseFloat(imag1);

    // Distractor 1: Both solutions have same sign (not conjugate)
    const sameSign = sign1 === '+' ? '+' : '-';
    distractors.push(`x = ${r1} ${sameSign} ${i1}i, x = ${r1} ${sameSign} ${i1}i`);

    // Distractor 2: Sign error in imaginary part
    const flippedSign = sign1 === '+' ? '-' : '+';
    distractors.push(`x = ${r1} ${flippedSign} ${i1}i, x = ${r1} ${flippedSign} ${i1}i`);
  } else {
    // For non-conjugate forms, generate generic distractors
    return generateGenericDistractors(correctAnswer);
  }

  return distractors;
}

/**
 * Generate distractors for completing the square problems
 */
function generateCompletingSquareDistractors(correctAnswer: string): string[] {
  const distractors: string[] = [];

  // Check if it's vertex form like (x - h)^2 = k
  const vertexMatch = correctAnswer.match(/\(x\s*([+-])\s*(\d+(?:\.\d+)?)\)\^2\s*=\s*(-?\d+(?:\.\d+)?)/);
  
  if (vertexMatch) {
    const [, sign, h, k] = vertexMatch;
    const hVal = parseFloat(h);
    const kVal = parseFloat(k);

    // Distractor 1: Sign error in h
    const flippedSign = sign === '+' ? '-' : '+';
    distractors.push(`(x ${flippedSign} ${hVal})^2 = ${kVal}`);

    // Distractor 2: Error in k value
    distractors.push(`(x ${sign} ${hVal})^2 = ${kVal + 1}`);
  } else {
    // For non-vertex forms, generate generic distractors
    return generateGenericDistractors(correctAnswer);
  }

  return distractors;
}

/**
 * Generate distractors for discriminant analysis
 */
function generateDiscriminantDistractors(correctAnswer: string): string[] {
  const distractors: string[] = [];

  // Check if it's a classification like "2 real solutions"
  if (correctAnswer.toLowerCase().includes('real')) {
    // Distractor 1: Wrong number of solutions
    if (correctAnswer.includes('2')) {
      distractors.push('1 real solution');
    } else if (correctAnswer.includes('1')) {
      distractors.push('2 real solutions');
    }

    // Distractor 2: Complex instead of real
    distractors.push('2 complex solutions');
  } else if (correctAnswer.toLowerCase().includes('complex')) {
    // Distractor 1: Real instead of complex
    distractors.push('2 real solutions');

    // Distractor 2: 1 real solution
    distractors.push('1 real solution');
  } else {
    // For non-classification answers, generate generic distractors
    return generateGenericDistractors(correctAnswer);
  }

  return distractors;
}

/**
 * Generate distractors for system of equations
 */
function generateSystemDistractors(correctAnswer: string): string[] {
  const distractors: string[] = [];

  // Check if it's a solution pair like (x, y) = (a, b)
  const solutionMatch = correctAnswer.match(/\(x,\s*y\)\s*=\s*\(([^,]+),\s*([^)]+)\)/);
  
  if (solutionMatch) {
    const [, xSol, ySol] = solutionMatch;

    // Distractor 1: Swapped solutions
    distractors.push(`(x, y) = (${ySol}, ${xSol})`);

    // Distractor 2: Sign error in one coordinate
    if (ySol.startsWith('-')) {
      distractors.push(`(x, y) = (${xSol}, ${ySol.slice(1)})`);
    } else {
      distractors.push(`(x, y) = (${xSol}, -${ySol})`);
    }
  } else {
    // For non-solution pair forms, generate generic distractors
    return generateGenericDistractors(correctAnswer);
  }

  return distractors;
}

/**
 * Generate generic distractors as fallback
 */
function generateGenericDistractors(correctAnswer: string): string[] {
  const distractors: string[] = [];

  // Distractor 1: Partial match
  if (correctAnswer.includes('=')) {
    const parts = correctAnswer.split('=');
    if (parts.length > 1) {
      distractors.push(`${parts[0]} = ${parseFloat(parts[1] || '0') + 1}`);
    }
  } else {
    distractors.push(`${correctAnswer} + 1`);
  }

  // Distractor 2: Sign variation
  if (correctAnswer.includes('-')) {
    distractors.push(correctAnswer.replace(/-/g, '+'));
  } else if (correctAnswer.includes('+')) {
    distractors.push(correctAnswer.replace(/\+/g, '-'));
  } else {
    distractors.push(`-${correctAnswer}`);
  }

  return distractors;
}
