import { parse, makeEvaluator, differentiate, simplify } from '../src/lib/mathEngine.ts';

const expressions = [
  't^3 - 4*t^2 + 2*t',
  'sin(t^2) + exp(-0.2*t)',
  't^2*sin(t)/(1+t^2)',
  'sqrt(t^2 + 4) + ln(t + 6)',
  'cos(t)^3 + 2*t^5 - 7*t',
];
const iterations = 500;

function time(label: string, fn: () => void): number {
  const start = performance.now();
  fn();
  const elapsed = performance.now() - start;
  console.log(`${label}: ${elapsed.toFixed(2)} ms`);
  return elapsed;
}

for (const expression of expressions) {
  let ast = parse(expression);
  time(`${expression} parse × ${iterations}`, () => {
    for (let i = 0; i < iterations; i++) ast = parse(expression);
  });

  time(`${expression} differentiate × ${iterations}`, () => {
    for (let i = 0; i < iterations; i++) simplify(differentiate(ast));
  });

  const evaluator = makeEvaluator(ast);
  time(`${expression} evaluate × ${iterations * 100}`, () => {
    let checksum = 0;
    for (let i = 0; i < iterations * 100; i++) checksum += evaluator((i % 100) / 10 - 5);
    if (!Number.isFinite(checksum)) throw new Error('Benchmark produced a non-finite checksum');
  });
}

console.log('Benchmark complete. Run on the same machine/runtime when comparing changes.');
