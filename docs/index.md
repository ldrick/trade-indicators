---
title: Introduction
permalink: /
nav_order: 1
has_children: false
has_toc: false
---

## Trade Indicators

> Trade Indicators written in pure functional Typescript. \
> Results will be \
> `Either<Error, ReadonlyArray<number> | Readonly<Record<string, ReadonlyArray<number>>>>` \
> depending on what is returned using this amazing library: \
> 🚀 [fp-ts](https://github.com/gcanti/fp-ts)

## Ideas

Calculation of common indicators used for stock market trading, commodity trading and many more. \
`trade-indicators` shall fail early and never throw Errors. Instead it provides the Error or Result wrapped in Either.
To achieve this goal, `trade-indicators` uses fp-ts. \
For convenience use, it provides the possibility to unwrap to Promise, still enforcing an Error-Handling.

Calculations use plain JavaScript `Number` (IEEE 754 double precision). \
Inputs are already `Number`s, so arbitrary-precision decimals would not add meaningful accuracy, but cost a lot of performance.
Rounding differences are far below any price resolution (around 1e-12 relative).
