# Repository Guidelines

## Project Overview

- This repository contains a single-page tab title and favicon editor built with Next.js 15, React 18, TypeScript, Tailwind CSS, and shadcn/Radix UI components.
- Use Bun for dependency management and package scripts. Keep `bun.lock` in sync with dependency changes.
- The application uses the App Router under `src/app`. Reusable UI primitives live in `src/components/ui`, and shared helpers live in `src/lib`.
- Import application modules through the `@/*` alias when practical.

## Architecture and Runtime Constraints

- The production build is a static export. Keep `output: "export"` in `next.config.js` and keep Netlify's publish directory set to `out`.
- Do not commit generated or local artifacts such as `node_modules`, `.next`, `out`, `build`, `dist`, `output`, or `.netlify`.
- Shared editor state is encoded in URL query parameters. Default values should be omitted so generated URLs stay concise.
- Keep the server/static render and the client's first render deterministic. Read browser-only state such as `window.location.search` after mount unless an intentionally pre-hydration script is required.
- Netlify's `netlify/edge-functions/shared-title.ts` personalizes the exported HTML title per request. Keep its bindings limited to the editor document routes and escape query values as HTML text. Keep personalized responses uncached.
- The inline title script must run before hydration and continue following the current URL without a timeout. Publish React state to the URL and document title only after reading initial shared settings.
- Keep the editor title out of Next's `metadata` object: the explicit layout title belongs to the edge handler and inline script, and must tolerate their intentional text change during hydration.
- Do not introduce head-level third-party runtime scripts unless the application genuinely requires them. The deployed page should not depend on a CDN runtime to finish loading.
- Preserve localhost-only development-origin handling unless deployment requirements explicitly change.

## Code Conventions

- Keep TypeScript strict and avoid weakening compiler settings to work around errors.
- Add `"use client"` only to components that require browser APIs, state, effects, or other client-only behavior.
- Prefer existing shadcn/Radix primitives and the `cn` helper over duplicating UI infrastructure.
- Style components with Tailwind utilities and use the theme tokens defined in `src/app/globals.css`.
- Follow the existing naming patterns: PascalCase for React components and types, camelCase for functions and state, and UPPER_SNAKE_CASE for module constants.
- Preserve focused comments that explain browser, hydration, or deployment constraints. Avoid comments that merely restate the code.
- Format source files with Biome. Biome is configured for spaces, double quotes, and organized imports; do not perform unrelated formatting churn.

## Development and Verification

- Install dependencies with `bun install`.
- Run the development server with `bun run dev`.
- Run `bun run lint` after source changes. This performs the TypeScript no-emit check and the configured Next.js lint step.
- Run `bun run build` for changes that can affect rendering, hydration, routing, metadata, dependencies, configuration, or deployment.
- Run `bun run format` only when formatting is intended because it writes files in place.
- Run `bun run test` for response-handler regressions. Run `bunx playwright install chromium --only-shell` once, then `bun run test:e2e` to build the export and test title behavior in Chromium.
- Browser tests serve the production export through the real edge handler with a local implementation of Netlify's `context.next()`. They do not verify a deployed Netlify request chain; explicitly distinguish local checks from deployment verification.

## Commit Convention

- Write an imperative, sentence-style subject that describes the outcome, for example `Hydrate shared URLs from stable initial state`.
- Do not add Conventional Commit prefixes such as `feat:` or `fix:`; they are not used by this repository.
- Keep each commit focused on one coherent change.
- For non-trivial commits, use a body with this repository's established structure:
  - Start with a short paragraph explaining the problem and the resulting behavior.
  - Add `Constraint: ...` for relevant architectural or operational constraints.
  - Add one or more `Rejected: <alternative> | <reason>` lines when meaningful alternatives were considered.
  - Add `Confidence: high|medium|low`.
  - Add `Scope-risk: narrow|moderate|broad`.
  - Add `Directive: ...` for a durable rule discovered or established by the change.
  - Add one `Tested: ...` line per completed verification.
  - Add `Not-tested: ...` for relevant checks that were not performed.
- Keep body statements concrete and specific to the change; omit fields that genuinely do not apply rather than filling them with boilerplate.
- Never force-push over shared remote history unless replacing that history is explicitly intended and authorized.
