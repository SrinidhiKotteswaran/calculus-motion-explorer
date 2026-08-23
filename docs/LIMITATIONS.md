# Technical limitations and failure analysis

Motion Explorer is intentionally an educational computational tool, not a full computer algebra system or arbitrary-precision numerical package. Documenting where it can fail is part of the project.

## Symbolic mathematics

- The expression language is deliberately smaller than a general CAS.
- Symbolic differentiation does not prove that two different ASTs are algebraically equivalent.
- Absolute value is non-differentiable at zeros of its argument; the derivative expression is therefore meaningful only away from those points.
- General power differentiation can introduce logarithms and therefore inherits the domain restrictions of the real-valued logarithm.

## Numerical analysis

- Finite differences trade truncation error against floating-point round-off. Making `h` smaller eventually stops improving the approximation.
- Root finding samples a continuous interval, so extremely narrow or pathological roots can be difficult to detect numerically.
- Numerical graphs are sampled; a discontinuity or very narrow feature can be visually missed if it falls between samples.
- Functions with poles or domain restrictions can produce undefined values. The visualization layer treats non-finite samples as gaps rather than connecting them through the invalid region.

## Why keep these limitations visible?

A useful numerical tool should make its assumptions visible. The goal of Motion Explorer is not to pretend that computation produces perfect answers; it is to let students experiment with the places where mathematical models, algorithms, and finite-precision computers behave differently.
