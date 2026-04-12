import { checkEquivalence, normalizeExpression, expandPolynomial, factorPolynomial } from '@/lib/activities/algebraic/equivalence';

const expr1 = '(x-3)(x+2)';
const expr2 = 'x^2-x-6';

console.log('=== Testing: (x-3)(x+2) vs x^2-x-6 ===');
console.log('Normalized 1:', normalizeExpression(expr1));
console.log('Normalized 2:', normalizeExpression(expr2));
console.log('Expanded 1:', expandPolynomial(expr1));
console.log('Expanded 2:', expandPolynomial(expr2));
console.log('Factored 1:', factorPolynomial(expr1));
console.log('Factored 2:', factorPolynomial(expr2));
console.log('Result:', checkEquivalence(expr1, expr2));
