# Math engine architecture

Motion Explorer uses a small custom symbolic-math engine rather than delegating expression parsing and differentiation to a third-party CAS.

## Pipeline

```text
user expression
      ↓
   tokenizer
      ↓
 recursive-descent parser
      ↓
      AST
   ↙       ↘
evaluator  differentiator
   ↓           ↓
 numeric     derivative AST
 values          ↓
             simplifier
                 ↓
             evaluator
```

## Abstract syntax tree

Expressions are represented as a recursive `Ast` type with nodes for numeric literals, variables and constants (`t`, `pi`, `e`), binary operators (`+`, `-`, `*`, `/`, `^`), unary negation, named functions, and absolute value.

This representation lets the same expression be evaluated numerically or transformed symbolically.

## Symbolic differentiation

`differentiate()` recursively applies calculus rules to the AST. The implementation includes constant and variable rules, sum and difference, product and quotient rules, constant-power and general power rules, and chain-rule forms for supported trigonometric, inverse-trigonometric, hyperbolic, exponential, logarithmic, and square-root functions.

The resulting AST is passed through `simplify()` to remove common zero/one factors and evaluate constant subexpressions.

## Why build it myself?

The original Python prototype used SymPy. That was useful for proving the idea, but rebuilding the core expression pipeline in TypeScript gave me control over how the math connects to the visualizations. It also forced me to understand parsing, tree representations, recursive derivative rules, and numerical evaluation rather than treating symbolic math as a black box.

## Boundaries

This is an educational symbolic engine, not a general-purpose computer algebra system. It supports a focused expression language used by Motion Explorer; it does not attempt algebraic equivalence proving, arbitrary symbolic integration, or every possible mathematical function.

For non-smooth expressions such as `|t|`, the symbolic derivative is only meaningful away from the cusp. Domain restrictions and floating-point behavior are handled numerically rather than pretending every expression has a finite value everywhere.
