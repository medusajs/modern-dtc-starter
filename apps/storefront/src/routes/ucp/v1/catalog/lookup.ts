import { resolveRequestRegion } from "@/lib/utils/server-cart"
import { sdk } from "@/lib/utils/sdk"
import { getRequestOrigin } from "@/lib/utils/site"
import { readJsonBody, toUcpProduct, UCP_PRODUCT_FIELDS, ucpError, ucpJson } from "@/lib/utils/ucp"
import { HttpTypes } from "@medusajs/types"
import { createFileRoute } from "@tanstack/react-router"

const CAPABILITY = "dev.ucp.shopping.catalog.lookup"
const MAX_IDS = 50

export const Route = createFileRoute("/ucp/v1/catalog/lookup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await readJsonBody(request)
        const ids = Array.isArray(body?.ids)
          ? (body.ids as unknown[]).filter((id): id is string => typeof id === "string" && id.length > 0)
          : []
        if (!ids.length || ids.length > MAX_IDS) {
          return ucpError(CAPABILITY, 400, "invalid_request", `"ids" must contain 1-${MAX_IDS} identifiers`)
        }

        const context = (body?.context ?? {}) as { address_country?: unknown }
        const resolved = await resolveRequestRegion(
          request,
          typeof context.address_country === "string" ? context.address_country : undefined
        )
        if (!resolved) {
          return ucpError(CAPABILITY, 400, "unsupported_country", "This store doesn't sell to that country")
        }

        const productIds = ids.filter((id) => id.startsWith("prod_"))
        const variantIds = ids.filter((id) => id.startsWith("variant_"))
        const handles = ids.filter((id) => !id.startsWith("prod_") && !id.startsWith("variant_"))
        const common = { region_id: resolved.region.id, fields: UCP_PRODUCT_FIELDS, limit: MAX_IDS }

        const results = await Promise.all([
          productIds.length ? sdk.store.product.list({ ...common, id: productIds }) : null,
          handles.length ? sdk.store.product.list({ ...common, handle: handles }) : null,
          variantIds.length
            ? sdk.store.product.list({ ...common, variants: { id: variantIds } } as HttpTypes.StoreProductListParams)
            : null,
        ])

        const products = new Map<string, HttpTypes.StoreProduct>()
        for (const result of results) {
          result?.products.forEach((product) => products.set(product.id, product))
        }

        const found = new Set<string>()
        for (const product of Array.from(products.values())) {
          found.add(product.id)
          if (product.handle) found.add(product.handle)
          product.variants?.forEach((variant) => found.add(variant.id))
        }

        const base = `${getRequestOrigin(request)}/${resolved.countryCode}/products`

        return ucpJson(CAPABILITY, {
          products: Array.from(products.values()).map((product) =>
            toUcpProduct(product, resolved.region.currency_code, `${base}/${product.handle}`)
          ),
          messages: ids
            .filter((id) => !found.has(id))
            .map((id) => ({ type: "info", code: "not_found", content: `No product or variant found for "${id}"` })),
        })
      },
    },
  },
})
