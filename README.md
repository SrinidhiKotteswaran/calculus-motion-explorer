# Motion Explorer

An interactive calculus visualization tool built around the connection between derivatives and motion.

**Live site:** [calculus-motion-explorer-axfuj2ixr-srinidhi-kotteswaran.vercel.app](https://calculus-motion-explorer-axfuj2ixr-srinidhi-kotteswaran.vercel.app/)

## What it does

Motion Explorer lets you experiment with calculus instead of only working through symbolic problems.

The current version has six sections:

* **Explore** — position, velocity, acceleration, and higher derivatives
* **Secant → Tangent** — visualizes the difference quotient approaching the derivative
* **Numerics** — compares numerical differentiation methods and their errors
* **Analyze** — finds critical points, increasing/decreasing intervals, concavity, and inflection points
* **Integrate** — visualizes Riemann sums and compares them with a reference integral
* **Challenge** — generates calculus problems involving derivatives and motion

## Screenshots

### Explore

![Explore](screenshots/explore.png)

### Secant → Tangent

![Secant → Tangent](screenshots/secant-tangent.png)

### Numerics

![Numerics](screenshots/numerics.png)

### Analyze

![Analyze](screenshots/analyze.png)

### Integrate

![Integrate](screenshots/integrate.png)

### Challenge

![Challenge](screenshots/challenge.png)

## Why I made it

I started this project because I wanted a better way to visualize what derivatives actually represent.

The first prototype was much smaller. It was written in Python with Streamlit, SymPy, NumPy, and Plotly and focused mainly on position, velocity, tangent lines, and derivatives.

That prototype was useful for figuring out the idea, but I eventually wanted more control over the interface and interactions. I also wanted to turn it into something that covered more of the calculus topics I was working with.

I rebuilt the project in React and TypeScript and expanded it into the current version.

### Prototype → current version

**Original Python prototype:**
[calculus-motion-visualizer](https://github.com/SrinidhiKotteswaran/calculus-motion-visualizer)

**Current application:**
React + TypeScript + Vite

The two repositories are intentionally separate so the original prototype and the later rebuild can be compared.

## Technical details

The application is split into a few main pieces:

* `src/lib/mathEngine.ts` — function parsing, evaluation, and symbolic differentiation
* `src/lib/numerics.ts` — finite-difference calculations and numerical error
* `src/lib/analysis.ts` — critical points, intervals, and concavity
* `src/components/Graph.tsx` — graph rendering
* `src/components/ExploreMode.tsx` — motion visualization
* `src/components/SecantTangentMode.tsx` — secant/tangent visualization
* `src/components/NumericsMode.tsx` — numerical differentiation
* `src/components/AnalyzeMode.tsx` — derivative and concavity analysis
* `src/components/IntegrateMode.tsx` — Riemann sums
* `src/components/ChallengeMode.tsx` — generated problems

## Technology

* React
* TypeScript
* Vite
* Tailwind CSS
* KaTeX

The original prototype used:

* Python
* Streamlit
* SymPy
* NumPy
* Plotly

## A few things I wanted to investigate

One of the parts I found most interesting was numerical differentiation.

For example, the current Numerics section compares forward, backward, and central differences and plots error over different step sizes. Making `h` smaller does not indefinitely make the approximation better: eventually floating-point effects become important.

The Secant → Tangent section approaches the derivative from another direction, showing the difference quotient as `h` becomes smaller.

These were some of the ideas that pushed the project beyond the original motion-only prototype.

## Development

This project is still an ongoing experiment. The current version grew out of the original Python prototype rather than being planned as a finished application from the beginning.

I am continuing to use the project to learn more about numerical methods, interactive visualization, and building mathematical software for the web.
