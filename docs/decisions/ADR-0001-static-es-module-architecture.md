# ADR-0001: Static ES-module architecture

Status: Accepted

## Decision
Use semantic HTML, CSS, vanilla JavaScript ES modules, explicit JSON metadata, and a small build/publishing layer.

## Rationale
The application primarily loads data, selects concepts, manages URL-addressable state, and renders media. A runtime framework would add more dependency and abstraction surface than product value in Version 1.
