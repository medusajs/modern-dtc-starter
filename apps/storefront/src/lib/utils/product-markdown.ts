import { retrieveProduct } from "@/lib/data/products"
import { getRegion } from "@/lib/data/regions"
import { formatPrice } from "@/lib/utils/price"
import { isVariantInStock } from "@/lib/utils/product"
import { cachedOnServer } from "@/lib/utils/server-cache"
import { getRequestOrigin } from "@/lib/utils/site"
import { getRegionPolicies } from "@/lib/utils/store-policies"

const FIELDS =
  "id,title,handle,description,*options,*variants,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,*variants.calculated_price,*variants.options"

export const renderProductMarkdown = async (
  request: Request,
  countryCode: string,
  handle: string
): Promise<Response> => {
  const headers = {
    "Content-Type": "text/markdown; charset=utf-8",
    "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=600",
    Vary: "Accept",
  }

  const region = await getRegion({ country_code: countryCode })
  const product = region
    ? await cachedOnServer(
        `product-md:${handle}:${region.id}`,
        60 * 1000,
        () => retrieveProduct({ handle, region_id: region.id, fields: FIELDS }),
        10 * 60 * 1000
      ).catch(() => null)
    : null

  if (!region || !product) {
    return new Response("# Product not found\n", { status: 404, headers })
  }

  const origin = getRequestOrigin(request)
  const base = `${origin}/${countryCode}`
  const productUrl = `${base}/products/${product.handle}`
  const currency = region.currency_code
  const policies = getRegionPolicies(region)
  const policyLines = policies
    ? `
- Shipping: ${
        policies.shippingRate === 0
          ? "free"
          : formatPrice({ amount: policies.shippingRate, currency_code: currency })
      }, ships in ${policies.handlingDays.min}-${policies.handlingDays.max} business days, delivery ${policies.transitDays.min}-${policies.transitDays.max} business days
- Returns: within ${policies.returnWindowDays} days of delivery, ${policies.freeReturns ? "free return shipping" : "return shipping paid by the customer"}`
    : ""
  const optionTitles = new Map((product.options ?? []).map((o) => [o.id, o.title]))

  const variants = (product.variants ?? []).filter(
    (v) => v.calculated_price?.calculated_amount != null
  )
  const variantRows = variants.map((variant) => {
    const options = (variant.options ?? [])
      .map((o) => `${optionTitles.get(o.option_id ?? "") ?? "Option"}: ${o.value}`)
      .join(", ")
    const price = formatPrice({
      amount: variant.calculated_price!.calculated_amount!,
      currency_code: currency,
    })
    const stock = isVariantInStock(variant) ? "In stock" : "Out of stock"
    return `| ${options || variant.title} | ${variant.sku ?? ""} | ${price} | ${stock} | \`${variant.id}\` |`
  })

  const anyInStock = variants.some(isVariantInStock)

  const body = `# ${product.title}

${product.description ?? ""}

- URL: ${productUrl}
- Availability: ${anyInStock ? "In stock" : "Out of stock"}${policyLines}

## Variants

| Options | SKU | Price | Availability | Variant ID |
| --- | --- | --- | --- | --- |
${variantRows.join("\n")}

## Buy

- Add to cart: POST \`product_id=${product.id}&variant_id={variant_id}&quantity={n}\` to ${base}/cart/add
- Checkout link: ${origin}/buy/{variant_id}:{quantity}?context/address_country=${countryCode.toUpperCase()}

## Policies

- [Shipping information](${base}/shipping)
- [Return policy](${base}/returns)
- [Terms of service](${base}/terms)
- [Privacy policy](${base}/privacy)
- [Contact](${base}/contact)
`

  return new Response(body, { headers })
}
