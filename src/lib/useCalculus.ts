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

const DEFAULT_RANGE: [number, number] = [-5, 5];
const MIN_RANGE_WIDTH = 0.01;

function normalizeRange(range: [number, number], fallback: [number, number] = DEFAULT_RANGE): [number, number] {
  let [min, max] = range;
  if (!Number.isFinite(min)) min = fallback[0];
  if (!Number.isFinite(max)) max = fallback[1];
  if (max - min < MIN_RANGE_WIDTH) {
    const center = (min + max) / 2;
    min = center - MIN_RANGE_WIDTH / 2;
    max = center + MIN_RANGE_WIDTH / 2;
  }
  return [min, max];
}

export function useCalculus(initialInput = 't^3 - 4*t^2 + 2*t'): CalculusState {
  const [input, setInput] = useState(initialInput);
  const [t, setTState] = useState(1);
  const [tRange, setTRangeState] = useState<[number, number]>(DEFAULT_RANGE);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeedState] = useState(1);

  const setT = useCallback((nextT: number) => {
    if (!Number.isFinite(nextT)) return;
    setTState(nextT);
  }, []);

  const setTRange = useCallback((range: [number, number]) => {
    const normalized = normalizeRange(range);
    setTRangeState(normalized);
    setTState((current) => Math.min(normalized[1], Math.max(normalized[0], current)));
  }, []);

  const setSpeed = useCallback((nextSpeed: number) => {
    if (!Number.isFinite(nextSpeed)) return;
    setSpeedState(Math.max(0.05, Math.min(10, nextSpeed)));
  }, []);

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
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Invalid expression';
      return { ast: null, fn: () => NaN, derivatives: [], derivativeAsts: [], derivativeLatex: [], error: message };
    }
  }, [input]);

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimeRef.current = null;
      return;
    }

    const animate = (timestamp: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = timestamp;

      setTState((prevT) => {
        const nextT = prevT + dt * speed;
        if (nextT >= tRange[1]) return tRange[1];
        return nextT;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimeRef.current = null;
    };
  }, [playing, speed, tRange]);

  useEffect(() => {
    if (playing && t >= tRange[1] - 1e-9) setPlaying(false);
  }, [playing, t, tRange]);

  const reset = useCallback(() => {
    setPlaying(false);
    setTState(tRange[0]);
  }, [tRange]);

  const inputValue = parsed.fn(t);
  const derivativeValues = parsed.derivatives.map((d) => d(t));

  return {
    input, setInput, error: parsed.error, ast: parsed.ast, fn: parsed.fn,
    derivatives: parsed.derivatives, derivativeAsts: parsed.derivativeAsts,
    derivativeLatex: parsed.derivativeLatex, t, setT, tRange, setTRange,
    playing, setPlaying, speed, setSpeed, reset, inputValue, derivativeValues,
  };
}

export { PRESETS };
