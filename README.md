# Motion Explorer — Calculus Laboratory

An interactive calculus visualization tool for exploring derivatives, motion, numerical methods, and integration.

**[Launch the application →](https://calculus-motion-explorer-axfuj2ixr-srinidhi-kotteswaran.vercel.app/)**

---

## Project Evolution

Motion Explorer began as a small Python experiment for visualizing the relationship between position, velocity, and derivatives.

The original prototype was built with **Python, Streamlit, NumPy, Plotly, and SymPy**. It focused on interactive motion graphs and tangent-line visualization.

After experimenting with the prototype, I rebuilt the project using **React and TypeScript** and expanded it into a broader calculus laboratory. The current version includes symbolic differentiation, numerical differentiation, error analysis, critical-point and concavity analysis, Riemann sums, and interactive calculus challenges.

**Original prototype:** Python + Streamlit
**Current version:** React + TypeScript

---

## Screenshots

### Explore — Motion and Derivatives

The Explore mode connects position, velocity, acceleration, and jerk through synchronized graphs and an animated particle.

![Explore mode](screenshots/explore.png)

### Secant → Tangent

The secant-to-tangent visualization shows the derivative as a limit by allowing the step size `h` to approach zero.

![Secant to tangent](screenshots/secant-tangent.png)

### Numerical Differentiation

The Numerics laboratory compares finite-difference methods and visualizes the relationship between step size and numerical error.

![Numerical differentiation](screenshots/numerics.png)

### Function Analysis

The Analyze mode identifies critical points, increasing/decreasing intervals, concavity, and local extrema.

![Function analysis](screenshots/analyze.png)

---

## Overview

The central idea behind Motion Explorer is to make calculus **observable**.

A derivative can be introduced as a formula, but it can also be understood as a changing quantity. For a position function `s(t)`:

```text
s(t)     → position
s'(t)    → velocity
s''(t)   → acceleration
s'''(t)  → jerk
```

The application lets users interact with these relationships directly rather than treating each derivative as an isolated calculation.

The project also explores what happens when exact symbolic mathematics is replaced by numerical approximation.

---

## Features

### Explore

Visualizes the relationship between:

* Position
* Velocity
* Acceleration
* Jerk

The graphs, time control, and particle visualization are synchronized so changes in the function can be observed across multiple derivatives.

### Secant → Tangent

Visualizes the definition of the derivative.

A secant line is drawn between two points on a function, and the step size `h` can be reduced toward zero. The application compares the resulting secant slope with the exact derivative and calculates the error.

### Numerics

A numerical differentiation laboratory comparing:

* Forward differences
* Backward differences
* Central differences

The application calculates approximation errors and plots error against step size. This demonstrates an important numerical-computation tradeoff: decreasing `h` initially improves accuracy, but extremely small values can introduce floating-point error.

### Analyze

Automatically analyzes a function for:

* First and second derivatives
* Critical points
* Local maxima and minima
* Increasing/decreasing intervals
* Concavity
* Inflection points

### Integrate

Visualizes numerical integration using Riemann sums.

Users can change the interval, integration rule, and number of rectangles and compare the resulting approximation with a reference integral.

### Challenge

Generates calculus problems involving derivatives and particle motion, allowing users to apply concepts explored throughout the laboratory.

---

## Mathematical Concepts

The project brings together several ideas from calculus and numerical analysis:

**Differentiation**

* Derivatives as rates of change
* Higher-order derivatives
* Tangent lines
* Finite differences

**Motion**

* Position → velocity → acceleration
* Direction changes
* Interpreting derivatives physically

**Analysis**

* Critical points
* Extrema
* Increasing/decreasing behavior
* Concavity
* Inflection points

**Integration**

* Riemann sums
* Signed area
* Accumulated change
* Numerical approximation

**Numerical Methods**

* Forward and backward differences
* Central differences
* Truncation error
* Floating-point error
* Step-size selection

---

## Technologies

### Current Version

* **React**
* **TypeScript**
* **Vite**
* **Tailwind CSS**
* **KaTeX**
* **SVG**

### Original Prototype

* **Python**
* **Streamlit**
* **NumPy**
* **Plotly**
* **SymPy**

---

## Development Process

The project was built iteratively rather than starting with the current feature set.

The initial prototype established the basic relationship between a position function, its tangent line, and instantaneous velocity. From there, I expanded the project into separate computational laboratories.

The later version required building components for symbolic differentiation, numerical approximation, graphing, calculus analysis, and interactive controls.

AI coding tools were used during development to assist with implementation and debugging. I reviewed and tested the generated implementation and fixed issues encountered during development and deployment.

---

## Why I Built It

I built Motion Explorer because I was interested in the intersection of **mathematics, physics, and computer science**.

Calculus is often taught through symbolic manipulation, but many of its ideas describe things that are constantly changing. I wanted to experiment with whether those relationships could be made more intuitive through an interactive computational environment.

The project also gave me a way to explore a question that became increasingly important as the project grew:

> How can computation be used not just to calculate a mathematical result, but to help someone understand why the result behaves the way it does?

---

## Deployment

The current version is deployed with Vercel.

**Live application:**
https://calculus-motion-explorer-axfuj2ixr-srinidhi-kotteswaran.vercel.app/

**Source code:**
https://github.com/SrinidhiKotteswaran/calculus-motion-explorer

**Original Python prototype:**
https://github.com/SrinidhiKotteswaran/calculus-motion-visualizer
