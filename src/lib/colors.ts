export const COLORS = {
  position: '#3b82f6',    // blue
  velocity: '#10b981',    // green
  acceleration: '#8b5cf6', // purple
  selected: '#f97316',   // orange
  warning: '#f59e0b',    // amber
  error: '#ef4444',      // red
  tangent: '#f97316',
  secant: '#10b981',
  neutral: '#64748b',
  grid: 'rgba(100, 116, 139, 0.08)',
};

export const LABELS = {
  position: 's(t)',
  velocity: 'v(t)',
  acceleration: 'a(t)',
  jerk: 'j(t)',
  snap: 's⁽⁴⁾(t)',
};

export const UNITS = {
  position: 'm',
  velocity: 'm/s',
  acceleration: 'm/s²',
  jerk: 'm/s³',
  snap: 'm/s⁴',
};

export const DERIVATIVE_NAMES = [
  { label: 'Position', symbol: 's(t)', unit: 'm', color: COLORS.position },
  { label: 'Velocity', symbol: "s'(t)", unit: 'm/s', color: COLORS.velocity },
  { label: 'Acceleration', symbol: "s''(t)", unit: 'm/s²', color: COLORS.acceleration },
  { label: 'Jerk', symbol: "s'''(t)", unit: 'm/s³', color: COLORS.warning },
  { label: 'Snap', symbol: 's⁽⁴⁾(t)', unit: 'm/s⁴', color: COLORS.neutral },
];
