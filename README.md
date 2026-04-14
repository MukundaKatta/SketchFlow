# SketchFlow — Wireframe-to-code converter — generate HTML/CSS from structured component specs in TypeScript

Wireframe-to-code converter — generate HTML/CSS from structured component specs in TypeScript.

## Why SketchFlow

SketchFlow exists to make this workflow practical. Wireframe-to-code converter — generate html/css from structured component specs in typescript. It favours a small, inspectable surface over sprawling configuration.

## Features

- Development server with hot reload
- Test suite
- Production build pipeline
- Included test suite
- Dedicated documentation folder

## Tech Stack

- **Runtime:** Node.js, TypeScript
- **Tooling:** Jest

## How It Works

The codebase is organised into `docs/`, `src/`, `tests/`. The primary entry point is `src/index.ts`.

## Getting Started

```bash
npm install
npm run dev
```

## Usage

```bash
npm run dev
# Application starts on its configured port
```

## Project Structure

```
SketchFlow/
├── .env.example
├── CONTRIBUTING.md
├── Makefile
├── README.md
├── docs/
├── jest.config.js
├── package.json
├── src/
├── tests/
├── tsconfig.json
```