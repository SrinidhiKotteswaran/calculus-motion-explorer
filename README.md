# Motion Explorer

An interactive calculus laboratory for exploring derivatives, motion, numerical methods, and graphical analysis.

**[Live Demo](https://calculus-motion-explorer-axfuj2ixr-srinidhi-kotteswaran.vercel.app/)**

## What is Motion Explorer?

Motion Explorer started as a small experiment: could I make calculus concepts easier to understand by connecting the mathematics to motion and interactive graphs?

The first version focused primarily on position, velocity, tangent lines, and derivatives. I built that prototype in Python using Streamlit, SymPy, NumPy, and Plotly.

After working with the prototype, I wanted to move beyond a single motion visualization. I wanted the project to become a more complete environment where someone could **explore, calculate, and investigate calculus** rather than simply view a graph.

That led me to rebuild the application using **React and TypeScript**.

## From Prototype to Current Version

The change in technology was intentional.

Python was useful for the initial prototype because it let me quickly experiment with symbolic mathematics, numerical calculations, and interactive graphs. Once the concept worked, however, I wanted more control over the browser interface, interactions, animations, and overall structure of the application.

The current version is therefore not a separate project, but an expansion of the original idea.

**Python prototype → React/TypeScript rebuild → interactive calculus laboratory**

The original prototype is preserved here:

**[View the Python Prototype](https://github.com/SrinidhiKotteswaran/calculus-motion-visualizer)**

## What You Can Explore

### Explore

Investigate the relationship between position, velocity, acceleration, and higher derivatives through synchronized graphs and live measurements.

### Secant → Tangent

Visualize the definition of the derivative by watching a secant line approach a tangent line as the step size approaches zero.

### Numerics

Compare forward, backward, and central finite-difference methods and investigate how step size affects numerical error and floating-point behavior.

### Analyze

Explore critical points, increasing/decreasing intervals, concavity, and inflection points through automatically generated graphical and sign-chart analysis.

### Integrate

Visualize Riemann sums and compare numerical approximations with reference integrals while connecting accumulated area to displacement.

### Challenge

Work through procedurally generated calculus and motion problems involving derivatives and particle motion.

## Why I Built It

Calculus is often taught as a collection of rules for differentiating and integrating functions. I wanted to explore the ideas underneath those rules.

Motion provides a natural connection:

**position → velocity → acceleration → higher derivatives**

From there, the project expanded into a broader question: what would a calculus environment look like if students could *see* the mathematical relationships they are normally asked to manipulate symbolically?

Motion Explorer is my attempt at exploring that idea.

## Screenshots

### Explore

![Explore mode](screenshots/explore.png)

### Secant → Tangent

![Secant to Tangent mode](screenshots/secant-tangent.png)

### Numerics

![Numerics mode](screenshots/numerics.png)

### Analyze

![Analyze mode](screenshots/analyze.png)

### Integrate

![Integrate mode](screenshots/integrate.png)

### Challenge

![Challenge mode](screenshots/challenge.png)

## Technology

**Current version**

* React
* TypeScript
* Vite
* Tailwind CSS
* KaTeX

**Original prototype**

* Python
* Streamlit
* SymPy
* NumPy
* Plotly

## Project Structure

The current application separates the mathematical engine from the interface:

* `src/lib/mathEngine.ts` — expression parsing and symbolic differentiation
* `src/lib/numerics.ts` — numerical differentiation and error analysis
* `src/lib/analysis.ts` — critical points, intervals, and concavity
* `src/components/ExploreMode.tsx` — motion visualization
* `src/components/SecantTangentMode.tsx` — derivative limit visualization
* `src/components/NumericsMode.tsx` — numerical differentiation laboratory
* `src/components/AnalyzeMode.tsx` — calculus analysis tools
* `src/components/IntegrateMode.tsx` — Riemann-sum visualization
* `src/components/ChallengeMode.tsx` — generated calculus problems

## Development

This project was developed iteratively, beginning with a small Python prototype and evolving into the current browser-based application.

The prototype helped establish the core concept. Rebuilding it allowed me to rethink the interface, expand the mathematical tools, and experiment with a more modular architecture.

The goal was not simply to make a calculator, but to make the underlying relationships in calculus easier to investigate.

## License

This project is intended primarily as an educational and portfolio project.
