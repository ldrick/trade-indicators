---
title: Introduction
permalink: /
nav_order: 1
has_children: false
has_toc: false
---

## Trade Indicators

> Trade Indicators written in pure functional Typescript. \
> Results will be Either<Error, Big[] | BigObject> using: \
> 🚀 [fp-ts](https://github.com/gcanti/fp-ts) \
> 🌟 [big.js](https://github.com/MikeMcl/big.js/)

## Ideas

Calculation of common indicators used for stock market trading, commodity trading and many more. \
`trade-indicators` shall fail early and never throw Errors. Instead it provides the Error or Result wrapped in Either.
To achieve this goal, `trade-indicators` uses fp-ts. \
For convenience use, it provides the possibility to unwrap to Promise, still enforcing an Error-Handling.

Besides that the maximum possible precision of results shall be delivered. \
JavaScript Ecosystem uses `Number`, which has some unprecise effects. To mitigate these, `trade-indicators` uses big.js.
