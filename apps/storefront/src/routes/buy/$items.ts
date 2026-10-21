import {
  cartCookie,
  createCartWithItems,
  findMissingVariantIds,
  resolveRequestRegion,
} from "@/lib/utils/server-cart"
import { createFileRoute } from "@tanstack/react-router"

const MAX_QUANTITY = 100
const ITEM_PATTERN = /^([A-Za-z0-9._-]+|~[A-Za-z0-9_-]+):([1-9][0-9]*)$/

const decodeItemId = (token: string) =>
  token.startsWith("~")
    ? Buffer.from(token.slice(1), "base64url").toString("utf8")
    : token

const parseItems = (raw: string) => {
  const items: { variant_id: string; quantity: number }[] = []
  for (const pair of decodeURIComponent(raw).split(",")) {
    const match = pair.match(ITEM_PATTERN)
    if (!match) return null
    const quantity = Number(match[2])
    if (quantity > MAX_QUANTITY) return null
    items.push({ variant_id: decodeItemId(match[1]), quantity })
  }
  return items.length ? items : null
}

export const Route = createFileRoute("/buy/$items")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const noStore = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" }

        const items = parseItems(params.items)
        if (!items) {
          return new Response("Malformed permalink. Use /buy/{variant_id}:{quantity},...", {
            status: 400,
            headers: noStore,
          })
        }

        const url = new URL(request.url)
        const resolved = await resolveRequestRegion(
          request,
          url.searchParams.get("context/address_country") ?? undefined
        )
        if (!resolved) {
          return new Response("This store does not ship to the requested country", {
            status: 400,
            headers: noStore,
          })
        }

        const missing = await findMissingVariantIds(
          items.map((item) => item.variant_id),
          resolved.region.id
        )
        if (missing.length) {
          return new Response(`Unknown items: ${missing.join(", ")}`, {
            status: 404,
            headers: noStore,
          })
        }

        let cartId: string
        try {
          cartId = await createCartWithItems(resolved.region.id, items)
        } catch {
          return new Response("One or more items in this link can't be purchased", {
            status: 400,
            headers: noStore,
          })
        }

        return new Response(null, {
          status: 303,
          headers: {
            ...noStore,
            Location: `/${resolved.countryCode}/checkout`,
            "Set-Cookie": cartCookie(cartId),
          },
        })
      },
    },
  },
})
