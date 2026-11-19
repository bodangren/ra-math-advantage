export interface AssignVariant {
  id: string;
  weight: number;
}

export interface AssignInput {
  studentId: string;
  experimentId: string;
  variants: readonly AssignVariant[];
  hash: (input: string) => number;
}

function avalanche(value: number): number {
  let bits = Math.floor(value * 0x100000000) >>> 0;
  bits ^= bits >>> 16;
  bits = Math.imul(bits, 0x7feb352d);
  bits ^= bits >>> 15;
  bits = Math.imul(bits, 0x846ca68b);
  bits ^= bits >>> 16;
  return (bits >>> 0) / 0x100000000;
}

export function assign({ studentId, experimentId, variants, hash }: AssignInput): string {
  if (variants.length === 0) throw new Error("Experiment must declare at least one variant");
  const totalWeight = variants.reduce((total, variant) => {
    if (!variant.id || !Number.isFinite(variant.weight) || variant.weight <= 0) {
      throw new Error("Variant ids must be non-empty and weights must be positive finite numbers");
    }
    return total + variant.weight;
  }, 0);
  const value = hash(`${studentId}|${experimentId}`);
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new Error("Assignment hash must return a finite number in [0, 1)");
  }
  const threshold = avalanche(value) * totalWeight;
  let cumulative = 0;
  for (const variant of variants) {
    cumulative += variant.weight;
    if (threshold < cumulative) return variant.id;
  }
  return variants[variants.length - 1].id;
}
