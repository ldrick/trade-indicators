---
title: Introduction
permalink: /
nav_order: 1
has_children: false
has_toc: false
---

## Trade Indicators

> Trade Indicators written in pure functional TypeScript. \
> No function throws: every indicator returns a `Result`, \
> either `{ ok: true, value }` or `{ ok: false, error }`. \
> The public API exposes no third-party types; adapters for Promises and fp-ts are included.

## Ideas

Calculation of common indicators used for stock market trading, commodity trading and many more. \
`trade-indicators` shall fail early and never throw Errors. Instead every indicator returns a `Result`,
which is either `{ ok: true, value }` or `{ ok: false, error }`. \
Internally it is built with a functional library, but none of its types are part of the public API. \
For convenience, `toPromise` unwraps a `Result` to a Promise (still enforcing error handling)
and `toEither` converts it to an fp-ts compatible `Either`.

Calculations use plain JavaScript `Number` (IEEE 754 double precision). \
Inputs are already `Number`s, so arbitrary-precision decimals would not add meaningful accuracy, but cost a lot of performance.
Rounding differences are far below any price resolution (around 1e-12 relative).
