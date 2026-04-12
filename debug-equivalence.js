const { checkEquivalence, normalizeExpression } = require('./lib/activities/algebraic/equivalence.ts');

console.log('Testing: (x-3)(x+2) vs x^2-x-6');
console.log('Normalized 1:', normalizeExpression('(x-3)(x+2)'));
console.log('Normalized 2:', normalizeExpression('x^2-x-6'));
console.log('Result:', checkEquivalence('(x-3)(x+2)', 'x^2-x-6'));
