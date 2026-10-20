import { useEffect, useRef } from 'react';

// Lightweight LaTeX renderer using KaTeX
type KatexRenderer = typeof import('katex').default;
let katexLib: KatexRenderer | null = null;

async function loadKatex(): Promise<KatexRenderer> {
  if (katexLib) return katexLib;
  const module = await import('katex');
  const renderer = module.default;
  katexLib = renderer;
  return renderer;
}

interface MathProps {
  tex: string;
  display?: boolean;
  className?: string;
}

export function Math({ tex, display = false, className }: MathProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let mounted = true;
    loadKatex().then((katex) => {
      if (!mounted || !ref.current) return;
      try {
        katex.render(tex, ref.current, {
          displayMode: display,
          throwOnError: false,
          errorColor: '#ef4444',
        });
      } catch {
        if (ref.current) ref.current.textContent = tex;
      }
    });
    return () => { mounted = false; };
  }, [tex, display]);

  return <span ref={ref} className={className} />;
}
