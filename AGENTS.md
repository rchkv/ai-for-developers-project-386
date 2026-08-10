# AGENTS.md

Hexlet "AI for Developers" training project. The app is a calendar booking system defined in `requirements.md` (Russian); README just embeds it.

## Commands

- Compile TypeSpec: `npm run compile` (`npx tsp compile .`) — emits OpenAPI 3.1 to `tsp-output/schema/openapi.yaml` (configured in `tspconfig.yaml`; output is gitignored).
- Mock backend: `npm run mock` — compiles TypeSpec, generates realistic fake data via `scripts/generate-mock-openapi.mjs` into `mock/openapi.generated.yaml` (gitignored), and starts Prism (`prism mock`) on `http://localhost:4010`.
- Frontend: `cd ui && npm install && npm run dev` — Vite dev server on `http://localhost:3000`. Talks to the backend via `VITE_API_BASE_URL` (see `ui/.env.example`, defaults to `http://localhost:4010`, i.e. the Prism mock above).

## Architecture state

- `main.tsp` implements the calendar API from `requirements.md`: `Owner`, `Event` (event type, incl. `duration` in minutes), `Slot` models, plus `Owners`/`Events`/`Slots` interfaces. Booking is not a separate entity — a guest books by calling `POST /slots/{id}/book`, which flips `Slot.is_available` to `false`.
- Package manager is pinned to npm@12 (corepack). Root deps are TypeSpec v1.14.0 (`@typespec/http`, `@typespec/openapi`, `@typespec/openapi3`, `@typespec/rest`), `@stoplight/prism-cli` (mock server) and `yaml` (used by the mock-generation script).
- `ui/` is a separate frontend package (own `package.json`/`vite.config.js`), plain Vite + Vanilla JS (no framework), using `@shoelace-style/shoelace` web components for UI (Mantine was dropped — it's React-only and incompatible with the "no framework" requirement; see git history/PR discussion). It talks to the backend exclusively through the HTTP contract in `openapi.yaml`/`main.tsp`.
  - `ui/src/api/client.js` — thin fetch wrapper over the contract.
  - `ui/src/state/overrides.js` — sessionStorage overlay compensating for the fact that Prism's static-example mock does not persist state between requests (booking/creating/deleting doesn't actually change subsequent GETs from the mock). Not needed against a real stateful backend, but harmless.
  - `ui/src/router.js` — minimal path-based router; guest routes at `/` and `/events/:id`, owner routes under `/admin/*`.
  - `ui/scripts/copy-shoelace-assets.mjs` (postinstall) copies Shoelace's icon assets into `ui/public/shoelace` so they're served at a stable URL.


## Constraints (from requirements.md)

- No auth/registration: one implicit calendar owner for the admin side; guests book slots anonymously.
- A slot may not be double-booked, even across different event types — the API must enforce this.
- Booking window is 14 days from today.

## CI

`.github/workflows/hexlet-check.yml` runs the Hexlet autograder on every push. Do not edit or delete it or rename the repo.
