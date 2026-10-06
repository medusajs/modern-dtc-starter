<p align="center">
  <a href="https://www.medusajs.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/59018053/229103275-b5e482bb-4601-46e6-8142-244f531cebdb.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    <img alt="Medusa logo" src="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    </picture>
  </a>
</p>
<h1 align="center">
  Medusa Fashion Starter
</h1>

<h4 align="center">
  <a href="https://docs.medusajs.com">Documentation</a> |
  <a href="https://www.medusajs.com">Website</a>
</h4>

<p align="center">
  Building blocks for digital commerce
</p>
<p align="center">
  <a href="https://github.com/medusajs/medusa/blob/develop/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Medusa is released under the MIT license." />
  </a>
  <a href="https://circleci.com/gh/medusajs/medusa">
    <img src="https://circleci.com/gh/medusajs/medusa.svg?style=shield" alt="Current CircleCI build status." />
  </a>
  <a href="https://github.com/medusajs/medusa/blob/develop/CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="PRs welcome!" />
  </a>
    <a href="https://www.producthunt.com/posts/medusa"><img src="https://img.shields.io/badge/Product%20Hunt-%231%20Product%20of%20the%20Day-%23DA552E" alt="Product Hunt"></a>
  <a href="https://discord.gg/xpCwq3Kfn8">
    <img src="https://img.shields.io/badge/chat-on%20discord-7289DA.svg" alt="Discord Chat" />
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=medusajs">
    <img src="https://img.shields.io/twitter/follow/medusajs.svg?label=Follow%20@medusajs" alt="Follow @medusajs" />
  </a>
</p>

A ready-to-launch fashion and apparel store built with Medusa. It pairs a Medusa backend, seeded with a minimalist activewear catalog, with a TanStack Start storefront you can customize and deploy as your own brand.

## Features

- Product catalog with color and size variants, and images per color
- Categories and curated collections
- Product search
- Cart, checkout, and customer accounts
- Order confirmation emails
- Content pages: about, our story, blog, FAQ, shipping, returns, and legal pages
- Demo data seeded automatically on the first migration

## Prerequisites

- [Node.js](https://nodejs.org/) v22.22+
- [pnpm](https://pnpm.io/) v10+
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)

## Installation

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/medusajs/fashion-starter.git
   cd fashion-starter
   pnpm install
   ```

2. Create `apps/backend/.env` and set the [backend environment variables](#backend).

3. Run the migrations. This also seeds the demo store data:

   ```bash
   cd apps/backend
   npx medusa db:migrate
   ```

4. Create an admin user:

   ```bash
   npx medusa user -e admin@example.com -p supersecret
   ```

5. Copy `apps/storefront/.env.example` to `apps/storefront/.env` and set the [storefront environment variables](#storefront). You can find the publishable API key in the Medusa Admin under **Settings → Publishable API Keys**.

## Usage

Start the backend and storefront together from the repository root:

```bash
pnpm dev
```

The Medusa Admin runs at `http://localhost:9000/app`. To run only one app, use `pnpm backend:dev` or `pnpm storefront:dev`.

## Configuration

### Backend

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection URL |
| `REDIS_URL` | Redis connection URL |
| `STORE_CORS` | Allowed origins for the storefront |
| `ADMIN_CORS` | Allowed origins for the Medusa Admin |
| `AUTH_CORS` | Allowed origins for authentication routes |
| `JWT_SECRET` | Secret used to sign JWTs |
| `COOKIE_SECRET` | Secret used to sign cookies |
| `SKIP_INITIAL_SEED` | Set to `true` to skip seeding the demo data |

To store uploaded files in S3 or Cloudflare R2, set the `S3_*` or `R2_*` variables used in `apps/backend/medusa-config.ts`.

### Storefront

| Variable | Description |
|----------|-------------|
| `VITE_MEDUSA_BACKEND_URL` | URL of the Medusa backend |
| `VITE_MEDUSA_PUBLISHABLE_KEY` | Publishable API key of the store's sales channel |

## Resources

- [Medusa Documentation](https://docs.medusajs.com)
- [Storefront Development](https://docs.medusajs.com/resources/storefront-development)
- [Deploy to Medusa Cloud](https://docs.medusajs.com/cloud)
