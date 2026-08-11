import { useMemo, useRef, useState, useCallback, useEffect } from 'react';

export interface Curve {
  fn: (t: number) => number;
  color: string;
  label?: string;
  width?: number;
  dashArray?: string;
}

export interface Marker {
  t: number;
  y: number;
  color: string;
  label?: string;
  size?: number;
}

export interface VLine {
  t: number;
  color: string;
  label?: string;
}

export interface Region {
  start: number;
  end: number;
  color: string;
  opacity?: number;
}

export interface GraphPoint {
  t: number;
  y: number;
}

interface GraphProps {
  curves?: Curve[];
  markers?: Marker[];
  vLines?: VLine[];
  regions?: Region[];
  rects?: { x: number; width: number; height: number; color: string; opacity?: number }[];
  xDomain: [number, number];
  yDomain: [number, number];
  xLabel?: string;
  yLabel?: string;
  height?: number;
  showGrid?: boolean;
  showAxes?: boolean;
  onHover?: (t: number | null) => void;
  cursorT?: number | null;
  cursorColor?: string;
  className?: string;
}

const SAMPLES = 600;

export function Graph({
  curves = [],
  markers = [],
  vLines = [],
  regions = [],
  rects = [],
  xDomain,
  yDomain,
  xLabel,
  yLabel,
  height = 280,
  showGrid = true,
  showAxes = true,
  onHover,
  cursorT = null,
  cursorColor = '#f97316',
  className,
}: GraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(800);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const padding = { top: 16, right: 16, bottom: 36, left: 52 };
  const plotW = Math.max(10, width - padding.left - padding.right);
  const plotH = Math.max(10, height - padding.top - padding.bottom);

  const [xMin, xMax] = xDomain;
  const [yMin, yMax] = yDomain;
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;

  const sx = useCallback((t: number) => padding.left + ((t - xMin) / xRange) * plotW, [xMin, xRange, plotW, padding.left]);
  const sy = useCallback((y: number) => padding.top + (1 - (y - yMin) / yRange) * plotH, [yMin, yRange, plotH, padding.top]);

  const niceTicks = useCallback((min: number, max: number, count: number): number[] => {
    const range = max - min;
    if (range === 0) return [min];
    const rough = range / count;
    const exp = Math.floor(Math.log10(rough));
    const mantissa = rough / Math.pow(10, exp);
    let nice;
    if (mantissa <= 1) nice = 1;
    else if (mantissa <= 2) nice = 2;
    else if (mantissa <= 5) nice = 5;
    else nice = 10;
    const step = nice * Math.pow(10, exp);
    const ticks: number[] = [];
    const start = Math.ceil(min / step) * step;
    for (let v = start; v <= max + step * 0.001; v += step) {
      ticks.push(Math.round(v / step) * step);
    }
    return ticks;
  }, []);

  const xTicks = useMemo(() => niceTicks(xMin, xMax, 8), [xMin, xMax, niceTicks]);
  const yTicks = useMemo(() => niceTicks(yMin, yMax, 5), [yMin, yMax, niceTicks]);

  const curvePaths = useMemo(() => {
    return curves.map((curve) => {
      const points: string[] = [];
      let inGap = false;
      let prevValid = false;
      for (let i = 0; i <= SAMPLES; i++) {
        const t = xMin + (i / SAMPLES) * xRange;
        const y = curve.fn(t);
        const px = sx(t);
        const py = sy(y);
        if (isNaN(y) || !isFinite(y) || py < -10000 || py > 10000) {
          inGap = true;
          prevValid = false;
          continue;
        }
        if (inGap || !prevValid) {
          points.push(`M ${px} ${py}`);
          inGap = false;
        } else {
          points.push(`L ${px} ${py}`);
        }
        prevValid = true;
      }
      return { ...curve, path: points.join(' ') };
    });
  }, [curves, xMin, xRange, sx, sy]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!onHover || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const t = xMin + ((px - padding.left) / plotW) * xRange;
    if (t >= xMin && t <= xMax) {
      onHover(t);
    } else {
      onHover(null);
    }
  }, [onHover, xMin, xRange, plotW, padding.left]);

  const handleMouseLeave = useCallback(() => {
    if (onHover) onHover(null);
  }, [onHover]);

  const formatTick = (v: number) => {
    if (Math.abs(v) < 1e-10) return '0';
    if (Math.abs(v) >= 1000 || Math.abs(v) < 0.01) return v.toExponential(1);
    return Number(v.toFixed(3)).toString();
  };

  return (
    <div ref={containerRef} className={className} style={{ width: '100%' }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'block' }}
      >
        {/* Regions */}
        {regions.map((r, i) => (
          <rect
            key={`region-${i}`}
            x={sx(r.start)}
            y={padding.top}
            width={Math.max(0, sx(r.end) - sx(r.start))}
            height={plotH}
            fill={r.color}
            opacity={r.opacity ?? 0.08}
          />
        ))}

        {/* Riemann rectangles */}
        {rects.map((r, i) => {
          const y0 = sy(0);
          const y1 = sy(r.height);
          return (
            <rect
              key={`rect-${i}`}
              x={sx(r.x)}
              y={Math.min(y0, y1)}
              width={Math.max(0.5, sx(r.x + r.width) - sx(r.x) - 0.5)}
              height={Math.abs(y1 - y0)}
              fill={r.color}
              opacity={r.opacity ?? 0.25}
              stroke={r.color}
              strokeWidth={0.5}
              strokeOpacity={0.5}
            />
          );
        })}

        {/* Grid */}
        {showGrid && (
          <g>
            {xTicks.map((t, i) => (
              <line key={`gx-${i}`} x1={sx(t)} y1={padding.top} x2={sx(t)} y2={padding.top + plotH} stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} />
            ))}
            {yTicks.map((y, i) => (
              <line key={`gy-${i}`} x1={padding.left} y1={sy(y)} x2={padding.left + plotW} y2={sy(y)} stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} />
            ))}
          </g>
        )}

        {/* Axes */}
        {showAxes && (
          <g>
            {/* X axis */}
            {yMin <= 0 && yMax >= 0 ? (
              <line x1={padding.left} y1={sy(0)} x2={padding.left + plotW} y2={sy(0)} stroke="currentColor" strokeOpacity={0.3} strokeWidth={1} />
            ) : (
              <line x1={padding.left} y1={padding.top + plotH} x2={padding.left + plotW} y2={padding.top + plotH} stroke="currentColor" strokeOpacity={0.3} strokeWidth={1} />
            )}
            {/* Y axis */}
            {xMin <= 0 && xMax >= 0 ? (
              <line x1={sx(0)} y1={padding.top} x2={sx(0)} y2={padding.top + plotH} stroke="currentColor" strokeOpacity={0.3} strokeWidth={1} />
            ) : (
              <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + plotH} stroke="currentColor" strokeOpacity={0.3} strokeWidth={1} />
            )}
          </g>
        )}

        {/* Tick labels */}
        <g style={{ fontSize: 11, fill: 'currentColor', opacity: 0.5 }}>
          {xTicks.map((t, i) => (
            <text key={`tx-${i}`} x={sx(t)} y={padding.top + plotH + 18} textAnchor="middle">
              {formatTick(t)}
            </text>
          ))}
          {yTicks.map((y, i) => (
            <text key={`ty-${i}`} x={padding.left - 8} y={sy(y) + 4} textAnchor="end">
              {formatTick(y)}
            </text>
          ))}
        </g>

        {/* Axis labels */}
        {xLabel && (
          <text x={padding.left + plotW / 2} y={height - 4} textAnchor="middle" style={{ fontSize: 12, fill: 'currentColor', opacity: 0.6 }}>
            {xLabel}
          </text>
        )}
        {yLabel && (
          <text x={12} y={padding.top + plotH / 2} textAnchor="middle" transform={`rotate(-90 12 ${padding.top + plotH / 2})`} style={{ fontSize: 12, fill: 'currentColor', opacity: 0.6 }}>
            {yLabel}
          </text>
        )}

        {/* Vertical lines */}
        {vLines.map((v, i) => (
          <line key={`vl-${i}`} x1={sx(v.t)} y1={padding.top} x2={sx(v.t)} y2={padding.top + plotH} stroke={v.color} strokeWidth={1} strokeDasharray="4 4" opacity={0.5} />
        ))}

        {/* Curves */}
        {curvePaths.map((c, i) => (
          <path
            key={`curve-${i}`}
            d={c.path}
            fill="none"
            stroke={c.color}
            strokeWidth={c.width ?? 2.5}
            strokeDasharray={c.dashArray}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Cursor */}
        {cursorT !== null && cursorT >= xMin && cursorT <= xMax && (
          <line x1={sx(cursorT)} y1={padding.top} x2={sx(cursorT)} y2={padding.top + plotH} stroke={cursorColor} strokeWidth={1} strokeDasharray="3 3" opacity={0.7} />
        )}

        {/* Markers */}
        {markers.map((m, i) => (
          <g key={`marker-${i}`}>
            <circle cx={sx(m.t)} cy={sy(m.y)} r={m.size ?? 5} fill={m.color} stroke="white" strokeWidth={1.5} />
            {m.label && (
              <text x={sx(m.t) + 8} y={sy(m.y) - 8} style={{ fontSize: 11, fill: m.color, fontWeight: 600 }}>
                {m.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
