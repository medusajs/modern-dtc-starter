import Home from "@/pages/home"
import { createFileRoute } from "@tanstack/react-router"
import { getRegion, listRegions } from "@/lib/data/regions"
import { buildRegionsReturnPolicies } from "@/lib/utils/store-policies"
import { homeProductsQuery, productsInfiniteQueryOptions } from "@/lib/hooks/use-products"
import { getSiteUrl, listCountryCodes, STORE_NAME } from "@/lib/utils/site"

export const Route = createFileRoute("/$countryCode/")({
  loader: async ({ params, context }) => {
    const { countryCode } = params
    const { queryClient } = context

    // Fetch region for the country code
    const region = await queryClient.ensureQueryData({
      queryKey: ["region", countryCode],
      queryFn: () => getRegion({ country_code: countryCode }),
    })

    const regions = await listRegions({ fields: "id,metadata,*countries" })
    const countryCodes = listCountryCodes(regions)
    const returnPolicies = buildRegionsReturnPolicies(regions)

    if (!region) {
      return { countryCode, region: null, countryCodes, returnPolicies }
    }

    await queryClient.ensureInfiniteQueryData(
      productsInfiniteQueryOptions(homeProductsQuery(region.id))
    )

    return {
      countryCode,
      region,
      countryCodes,
      returnPolicies,
    }
  },
  headers: () => ({
    "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=600",
  }),
  head: ({ loaderData }) => {
    const siteUrl = getSiteUrl()
    const homeUrl = `${siteUrl}/${loaderData?.countryCode}`
    const countryCodes = loaderData?.countryCodes ?? []
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
        url: siteUrl,
        logo: `${siteUrl}/images/medusa.svg`,
        ...(loaderData?.returnPolicies?.length
          ? { hasMerchantReturnPolicy: loaderData.returnPolicies }
          : {}),
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
      links: [
        { rel: "canonical", href: homeUrl },
        ...countryCodes.map((code) => ({
          rel: "alternate",
          hrefLang: `en-${code.toUpperCase()}`,
          href: `${siteUrl}/${code}`,
        })),
        { rel: "alternate", hrefLang: "x-default", href: `${siteUrl}/` },
      ],
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
