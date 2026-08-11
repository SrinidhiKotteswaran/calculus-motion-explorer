import { useEffect, useRef } from 'react';

// Lightweight LaTeX renderer using KaTeX
let katexLoaded = false;
let katexLib: any = null;

async function loadKatex() {
  if (katexLoaded) return katexLib;
  katexLoaded = true;
  // @ts-ignore
  const katex = await import('katex');
  katexLib = katex.default;
  return katexLib;
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
