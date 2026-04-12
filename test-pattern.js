const expr = '(x-3)(x+2)';
const factoredPattern = /\(x([+-])(\d*\.?\d*)\)\(x([+-])(\d*\.?\d*)\)/;
const match = expr.match(factoredPattern);

console.log('Expression:', expr);
console.log('Match:', match);
if (match) {
  console.log('Sign 1:', match[1]);
  console.log('A:', match[2]);
  console.log('Sign 2:', match[3]);
  console.log('B:', match[4]);
  
  const sign1 = match[1];
  const a = parseFloat(match[2]) || 0;
  const sign2 = match[3];
  const b = parseFloat(match[4]) || 0;

  const num1 = sign1 === '-' ? -a : a;
  const num2 = sign2 === '-' ? -b : b;

  console.log('Num 1:', num1);
  console.log('Num 2:', num2);

  const sum = num1 + num2;
  const product = num1 * num2;
  
  console.log('Sum:', sum);
  console.log('Product:', product);
  
  const sumStr = sum === 0 ? '' : sum >= 0 ? `+${sum}x` : `${sum}x`;
  const productStr = product === 0 ? '' : product >= 0 ? `+${product}` : `${product}`;
  const result = `x^2${sumStr}${productStr}`;
  
  console.log('Result:', result);
}
