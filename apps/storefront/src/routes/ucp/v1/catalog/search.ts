import { resolveRequestRegion } from "@/lib/utils/server-cart"
import { sdk } from "@/lib/utils/sdk"
import { getRequestOrigin } from "@/lib/utils/site"
import { readJsonBody, toUcpProduct, UCP_PRODUCT_FIELDS, ucpError, ucpJson } from "@/lib/utils/ucp"
import { createFileRoute } from "@tanstack/react-router"

const CAPABILITY = "dev.ucp.shopping.catalog.search"
const MAX_LIMIT = 50

export const Route = createFileRoute("/ucp/v1/catalog/search")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await readJsonBody(request)
        if (!body) {
          return ucpError(CAPABILITY, 400, "invalid_request", "Request body must be a JSON object")
        }

        const query = typeof body.query === "string" ? body.query.trim().slice(0, 200) : ""
        const pagination = (body.pagination ?? {}) as { limit?: unknown; cursor?: unknown }
        const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), MAX_LIMIT)
        const offset = Math.max(parseInt(String(pagination.cursor ?? "0"), 10) || 0, 0)
        const context = (body.context ?? {}) as { address_country?: unknown }

        const resolved = await resolveRequestRegion(
          request,
          typeof context.address_country === "string" ? context.address_country : undefined
        )
        if (!resolved) {
          return ucpError(CAPABILITY, 400, "unsupported_country", "This store doesn't sell to that country")
        }

        const { products, count } = await sdk.store.product.list({
          ...(query ? { q: query } : {}),
          limit,
          offset,
          region_id: resolved.region.id,
          fields: UCP_PRODUCT_FIELDS,
        })

        const base = `${getRequestOrigin(request)}/${resolved.countryCode}/products`
        const nextOffset = offset + products.length

        return ucpJson(CAPABILITY, {
          products: products.map((product) =>
            toUcpProduct(product, resolved.region.currency_code, `${base}/${product.handle}`)
          ),
          pagination: {
            has_next_page: nextOffset < count,
            cursor: nextOffset < count ? String(nextOffset) : undefined,
            total_count: count,
          },
          messages: [],
        })
      },
    },
  },
})
