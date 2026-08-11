interface ParticleProps {
  position: number;
  velocity: number;
  acceleration: number;
  minT: number;
  maxT: number;
  playing: boolean;
}

export function ParticleTrack({ position, velocity, acceleration, minT, maxT }: ParticleProps) {
  const width = 800;
  const height = 80;
  const padding = 40;
  const trackY = 50;
  const trackW = width - padding * 2;

  const sx = (t: number) => padding + ((t - minT) / (maxT - minT || 1)) * trackW;

  // Scale velocity for vector display
  const vScale = 30;
  const aScale = 20;
  const vLen = Math.min(80, Math.abs(velocity) * vScale);
  const aLen = Math.min(50, Math.abs(acceleration) * aScale);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      {/* Track */}
      <line x1={padding} y1={trackY} x2={width - padding} y2={trackY} stroke="currentColor" strokeOpacity={0.2} strokeWidth={2} />
      {/* Tick marks */}
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
        <g key={i}>
          <line x1={padding + f * trackW} y1={trackY - 6} x2={padding + f * trackW} y2={trackY + 6} stroke="currentColor" strokeOpacity={0.2} strokeWidth={1} />
          <text x={padding + f * trackW} y={trackY + 20} textAnchor="middle" style={{ fontSize: 10, fill: 'currentColor', opacity: 0.4 }}>
            {(minT + f * (maxT - minT)).toFixed(1)}
          </text>
        </g>
      ))}

      {/* Position marker */}
      <circle cx={sx(position)} cy={trackY} r={8} fill="#3b82f6" stroke="white" strokeWidth={2} />

      {/* Velocity vector */}
      {Math.abs(velocity) > 0.01 && (
        <g>
          <line
            x1={sx(position)}
            y1={trackY}
            x2={sx(position) + (velocity > 0 ? vLen : -vLen)}
            y2={trackY}
            stroke="#10b981"
            strokeWidth={2.5}
            markerEnd="url(#varrow)"
          />
          <text x={sx(position) + (velocity > 0 ? vLen + 6 : -vLen - 6)} y={trackY - 6} textAnchor={velocity > 0 ? 'start' : 'end'} style={{ fontSize: 10, fill: '#10b981', fontWeight: 600 }}>
            v
          </text>
        </g>
      )}

      {/* Acceleration vector */}
      {Math.abs(acceleration) > 0.01 && (
        <g>
          <line
            x1={sx(position)}
            y1={trackY + 18}
            x2={sx(position) + (acceleration > 0 ? aLen : -aLen)}
            y2={trackY + 18}
            stroke="#8b5cf6"
            strokeWidth={2}
            markerEnd="url(#aarrow)"
          />
          <text x={sx(position) + (acceleration > 0 ? aLen + 6 : -aLen - 6)} y={trackY + 22} textAnchor={acceleration > 0 ? 'start' : 'end'} style={{ fontSize: 10, fill: '#8b5cf6', fontWeight: 600 }}>
            a
          </text>
        </g>
      )}

      <defs>
        <marker id="varrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#10b981" />
        </marker>
        <marker id="aarrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#8b5cf6" />
        </marker>
      </defs>
    </svg>
  );
}
