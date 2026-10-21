import { retrieveProduct } from "@/lib/data/products"
import { getRegion, listRegions } from "@/lib/data/regions"
import {
  buildReturnPolicy,
  buildShippingDetails,
  getRegionPolicies,
} from "@/lib/utils/store-policies"
import { cachedOnServer } from "@/lib/utils/server-cache"
import ProductDetails from "@/pages/product"
import { HttpTypes } from "@medusajs/types"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { sanitize } from "@/lib/utils/sanitize"
import { isVariantInStock } from "@/lib/utils/product"
import { getSiteUrl, listCountryCodes, STORE_NAME } from "@/lib/utils/site"

const SCHEMA_IN_STOCK = "https://schema.org/InStock"
const SCHEMA_OUT_OF_STOCK = "https://schema.org/OutOfStock"
const PRODUCT_TTL_MS = 60 * 1000
const PRODUCT_STALE_MS = 10 * 60 * 1000
const PRODUCT_FIELDS =
  "*variants, +variants.inventory_quantity, +variants.manage_inventory, +variants.allow_backorder, +variants.calculated_price, *variants.images, *images, *options, *options.values, *collection, *tags"

export const Route = createFileRoute("/$countryCode/products/$handle")({
  validateSearch: (search: Record<string, unknown>): { variant?: string } => ({
    variant: typeof search.variant === "string" ? search.variant : undefined,
  }),
  loader: async ({ params, context }) => {
    const { countryCode, handle } = params
    const { queryClient } = context

    const region = await queryClient.ensureQueryData({
      queryKey: ["region", countryCode],
      queryFn: () => getRegion({ country_code: countryCode }),
    })

    if (!region || !handle) {
      throw notFound()
    }

    const [product, regions] = await Promise.all([
      queryClient.ensureQueryData({
        queryKey: ["product", handle, region.id],
        queryFn: async () => {
          try {
            return await cachedOnServer(
              `product:${handle}:${region.id}`,
              PRODUCT_TTL_MS,
              () => retrieveProduct({ handle, region_id: region.id, fields: PRODUCT_FIELDS }),
              PRODUCT_STALE_MS
            )
          } catch {
            throw notFound()
          }
        },
      }),
      listRegions({ fields: "id,*countries" }),
    ])

    return sanitize({
      countryCode,
      region,
      product: product as HttpTypes.StoreProduct,
      countryCodes: listCountryCodes(regions),
    })
  },
  headers: () => ({
    "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=600",
    Vary: "Accept",
  }),
  head: ({ loaderData }) => {
    const { product, region } = loaderData || {}

    if (!product) {
      return {
        meta: [
          {
            title: "Product Not Found | Medusa Store",
          },
        ],
      }
    }

    const siteUrl = getSiteUrl()
    const countryCode = loaderData?.countryCode ?? ""
    const productUrl = `${siteUrl}/${countryCode}/products/${product.handle}`
    const currency = region?.currency_code?.toUpperCase()
    const images =
      product.images?.map((img: HttpTypes.StoreProductImage) => img.url).filter(Boolean) || []
    const description = product.description || product.title
    const policies = getRegionPolicies(region)
    const brand = { "@type": "Brand", name: STORE_NAME }

    const buildOffer = (variant: HttpTypes.StoreProductVariant, url: string) => ({
      "@type": "Offer",
      url,
      sku: variant.sku || undefined,
      price: variant.calculated_price?.calculated_amount?.toFixed(2),
      priceCurrency: currency,
      availability: isVariantInStock(variant) ? SCHEMA_IN_STOCK : SCHEMA_OUT_OF_STOCK,
      itemCondition: "https://schema.org/NewCondition",
      ...(policies
        ? {
            shippingDetails: buildShippingDetails(policies, countryCode, currency ?? ""),
            hasMerchantReturnPolicy: buildReturnPolicy(policies, countryCode),
          }
        : {}),
    })

    const variants = (product.variants ?? []).filter(
      (v: HttpTypes.StoreProductVariant) => v.calculated_price?.calculated_amount != null
    )

    const structuredData =
      variants.length > 1
        ? {
            "@context": "https://schema.org",
            "@type": "ProductGroup",
            name: product.title,
            description,
            image: images,
            brand,
            url: productUrl,
            productGroupID: product.id,
            variesBy: product.options?.map((o: HttpTypes.StoreProductOption) => o.title),
            hasVariant: variants.map((variant: HttpTypes.StoreProductVariant) => {
              const variantUrl = `${productUrl}?variant=${variant.id}`
              return {
                "@type": "Product",
                name: `${product.title} - ${variant.title}`,
                sku: variant.sku || undefined,
                image: variant.images?.[0]?.url || images[0],
                additionalProperty: variant.options?.map((o: HttpTypes.StoreProductOptionValue) => ({
                  "@type": "PropertyValue",
                  name: product.options?.find(
                    (opt: HttpTypes.StoreProductOption) => opt.id === o.option_id
                  )?.title,
                  value: o.value,
                })),
                offers: buildOffer(variant, variantUrl),
              }
            }),
          }
        : {
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.title,
            description,
            image: images,
            brand,
            sku: variants[0]?.sku || undefined,
            url: productUrl,
            offers: variants[0] ? buildOffer(variants[0], productUrl) : undefined,
          }

    const cheapestVariant = variants.reduce(
      (min: HttpTypes.StoreProductVariant | undefined, v: HttpTypes.StoreProductVariant) =>
        !min || v.calculated_price!.calculated_amount! < min.calculated_price!.calculated_amount!
          ? v
          : min,
      undefined
    )
    const anyInStock = variants.some(isVariantInStock)

    // Get first product image for preloading (critical for LCP)
    const firstImageUrl = product.images?.[0]?.url || product.thumbnail

    return {
      meta: [
        {
          title: `${product.title} | Medusa Store`,
        },
        {
          name: "description",
          content: product.description || "Product details",
        },
        {
          property: "og:title",
          content: `${product.title} | Medusa Store`,
        },
        {
          property: "og:description",
          content:
            product.description || "Check out this product on Medusa Store",
        },
        {
          property: "og:image",
          content: product.thumbnail || "",
        },
        { property: "og:type", content: "product" },
        { property: "og:url", content: productUrl },
        ...(cheapestVariant
          ? [
              {
                property: "product:price:amount",
                content: cheapestVariant.calculated_price!.calculated_amount!.toFixed(2),
              },
              { property: "product:price:currency", content: currency },
            ]
          : []),
        {
          property: "product:availability",
          content: anyInStock ? "in stock" : "out of stock",
        },
      ],
      links: [
        { rel: "canonical", href: productUrl },
        { rel: "alternate", type: "text/markdown", href: `${productUrl}.md` },
        ...(loaderData?.countryCodes ?? []).map((code: string) => ({
          rel: "alternate",
          hrefLang: `en-${code.toUpperCase()}`,
          href: `${siteUrl}/${code}/products/${product.handle}`,
        })),
        ...(firstImageUrl
          ? [
              {
                rel: "preload",
                href: firstImageUrl,
                as: "image",
                fetchPriority: "high" as const,
              },
            ]
          : []),
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(structuredData),
        },
      ],
    }
  },
  component: ProductDetails,
})
