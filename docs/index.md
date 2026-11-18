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
> Every result series has one entry per input value (`value[i]` belongs to `values[i]`), \
> starting with `null` until enough values are available. \
> Every indicator also exists as incremental function (e.g. `incrementalSma`) for live data: \
> push one value at a time and get exactly the same values as from the batch function. \
> Indicators expose no third-party types; adapters for Promises and [Effect](https://effect.website) are included.

## Ideas

Calculation of common indicators used for stock market trading, commodity trading and many more. \
`trade-indicators` shall fail early and never throw Errors. Instead every indicator returns a `Result`,
which is either `{ ok: true, value }` or `{ ok: false, error }`. \
Internally it is built with [Effect](https://effect.website), but none of its types are part of the indicators' API. \
For convenience, `toPromise` unwraps a `Result` to a Promise (still enforcing error handling)
and `toEffectResult` converts it to an Effect `Result`.

Calculations use plain JavaScript `Number` (IEEE 754 double precision). \
Rounding differences are around 1e-12 relative, far below any price resolution.
