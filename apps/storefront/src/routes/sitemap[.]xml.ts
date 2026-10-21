import { sdk } from "@/lib/utils/sdk"
import { getRequestOrigin, listCountryCodes } from "@/lib/utils/site"
import { createFileRoute } from "@tanstack/react-router"

const STATIC_PATHS = [
  "",
  "/store",
  "/about",
  "/our-story",
  "/faq",
  "/contact",
  "/shipping",
  "/returns",
  "/payments",
  "/privacy",
  "/terms",
]

const PAGE_SIZE = 200

async function listAll<T>(
  fetchPage: (offset: number) => Promise<{ items: T[]; count: number }>
): Promise<T[]> {
  const all: T[] = []
  let offset = 0
  for (;;) {
    const { items, count } = await fetchPage(offset)
    all.push(...items)
    offset += PAGE_SIZE
    if (offset >= count || items.length === 0) return all
  }
}

const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`)

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = getRequestOrigin(request)

        const [{ regions }, products, categories, collections] = await Promise.all([
          sdk.store.region.list({ fields: "id,*countries" }),
          listAll(async (offset) => {
            const res = await sdk.store.product.list({
              fields: "handle,updated_at",
              limit: PAGE_SIZE,
              offset,
            })
            return { items: res.products, count: res.count }
          }),
          listAll(async (offset) => {
            const res = await sdk.store.category.list({
              fields: "handle,updated_at",
              limit: PAGE_SIZE,
              offset,
            })
            return { items: res.product_categories, count: res.count }
          }),
          listAll(async (offset) => {
            const res = await sdk.store.collection.list({
              fields: "handle,updated_at",
              limit: PAGE_SIZE,
              offset,
            })
            return { items: res.collections, count: res.count }
          }),
        ])

        const entries: { loc: string; lastmod?: string }[] = []

        for (const countryCode of listCountryCodes(regions)) {
          const base = `${origin}/${countryCode}`
          for (const path of STATIC_PATHS) {
            entries.push({ loc: `${base}${path}` })
          }
          for (const product of products) {
            if (!product.handle) continue
            entries.push({
              loc: `${base}/products/${product.handle}`,
              lastmod: product.updated_at ? String(product.updated_at) : undefined,
            })
          }
          for (const category of categories) {
            if (!category.handle) continue
            entries.push({
              loc: `${base}/categories/${category.handle}`,
              lastmod: category.updated_at ? String(category.updated_at) : undefined,
            })
          }
          for (const collection of collections) {
            if (!collection.handle) continue
            entries.push({
              loc: `${base}/collections/${collection.handle}`,
              lastmod: collection.updated_at ? String(collection.updated_at) : undefined,
            })
          }
        }

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...entries.map(
            ({ loc, lastmod }) =>
              `<url><loc>${escapeXml(loc)}</loc>${
                lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ""
              }</url>`
          ),
          `</urlset>`,
        ].join("\n")

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
          },
        })
      },
    },
  },
})
