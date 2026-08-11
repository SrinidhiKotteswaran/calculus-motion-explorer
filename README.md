# Motion Explorer — Calculus Laboratory

An interactive calculus visualization laboratory built to explore derivatives, motion, numerical methods, function analysis, and integration.

**[Launch Motion Explorer →](https://calculus-motion-explorer-axfuj2ixr-srinidhi-kotteswaran.vercel.app/)**

---

## Project Evolution

Motion Explorer began as a Python prototype for visualizing the relationship between position, velocity, and derivatives.

The original version was built with **Python, Streamlit, NumPy, Plotly, and SymPy**. It focused on interactive motion graphs and tangent-line visualization.

I later rebuilt the project using **React and TypeScript** and expanded it into a multi-part calculus laboratory. The current version combines symbolic computation, numerical methods, interactive visualization, and calculus-based problem solving.

**Original prototype:** Python + Streamlit
**Current version:** React + TypeScript

---

## Screenshots

### Explore

![Explore](screenshots/explore.png)

Explore the relationship between position, velocity, acceleration, and jerk through synchronized graphs and animated particle motion.

### Secant → Tangent

![Secant to Tangent](screenshots/secant-tangent.png)

Visualize the derivative as a limit by watching a secant line approach the tangent line as `h → 0`.

### Numerics

![Numerics](screenshots/numerics.png)

Compare numerical differentiation methods and investigate how step size affects approximation error and floating-point error.

### Analyze

![Analyze](screenshots/analyze.png)

Automatically investigate critical points, extrema, increasing/decreasing intervals, concavity, and inflection points.

### Integrate

![Integrate](screenshots/integrate.png)

Explore Riemann sums and compare numerical approximations of definite integrals with reference values.

### Challenge

![Challenge](screenshots/challenge.png)

Practice calculus concepts through procedurally generated problems involving derivatives and particle motion.

---

## What the Laboratory Does

### 1. Explore

The Explore laboratory connects multiple derivatives of a position function:

```text
s(t)   → position
s'(t)  → velocity
s''(t) → acceleration
s'''(t) → jerk
```

The graphs and particle visualization remain synchronized as the function and time change.

### 2. Secant → Tangent

This section focuses on the geometric definition of the derivative.

The user can change the step size `h` and observe the secant line approach the tangent line. The application also calculates the difference quotient, exact derivative, and approximation error.

### 3. Numerics

The Numerics laboratory compares:

* Forward differences
* Backward differences
* Central differences

It plots error across different step sizes and demonstrates why making `h` smaller does not always produce a better numerical result.

### 4. Analyze

The Analyze laboratory performs automated calculus analysis, including:

* Symbolic first and second derivatives
* Critical-point detection
* Local maxima and minima
* Increasing/decreasing intervals
* Concavity
* Inflection points

### 5. Integrate

The Integrate laboratory uses Riemann sums to approximate definite integrals.

Users can change the integration interval, number of rectangles, and approximation rule, then compare the numerical result with a reference integral.

### 6. Challenge

The Challenge laboratory generates calculus problems involving derivatives and particle motion.

Problems connect symbolic differentiation with physical interpretation, such as determining when a particle changes direction.

---

## Mathematical Ideas

The project brings together concepts from several areas of calculus and numerical computation.

**Differential calculus**

* Derivatives as rates of change
* Higher-order derivatives
* Tangent lines
* Critical points
* Extrema
* Concavity
* Inflection points

**Calculus and physics**

* Position
* Velocity
* Acceleration
* Jerk
* Direction changes

**Integral calculus**

* Riemann sums
* Signed area
* Accumulated change
* Numerical integration

**Numerical computation**

* Finite-difference methods
* Truncation error
* Floating-point error
* Step-size selection

---

## Technologies

### Current Version

* React
* TypeScript
* Vite
* Tailwind CSS
* KaTeX
* SVG

### Original Prototype

* Python
* Streamlit
* NumPy
* Plotly
* SymPy

---

## Development Process

The project developed through several iterations.

The original Python prototype began with a simple motion visualization: a position function, its tangent line, and the relationship between slope and velocity.

After experimenting with that version, I expanded the idea into a broader calculus laboratory. The current version required implementing separate systems for symbolic differentiation, numerical differentiation, error analysis, function analysis, numerical integration, graphing, and interactive controls.

AI coding tools were used during development to assist with implementation and debugging. I reviewed and tested the generated code and fixed issues that appeared during development and deployment.

---

## Why I Built It

I wanted to explore the intersection of **mathematics, physics, and computer science**.

A derivative can be introduced as a symbolic rule, but it can also represent something physical and changing. Motion Explorer was an attempt to make that connection visible and interactive.

As the project developed, I became particularly interested in the difference between **exact mathematical computation and numerical approximation**—and how visualization can make that distinction easier to understand.

---

## Deployment

The current version is deployed using Vercel.

**Live application:**
https://calculus-motion-explorer-axfuj2ixr-srinidhi-kotteswaran.vercel.app/

**Current source code:**
https://github.com/SrinidhiKotteswaran/calculus-motion-explorer

**Original Python prototype:**
https://github.com/SrinidhiKotteswaran/calculus-motion-visualizer
