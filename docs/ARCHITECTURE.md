# SketchFlow Architecture

## Overview

SketchFlow is a wireframe-to-code converter that transforms structured component specifications into production-ready HTML and CSS. It follows a pipeline architecture with clear separation between parsing, rendering, and styling.

## System Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Wireframe   │────▶│  SketchFlow  │────▶│  HTML + CSS  │
│    Spec      │     │    Engine    │     │   Output     │
└──────────────┘     └──────────────┘     └──────────────┘
                           │
                     ┌─────┴─────┐
                     │           │
                ┌────▼───┐ ┌────▼───┐
                │ Config │ │ Utils  │
                └────────┘ └────────┘
```

## Module Responsibilities

### `src/core.ts` — SketchFlow Engine

The central class that orchestrates the entire pipeline:

- **`parseSpec(spec)`** — Validates and normalises a wireframe specification, assigning IDs where missing.
- **`addComponent(type, props)`** — Programmatic API for building specs incrementally.
- **`renderComponent(component)`** — Dispatches to type-specific renderers to produce HTML fragments.
- **`generateHTML(components)`** — Iterates all components and concatenates their HTML output.
- **`generateCSS(components)`** — Produces a complete stylesheet including reset, component rules, and responsive media queries.
- **`generatePage(spec)`** — Combines HTML and CSS into a standalone `<!DOCTYPE html>` page.

### `src/config.ts` — Configuration

Manages default settings and environment variable overrides:

- Theme (light/dark)
- Primary colour
- Font family
- Responsive breakpoints
- CSS reset toggle
- Output directory

### `src/utils.ts` — Utilities

Pure helper functions with no side effects:

- **HTML** — `escapeHtml`, `wrapTag`, `buildAttributes`, `selfClosingTag`
- **CSS** — `cssRule`, `mediaQuery`, `indent`
- **Colour** — `hexToRgb`, `rgbToHex`, `lightenColor`, `darkenColor`
- **Text** — `toClassName`

### `src/index.ts` — Public API & CLI

Re-exports all public types and functions. When executed directly (`ts-node src/index.ts`), it runs a built-in demo that outputs a sample HTML page.

## Component Types

| Type     | HTML Output         | Key Props                      |
|----------|---------------------|--------------------------------|
| header   | `<header>`          | text                           |
| nav      | `<nav>`             | links[]                        |
| hero     | `<section>`         | text, subtitle                 |
| card     | `<div>`             | text, subtitle                 |
| form     | `<form>`            | fields[{label, type, name}]    |
| footer   | `<footer>`          | text                           |
| grid     | `<div>` (CSS grid)  | columns, children[]            |
| button   | `<button>`          | text, variant                  |

## Data Flow

1. User defines a `WireframeSpec` (JSON or programmatic).
2. `parseSpec()` normalises the input and stores components.
3. `generateHTML()` maps each component through its type-specific renderer.
4. `generateCSS()` produces matching styles using the active configuration.
5. `generatePage()` wraps everything in a valid HTML5 document.

## Design Decisions

- **No runtime dependencies** — The core engine uses only Node.js built-ins and TypeScript.
- **Component isolation** — Each component renders independently, making the system easy to extend.
- **Config layering** — Defaults → environment variables → constructor overrides, giving maximum flexibility.
- **HTML escaping by default** — All user-provided text is escaped to prevent injection.

## Extending SketchFlow

To add a new component type:

1. Add the type to the `ComponentType` union.
2. Implement a `renderXxx()` method returning an HTML string.
3. Add a case in `renderComponent()`.
4. Add CSS rules in `componentCSS()`.
5. Write tests.
