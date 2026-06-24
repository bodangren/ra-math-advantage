/**
 * Format an ascending-order coefficient array as a human-readable polynomial.
 *   [0, 7, 1]  → "x² + 7x"
 *   [6, 5, 1]  → "x² + 5x + 6"
 */

const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
};

export function formatPolynomial(coeffs: number[]): string {
  if (coeffs.length === 0) return '0';

  const parts: string[] = [];
  for (let deg = coeffs.length - 1; deg >= 0; deg--) {
    const c = coeffs[deg];
    if (c === 0) continue;

    const absC = Math.abs(c);
    const sign = c < 0 ? '−' : '+';
    const coeffStr = absC === 1 && deg > 0 ? '' : String(absC);

    let varStr: string;
    if (deg === 0) {
      varStr = '';
    } else if (deg === 1) {
      varStr = 'x';
    } else {
      const sup = String(deg)
        .split('')
        .map((d) => SUPERSCRIPTS[d] ?? `^${d}`)
        .join('');
      varStr = `x${sup}`;
    }

    const term = `${coeffStr}${varStr}`;
    if (parts.length === 0) {
      parts.push(c < 0 ? `−${term}` : term);
    } else {
      parts.push(`${sign} ${term}`);
    }
  }

  return parts.length > 0 ? parts.join(' ') : '0';
}
