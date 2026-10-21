import { sdk } from "@/lib/utils/sdk"
import { getDefaultCountryCode } from "@/lib/utils/region"
import { getRequestOrigin, listCountryCodes, STORE_NAME } from "@/lib/utils/site"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = getRequestOrigin(request)

        const [{ regions }, { product_categories }, { collections }] =
          await Promise.all([
            sdk.store.region.list({ fields: "name,currency_code,*countries" }),
            sdk.store.category.list({
              fields: "name,handle",
              parent_category_id: "null",
              limit: 50,
            }),
            sdk.store.collection.list({ fields: "title,handle", limit: 50 }),
          ])

        const countryCode = getDefaultCountryCode(regions)
        const base = `${origin}/${countryCode}`
        const currencies = [
          ...Array.from(new Set(regions.map((r) => r.currency_code?.toUpperCase()).filter(Boolean))),
        ]
        const countries = listCountryCodes(regions)

        const body = `# ${STORE_NAME}

> Online clothing store. Ships to ${countries.length} countries. Prices in ${currencies.join(", ")}.

URLs are prefixed with a two-letter country code that sets currency and pricing, for example \`${base}\`. Available country codes: ${countries.join(", ")}.

## Shop
- [All products](${base}/store)
${product_categories.map((c) => `- [${c.name}](${base}/categories/${c.handle})`).join("\n")}
${collections.map((c) => `- [${c.title}](${base}/collections/${c.handle})`).join("\n")}
- Search: ${base}/search?q={query}

## Buying
- Product pages contain an add-to-cart form that posts \`product_id\`, \`variant_id\` and \`quantity\` to ${base}/cart/add.
- Preselect a variant with \`?variant={variant_id}\` on a product URL.
- [Cart](${base}/cart)

## Policies
- [Shipping information](${base}/shipping)
- [Return policy](${base}/returns)
- [Payments](${base}/payments)
- [Terms of service](${base}/terms)
- [Privacy policy](${base}/privacy)
- [Contact](${base}/contact)
- [FAQ](${base}/faq)

## For agents
- [Sitemap](${origin}/sitemap.xml)
`

        return new Response(body, {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        })
      },
    },
  },
})
