import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { parse, makeEvaluator, nthDerivative, toLatex, simplify, type Ast } from './mathEngine';

export interface CalculusState {
  input: string;
  setInput: (s: string) => void;
  error: string | null;
  ast: Ast | null;
  fn: (t: number) => number;
  derivatives: ((t: number) => number)[];
  derivativeAsts: Ast[];
  derivativeLatex: string[];
  t: number;
  setT: (t: number) => void;
  tRange: [number, number];
  setTRange: (r: [number, number]) => void;
  playing: boolean;
  setPlaying: (p: boolean) => void;
  speed: number;
  setSpeed: (s: number) => void;
  reset: () => void;
  inputValue: number;
  derivativeValues: number[];
}

const PRESETS = ['t^3 - 4*t^2 + 2*t', 'sin(t)', 'exp(-0.2*t)*sin(t)', 't^2 - 1', 'cos(2*t)', 'ln(t)', '1/t', 't*exp(-t)'];

export function useCalculus(initialInput = 't^3 - 4*t^2 + 2*t'): CalculusState {
  const [input, setInput] = useState(initialInput);
  const [t, setT] = useState(1);
  const [tRange, setTRange] = useState<[number, number]>([-5, 5]);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const parsed = useMemo(() => {
    try {
      const ast = parse(input);
      const fn = makeEvaluator(ast);
      const derivativeAsts: Ast[] = [ast];
      const derivatives: ((t: number) => number)[] = [fn];
      const derivativeLatex: string[] = [toLatex(ast)];

      for (let i = 1; i <= 4; i++) {
        const d = simplify(nthDerivative(ast, i));
        derivativeAsts.push(d);
        derivatives.push(makeEvaluator(d));
        derivativeLatex.push(toLatex(d));
      }

      return { ast, fn, derivatives, derivativeAsts, derivativeLatex, error: null };
    } catch (e: any) {
      return {
        ast: null,
        fn: () => NaN,
        derivatives: [],
        derivativeAsts: [],
        derivativeLatex: [],
        error: e.message || 'Invalid expression',
      };
    }
  }, [input]);

  // Animation loop
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const animate = (timestamp: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
      const dt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      setT((prevT) => {
        const newT = prevT + dt * speed;
        if (newT >= tRange[1]) {
          setPlaying(false);
          return tRange[1];
        }
        return newT;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0;
    };
  }, [playing, speed, tRange]);

  const reset = useCallback(() => {
    setPlaying(false);
    setT(tRange[0]);
  }, [tRange]);

  const inputValue = parsed.fn(t);
  const derivativeValues = parsed.derivatives.map((d) => d(t));

  return {
    input,
    setInput,
    error: parsed.error,
    ast: parsed.ast,
    fn: parsed.fn,
    derivatives: parsed.derivatives,
    derivativeAsts: parsed.derivativeAsts,
    derivativeLatex: parsed.derivativeLatex,
    t,
    setT,
    tRange,
    setTRange,
    playing,
    setPlaying,
    speed,
    setSpeed,
    reset,
    inputValue,
    derivativeValues,
  };
}

export { PRESETS };
