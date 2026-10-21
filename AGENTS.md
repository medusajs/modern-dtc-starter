# AGENTS.md

Modern DTC Starter: a pnpm + Turborepo monorepo with a Medusa v2 backend (`apps/backend`) and a TanStack Start storefront (`apps/storefront`).

## Before You Start

1. **Package manager**: read `packageManager` in the root `package.json` (`pnpm@10.12.3`), then confirm with the lockfile (`pnpm-lock.yaml`). Use `pnpm`, never `npm install` or `yarn`.
2. **Apps present**: only `apps/backend` and `apps/storefront` exist. There are no `packages/*` and no other optional apps.
3. **Load the matching Medusa skill**: `building-with-medusa` (backend), `building-storefronts` (storefront), `building-admin-dashboard-customizations` (admin UI).
4. **Read the package docs**: open `node_modules/@medusajs/<pkg>/AGENTS.md` for the `@medusajs/*` package you're about to use. See [Medusa Package Docs](#medusa-package-docs-node_modules).

## Where to Look

| Task | Path in this repo | Read first |
| --- | --- | --- |
| Custom API route | `apps/backend/src/api/store/<name>/route.ts` (see `best-selling/route.ts`) | `@medusajs/framework` |
| Middleware, store search config | `apps/backend/src/api/middlewares.ts` | `@medusajs/framework` |
| Search index definitions | `apps/backend/src/search/product.ts`, `src/search/helpers/` | `@medusajs/framework`, `@medusajs/medusa` |
| Seed data, data migrations | `apps/backend/src/migration-scripts/`, `src/scripts/seed.ts` | `@medusajs/framework`, `@medusajs/core-flows` |
| Order emails | `apps/backend/src/email-templates/` | `@react-email/components` |
| Admin extensions | `apps/backend/src/admin/` (widgets in `widgets/`, pages in `routes/`) | `@medusajs/admin-sdk`, `@medusajs/ui`, `@medusajs/icons` |
| Medusa config (modules, plugins, CORS) | `apps/backend/medusa-config.ts` | `@medusajs/framework`, `@medusajs/medusa` |
| Backend tests | `apps/backend/integration-tests/http/` | `@medusajs/test-utils` |
| Storefront data fetching | `apps/storefront/src/lib/data/`, `src/lib/hooks/`, SDK in `src/lib/utils/sdk.ts` | `@medusajs/js-sdk`, `@medusajs/types` |
| Storefront search | `apps/storefront/src/lib/search-client.ts`, `src/components/search/` | `@medusajs/instantsearch-adapter` |
| Storefront UI and pages | `apps/storefront/src/components/`, `src/pages/`, routes in `src/routes/` | `@medusajs/icons` |
| Lint failures (backend) | `apps/backend/eslint.config.ts`, root `eslint.config.ts` | `@medusajs/eslint-plugin` |

This repo has no workflows, custom modules, module links, subscribers, or jobs yet. Add them under `apps/backend/src/{workflows,modules,links,subscribers,jobs}/` following the `building-with-medusa` skill.

## Project Structure

```text
.
├── apps/
│   ├── backend/                  # Medusa v2 backend + admin
│   │   ├── integration-tests/http/
│   │   ├── src/
│   │   │   ├── admin/            # Admin extensions (SDK client in lib/)
│   │   │   ├── api/              # Custom API routes + middlewares.ts
│   │   │   ├── email-templates/  # React Email templates
│   │   │   ├── migration-scripts/# Initial seed + data migrations
│   │   │   ├── scripts/          # medusa exec scripts (seed.ts)
│   │   │   └── search/           # Search index definitions
│   │   ├── static/               # Seeded product images
│   │   └── medusa-config.ts
│   └── storefront/               # TanStack Start + Vite storefront
│       ├── scripts/              # generate-static-routes.ts
│       └── src/
│           ├── components/       # UI, sections, checkout, search
│           ├── lib/              # data/, hooks/, context/, utils/
│           ├── pages/            # Page components
│           └── routes/           # File-based routes ($countryCode/...)
├── eslint.config.ts
├── turbo.json
└── pnpm-workspace.yaml
```

## Commands

Run from the repo root unless noted.

| Command | What it does |
| --- | --- |
| `pnpm dev` | Backend (`:9000`, admin at `/app`) + storefront |
| `pnpm backend:dev` / `pnpm storefront:dev` | One app only |
| `pnpm build` | Builds both apps |
| `pnpm start` | Starts the backend only (storefront has no `start` script) |
| `pnpm --filter storefront serve` | Previews the built storefront |
| `pnpm lint` | Lints the backend only (`medusa lint`) |
| `pnpm --filter storefront exec eslint .` | Lints the storefront (it has no `lint` script) |
| `pnpm --filter backend test:integration:http` | Backend HTTP integration tests |

Database (run in `apps/backend`):

| Command | What it does |
| --- | --- |
| `npx medusa db:migrate` | Migrations + initial seed (migration scripts) |
| `npx medusa db:migrate:search` | Registers `src/search/*` indexes. Required after adding or changing an index |
| `npx medusa user -e <email> -p <password>` | Creates an admin user |

`pnpm test` runs nothing: no app defines a `test` script. Use the backend `test:*` scripts.

## Medusa Package Docs (node_modules)

Published `@medusajs/*` packages ship an `AGENTS.md` at `node_modules/@medusajs/<pkg>/AGENTS.md` (added in [medusajs/medusa#17382](https://github.com/medusajs/medusa/pull/17382)). It documents the API, examples, architecture, and gotchas for the **exact installed version**. Prefer it over memory.

Older Medusa versions don't include it. If it's missing, fall back to the skills and the docs MCP server.

Find them (works with npm, yarn, and pnpm):

```bash
find node_modules apps/*/node_modules -maxdepth 6 -path "*/@medusajs/*/AGENTS.md" 2>/dev/null
```

| Package | Read it for |
| --- | --- |
| `@medusajs/framework` | API routes, middlewares, workflows SDK, modules, links, subscribers, jobs, `query`, utils |
| `@medusajs/medusa` | Core commerce modules, built-in routes, config defaults, search |
| `@medusajs/core-flows` | Built-in workflows to reuse for commerce mutations (installed via `@medusajs/medusa`) |
| `@medusajs/draft-order` | Draft orders plugin |
| `@medusajs/admin-sdk`, `@medusajs/ui`, `@medusajs/icons` | Admin widgets/routes, UI components, icons |
| `@medusajs/js-sdk`, `@medusajs/types` | Store/admin API client and shared types |
| `@medusajs/instantsearch-adapter` | Storefront search via InstantSearch |
| `@medusajs/test-utils` | `medusaIntegrationTestRunner`, module test runner |
| `@medusajs/eslint-plugin` | Lint rules and how to fix them |
| `@medusajs/cli` | `medusa` CLI commands |

In backend code, import from `@medusajs/framework/*` subpaths (`@medusajs/framework/http`, `/utils`, `/types`, `/workflows-sdk`), not from `@medusajs/utils`, `@medusajs/types`, etc. directly.

## Medusa Skills & MCP

Use sources in this order:

1. The package `AGENTS.md` in `node_modules`.
2. Medusa skills ([install guide](https://docs.medusajs.com/learn/introduction/build-with-llms-ai/agentic-skills)):

   ```bash
   /plugin marketplace add medusajs/medusa-agent-skills
   /plugin install medusa-dev@medusa
   ```

3. The docs MCP server, or plain-text docs.

Docs MCP server:

```bash
claude mcp add --transport http medusa https://docs.medusajs.com/mcp
```

Without MCP, use <https://docs.medusajs.com/llms.txt>, or append `.md` to any `docs.medusajs.com` page URL.

**Medusa Cloud MCP** (projects deployed on Medusa Cloud):

```bash
claude mcp add --transport http medusa-cloud https://cloud.medusajs.com/mcp
```

It exposes deployments, build/runtime logs, environment variables, and store data. Use it to debug deploys and production errors.

- Never handle Cloud credentials.
- Never reveal environment variable values unless the user asks.
- Confirm before any write to a live store.

## Gotchas

- `npx medusa db:migrate` ends with an interactive link-sync prompt and hangs in non-interactive shells. Migrations have already finished by then.
- Search returning nothing usually means `db:migrate:search` wasn't run. The app boots without errors and the index stays empty.
- Price currencies in `apps/backend/src/search/helpers/pricing.ts` must match `SEARCH_PRICE_CURRENCIES` in `apps/storefront/src/lib/search-client.ts`.
- The storefront has its own ESLint setup; the root `eslint.config.ts` ignores `apps/storefront/**`.

## Common Mistakes

- Using `npm` or `yarn` instead of `pnpm`.
- Guessing Medusa APIs from memory when the package `AGENTS.md` or the docs MCP is available.
- Mutating commerce data (carts, orders, products) through raw module service calls instead of `@medusajs/core-flows` workflows.
- Running `pnpm test` and assuming tests passed. It runs nothing.
- Editing `src/search/*` without re-running `npx medusa db:migrate:search`.

## Off-Limits

- `node_modules/`: read the package docs there, but never edit installed packages.
- `apps/storefront/src/routeTree.gen.ts`: generated by TanStack Router.
- `apps/backend/.medusa/`, `apps/storefront/dist/`, `.turbo/`: build output.
- `.env` files: never commit or print their values.
