# AGENTS.md

Hexlet "AI for Developers" training project. The app is a calendar booking system defined in `requirements.md` (Russian); README just embeds it.

## Commands

- Compile TypeSpec: `npx tsp compile .` — emits OpenAPI 3.1 to `tsp-output/schema/openapi.yaml` (configured in `tspconfig.yaml`; output is gitignored). There is **no npm script** for this.
- `npm start` — Vite dev server on port 3000; no frontend source files exist yet, so it only serves an empty page.o

## Architecture state

- `main.tsp` implements the calendar API from `requirements.md`: `Owner`, `Event` (event type, incl. `duration` in minutes), `Slot` models, plus `Owners`/`Events`/`Slots` interfaces. Booking is not a separate entity — a guest books by calling `POST /slots/{id}/book`, which flips `Slot.is_available` to `false`.
- Package manager is pinned to npm@12 (corepack). Deps are TypeSpec v1.14.0 (`@typespec/http`, `@typespec/openapi`, `@typespec/openapi3`, `@typespec/rest`).


## Constraints (from requirements.md)

- No auth/registration: one implicit calendar owner for the admin side; guests book slots anonymously.
- A slot may not be double-booked, even across different event types — the API must enforce this.
- Booking window is 14 days from today.

## CI

`.github/workflows/hexlet-check.yml` runs the Hexlet autograder on every push. Do not edit or delete it or rename the repo.
