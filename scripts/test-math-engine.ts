import { strict as assert } from 'node:assert';
import { parse, makeEvaluator, differentiate, simplify } from '../src/lib/mathEngine.ts';

function approx(actual: number, expected: number, tolerance = 1e-8) {
  assert.ok(Number.isFinite(actual), `expected a finite value, got ${actual}`);
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${expected}, got ${actual}`);
}

function derivativeAt(expression: string, t: number): number {
  const ast = simplify(differentiate(parse(expression)));
  return makeEvaluator(ast)(t);
}

const cases: Array<[string, number, number]> = [
  ['t^3', 2, 12],
  ['sin(t)', 0.7, Math.cos(0.7)],
  ['cos(t)', 0.7, -Math.sin(0.7)],
  ['exp(t)', 0.3, Math.exp(0.3)],
  ['ln(t)', 2, 0.5],
  ['sqrt(t)', 4, 0.25],
  ['t^2*sin(t)', 1, 2 * Math.sin(1) + Math.cos(1)],
  ['sin(t^2)', 1, 2 * Math.cos(1)],
  ['exp(-0.2*t)*sin(t)', 0.8, Math.exp(-0.16) * (Math.cos(0.8) - 0.2 * Math.sin(0.8))],
];

for (const [expression, t, expected] of cases) {
  approx(derivativeAt(expression, t), expected, 1e-6);
}

const evaluations: Array<[string, number, number]> = [
  ['2t + 1', 3, 7],
  ['2pi', 0, 2 * Math.PI],
  ['sqrt(9)', 0, 3],
  ['|t - 3|', 5, 2],
];

for (const [expression, t, expected] of evaluations) {
  approx(makeEvaluator(parse(expression))(t), expected, 1e-8);
}

for (const invalid of ['', 'sin(', 't^^2', 'hello@world']) {
  assert.throws(() => parse(invalid), `expected ${invalid} to be rejected`);
}

assert.ok(Number.isNaN(makeEvaluator(parse('ln(t)'))(-1)));
assert.ok(Number.isNaN(makeEvaluator(parse('1/t'))(0)));

console.log(`Math engine checks passed: ${cases.length + evaluations.length} numeric cases + invalid/domain cases.`);
