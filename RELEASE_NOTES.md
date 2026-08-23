# Motion Explorer v1.0.0

This is the first stable milestone of the rebuilt web application.

## Highlights

- Interactive motion and higher-derivative visualization
- Secant-to-tangent convergence experiment
- Forward/backward/central numerical differentiation
- Floating-point error investigation
- Critical-point and concavity analysis
- Numerical integration and Riemann sums
- Procedurally generated calculus challenges
- Custom AST-based expression parsing and symbolic differentiation
- Math-engine verification and benchmarking commands
- Technical architecture, build-process, and limitation documentation

## Verification checklist

Before treating this release as final, run:

```bash
npm run test:math
npm run typecheck
npm run lint
npm run build
```

## Known limitations

See `docs/LIMITATIONS.md`. In particular, numerical root finding and graph sampling have finite resolution, and the symbolic engine intentionally supports a focused expression language rather than arbitrary computer algebra.
