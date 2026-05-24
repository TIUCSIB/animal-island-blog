# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains the React + TypeScript app.
- `src/pages/` holds route-level pages such as `HomePage.tsx` and `AdminPage.tsx`.
- `src/components/` contains reusable UI, including `components/ui/` and island-specific components in `components/island/`.
- `src/routes/` defines React Router configuration; `src/lib/` contains shared utilities and API helpers.
- `src/data/` and `src/assets/` store local content and static assets.
- `server/` contains the local JSON API (`index.mjs`) and persisted data in `server/data/`.
- `public/` serves static files; `dist/` is build output and should not be edited manually.

## Build, Test, and Development Commands
- `npm run dev` ！ start the Vite frontend with HMR.
- `npm run dev:api` ！ start the local API server on `http://localhost:8787`.
- `npm run build` ！ type-check and create a production build in `dist/`.
- `npm run preview` ！ preview the production build locally.
- `npm run lint` ！ run ESLint on the repository.

Run frontend and API in separate terminals during local development.

## Coding Style & Naming Conventions
- Use TypeScript and functional React components.
- Follow existing 2-space indentation and semicolon-free style.
- Use `PascalCase` for components (`IslandMusicPlayer.tsx`), `camelCase` for functions/variables, and `kebab-case` only where already established for asset or style filenames.
- Prefer the `@/` alias for imports from `src/`.
- Keep route pages in `src/pages/`, shared primitives in `src/components/ui/`, and feature-specific UI close to its feature folder.
- Linting is enforced with ESLint (`eslint.config.js`); run `npm run lint` before opening a PR.

## Testing Guidelines
- No automated test suite is configured yet. At minimum, run `npm run lint` and `npm run build` before submitting changes.
- For UI changes, manually verify `/`, `/about`, and `/admin`.
- If you add tests, place them next to the source file as `*.test.ts` or `*.test.tsx` and prefer Vitest-compatible patterns.

## Commit & Pull Request Guidelines
- This repository currently has no commit history, so use clear Conventional Commit style messages such as `feat: add admin post editor` or `fix: handle empty gallery state`.
- PRs should include: a short summary, affected areas, manual test notes, and screenshots/GIFs for UI updates.
- Link related issues when applicable and note any API/data changes under `server/data/`.

## Security & Configuration Tips
- The frontend proxies `/api` to `http://localhost:8787` via Vite.
- Set `ADMIN_PASSWORD` when running `npm run dev:api` if you need a non-default admin password.
- Do not commit secrets or manually edit generated files in `dist/`.
