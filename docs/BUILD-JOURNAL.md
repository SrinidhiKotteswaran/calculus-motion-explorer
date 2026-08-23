# Build journal

Motion Explorer was built in stages rather than from a complete specification.

## 1. Python prototype

The first version was a small Streamlit application using Python, SymPy, NumPy, and Plotly. It focused on position/velocity graphs, derivatives, and tangent lines.

## 2. Rebuild as a web application

As the idea expanded, I wanted finer control over interaction and presentation. I rebuilt the project with React, TypeScript, and Vite.

## 3. Custom symbolic engine

The original prototype relied on SymPy. In the web version I implemented a focused expression parser, AST representation, numerical evaluator, symbolic differentiator, and simplifier. This became the foundation for the derivative-driven visualizations.

## 4. Numerical methods became experiments

Finite differences became a laboratory for truncation error and floating-point cancellation. The Secant -> Tangent mode similarly turned the definition of a derivative into an animation rather than a static formula.

## 5. Analysis and integration

I added critical-point and concavity analysis, Riemann-sum visualizations, and comparisons between numerical methods. These features use the same expression/evaluation infrastructure rather than separate hard-coded calculators.

## 6. Hardening

As the project became larger, I started treating edge cases as part of the work: invalid expressions, undefined domains, non-finite numerical results, root-finding edge cases, and generated problems that could accidentally have no valid answer.

## 7. What changed in my thinking

The biggest shift was from “make a graph” to “make an experiment.” A graph shows a result. An experiment lets someone change an assumption, watch the result respond, and investigate why.
