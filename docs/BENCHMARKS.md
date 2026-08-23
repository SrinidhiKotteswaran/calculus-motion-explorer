# Math engine benchmarks

Run:

```bash
npm run benchmark:math
```

The benchmark measures parsing, symbolic differentiation/simplification, and repeated numerical evaluation across representative expressions.

Benchmark numbers depend on Node version, CPU, and background load. For a useful comparison, record the Node version, OS, CPU, expression set, iteration count, and each timing category. Use the benchmark for before/after comparisons on the same machine rather than claiming a universal speed score.

The math engine sits underneath several interactive modes. A more sophisticated symbolic transformation can also make derivative-driven visualizations more expensive, so benchmarking keeps performance discussions grounded in measured behavior.
