import { listProducts } from "@/lib/data/products"
import { getRegion } from "@/lib/data/regions"
import { sanitize } from "@/lib/utils/sanitize"
import Search from "@/pages/search"
import { createFileRoute, notFound } from "@tanstack/react-router"

const SEARCH_PAGE_SIZE = 24

export const Route = createFileRoute("/$countryCode/search")({
  validateSearch: (search: Record<string, unknown>): { q?: string; page?: number } => ({
    q: typeof search.q === "string" ? search.q.slice(0, 200) : undefined,
    page: Number(search.page) > 1 ? Math.floor(Number(search.page)) : undefined,
  }),
  loaderDeps: ({ search }) => ({ q: search.q?.trim() ?? "", page: search.page ?? 1 }),
  loader: async ({ params, context, deps }) => {
    const { countryCode } = params
    const { queryClient } = context

    const region = await queryClient.ensureQueryData({
      queryKey: ["region", countryCode],
      queryFn: () => getRegion({ country_code: countryCode }),
    })

    if (!region) {
      throw notFound()
    }

    const results = deps.q
      ? await listProducts({
          page_param: deps.page,
          query_params: {
            q: deps.q,
            limit: SEARCH_PAGE_SIZE,
            fields: "id,title,handle,thumbnail,*images,*variants.calculated_price",
          },
          region_id: region.id,
        })
      : { products: [], count: 0, next_page: null }

    return sanitize({
      countryCode,
      region,
      query: deps.q,
      page: deps.page,
      ...results,
    })
  },
  head: ({ loaderData }) => {
    const query = loaderData?.query
    const title = query ? `Search results for "${query}" | Medusa Store` : "Search | Medusa Store"

    return {
      meta: [
        { title },
        { name: "description", content: "Search our products." },
        { name: "robots", content: "noindex, follow" },
      ],
    }
  },
  component: Search,
})
