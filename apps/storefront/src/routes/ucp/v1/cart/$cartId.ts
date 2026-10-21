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
import { HttpTypes } from "@medusajs/types"
import { createFileRoute } from "@tanstack/react-router"

const CAPABILITY = "dev.ucp.shopping.cart"

const retrieveCart = async (cartId: string) => {
  try {
    const { cart } = await sdk.store.cart.retrieve(cartId, { fields: UCP_CART_FIELDS })
    return cart.completed_at ? null : cart
  } catch {
    return null
  }
}

const notFound = () => ucpError(CAPABILITY, 404, "not_found", "Cart not found")

export const Route = createFileRoute("/ucp/v1/cart/$cartId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const cart = await retrieveCart(params.cartId)
        if (!cart) return notFound()
        return ucpJson(CAPABILITY, toUcpCart(cart, cartContinueUrl(getRequestOrigin(request), cart)))
      },
      PUT: async ({ request, params }) => {
        const body = await readJsonBody(request)
        const items = parseLineItems(body?.line_items)
        if (!items) {
          return ucpError(
            CAPABILITY,
            400,
            "invalid_request",
            "line_items must be an array of { item: { id }, quantity } with quantity 1-100"
          )
        }

        const cart = await retrieveCart(params.cartId)
        if (!cart) return notFound()

        const desired = new Map(items.map((item) => [item.variant_id, item.quantity]))
        const existing = new Map(
          (cart.items ?? []).map((line: HttpTypes.StoreCartLineItem) => [line.variant_id, line])
        )

        try {
          for (const [variantId, line] of Array.from(existing)) {
            const quantity = variantId ? desired.get(variantId) : undefined
            if (quantity === undefined) {
              await sdk.store.cart.deleteLineItem(cart.id, line.id)
            } else if (quantity !== line.quantity) {
              await sdk.store.cart.updateLineItem(cart.id, line.id, { quantity })
            }
          }
          for (const [variantId, quantity] of Array.from(desired)) {
            if (!existing.has(variantId)) {
              await sdk.store.cart.createLineItem(cart.id, { variant_id: variantId, quantity })
            }
          }
        } catch {
          return ucpError(CAPABILITY, 422, "item_unavailable", "One or more items don't exist or can't be purchased")
        }

        const updated = await retrieveCart(cart.id)
        if (!updated) return notFound()
        return ucpJson(CAPABILITY, toUcpCart(updated, cartContinueUrl(getRequestOrigin(request), updated)))
      },
    },
  },
})
