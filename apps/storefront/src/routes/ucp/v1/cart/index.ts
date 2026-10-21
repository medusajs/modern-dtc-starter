import { cachedOnServer } from "@/lib/utils/server-cache"
import { createCartWithItems, resolveRequestRegion } from "@/lib/utils/server-cart"
import { sdk } from "@/lib/utils/sdk"
import { getRequestOrigin } from "@/lib/utils/site"
import {
  cartContinueUrl,
  parseLineItems,
  readJsonBody,
  toUcpCart,
  UCP_CART_FIELDS,
  ucpError,
  ucpJson,
} from "@/lib/utils/ucp"
import { createFileRoute } from "@tanstack/react-router"

const CAPABILITY = "dev.ucp.shopping.cart"
const IDEMPOTENCY_TTL_MS = 10 * 60 * 1000

export const Route = createFileRoute("/ucp/v1/cart/")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await readJsonBody(request)
        const items = parseLineItems(body?.line_items ?? [])
        if (!body || !items) {
          return ucpError(
            CAPABILITY,
            400,
            "invalid_request",
            "line_items must be an array of { item: { id }, quantity } with quantity 1-100"
          )
        }

        const context = (body.context ?? {}) as { address_country?: unknown }
        const resolved = await resolveRequestRegion(
          request,
          typeof context.address_country === "string" ? context.address_country : undefined
        )
        if (!resolved) {
          return ucpError(CAPABILITY, 400, "unsupported_country", "This store doesn't sell to that country")
        }

        const createCart = () => createCartWithItems(resolved.region.id, items)
        const idempotencyKey = request.headers.get("idempotency-key")

        let cartId: string
        try {
          cartId = idempotencyKey
            ? await cachedOnServer(`ucp-cart:${idempotencyKey}`, IDEMPOTENCY_TTL_MS, createCart)
            : await createCart()
        } catch {
          return ucpError(CAPABILITY, 422, "item_unavailable", "One or more items don't exist or can't be purchased")
        }

        const { cart } = await sdk.store.cart.retrieve(cartId, { fields: UCP_CART_FIELDS })
        return ucpJson(CAPABILITY, toUcpCart(cart, cartContinueUrl(getRequestOrigin(request), cart)), {
          status: 201,
        })
      },
    },
  },
})
