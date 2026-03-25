# Contributing to SketchFlow

Thank you for your interest in contributing to SketchFlow! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/sketchflow.git
   cd sketchflow
   ```
3. **Install** dependencies:
   ```bash
   npm install
   ```
4. **Create a branch** for your work:
   ```bash
   git checkout -b feat/my-feature
   ```

## Development Workflow

```bash
# Build the project
make build

# Run tests
make test

# Run the demo
make dev
```

## Project Structure

```
src/
  index.ts    — Public API & CLI entry point
  core.ts     — SketchFlow class & component renderers
  config.ts   — Configuration loading
  utils.ts    — HTML, CSS, and color utilities
tests/
  core.test.ts — Unit tests
```

## Adding a New Component

1. Add the type name to the `ComponentType` union in `src/core.ts`.
2. Create a `renderXxx()` private method that returns an HTML string.
3. Add a case to the `renderComponent()` switch statement.
4. Add CSS generation logic in `componentCSS()`.
5. Write tests in `tests/core.test.ts`.

## Code Style

- Use TypeScript strict mode.
- Prefer explicit return types on public methods.
- Use descriptive variable names.
- Document public APIs with JSDoc comments.

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) spec:

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `test:` — adding or updating tests
- `refactor:` — code change that neither fixes a bug nor adds a feature

## Pull Requests

1. Ensure all tests pass: `make test`
2. Ensure the project builds cleanly: `make build`
3. Write a clear PR description explaining the change.
4. Reference any related issues.

## Code of Conduct

Be respectful, constructive, and inclusive. We are all here to build something great together.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
