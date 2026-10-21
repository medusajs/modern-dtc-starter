import Home from "@/pages/home"
import { createFileRoute } from "@tanstack/react-router"
import { getRegion } from "@/lib/data/regions"
import { listProducts } from "@/lib/data/products"
import { queryKeys } from "@/lib/utils/query-keys"
import { getSiteUrl, STORE_NAME } from "@/lib/utils/site"

export const Route = createFileRoute("/$countryCode/")({
  loader: async ({ params, context }) => {
    const { countryCode } = params
    const { queryClient } = context

    // Fetch region for the country code
    const region = await queryClient.ensureQueryData({
      queryKey: ["region", countryCode],
      queryFn: () => getRegion({ country_code: countryCode }),
    })

    if (!region) {
      return { countryCode, region: null }
    }

    // Prefetch latest products for SSR (non-blocking)
    // FeaturedProducts component will use cached data when available
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.latest(4, region.id),
      queryFn: () =>
        listProducts({
          query_params: {
            limit: 4,
            order: "-created_at",
          },
          region_id: region.id,
        }),
    })

    return {
      countryCode,
      region,
    }
  },
  head: ({ loaderData }) => {
    const homeUrl = `${getSiteUrl()}/${loaderData?.countryCode}`
    const structuredData = [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: STORE_NAME,
        url: homeUrl,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${homeUrl}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: STORE_NAME,
        url: getSiteUrl(),
        logo: `${getSiteUrl()}/images/medusa.svg`,
      },
    ]
    const title = `Welcome to Medusa Store`
    const description = `Discover our curated collection of products. Browse our latest featured items and shop with confidence.`

    return {
      meta: [
        {
          title,
        },
        {
          name: "description",
          content: description,
        },
        {
          property: "og:title",
          content: title,
        },
        {
          property: "og:description",
          content: description,
        },
        {
          property: "og:type",
          content: "website",
        },
        {
          property: "twitter:card",
          content: "summary_large_image",
        },
        {
          property: "twitter:title",
          content: title,
        },
        {
          property: "twitter:description",
          content: description,
        },
      ],
      links: [{ rel: "canonical", href: homeUrl }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(structuredData),
        },
      ],
    }
  },
  component: Home,
})
