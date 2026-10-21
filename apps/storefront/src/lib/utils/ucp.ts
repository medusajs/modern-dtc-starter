import { isVariantInStock } from "@/lib/utils/product"
import { HttpTypes } from "@medusajs/types"

export const UCP_VERSION = "2026-08-25"
export const UCP_REST_BASE_PATH = "/ucp/v1"

export const UCP_CAPABILITIES = {
  "dev.ucp.shopping.catalog.search": {
    spec: `https://ucp.dev/${UCP_VERSION}/specification/shopping/catalog/search`,
    schema: `https://ucp.dev/${UCP_VERSION}/schemas/shopping/catalog_search.json`,
  },
  "dev.ucp.shopping.catalog.lookup": {
    spec: `https://ucp.dev/${UCP_VERSION}/specification/shopping/catalog/lookup`,
    schema: `https://ucp.dev/${UCP_VERSION}/schemas/shopping/catalog_lookup.json`,
  },
  "dev.ucp.shopping.cart": {
    spec: `https://ucp.dev/${UCP_VERSION}/specification/shopping/cart`,
    schema: `https://ucp.dev/${UCP_VERSION}/schemas/shopping/cart.json`,
  },
} as const

type CapabilityName = keyof typeof UCP_CAPABILITIES

export const UCP_PRODUCT_FIELDS =
  "id,title,handle,description,thumbnail,*images,*options,*variants,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,*variants.calculated_price,*variants.options"

export const UCP_CART_FIELDS =
  "id,currency_code,region_id,*items,+items.subtotal,+items.total,item_subtotal,discount_total,shipping_total,tax_total,total,*region.countries,shipping_address.country_code"

type Money = { amount: number; currency: string }

const minorUnitDigits = (currency: string) =>
  new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions()
    .maximumFractionDigits ?? 2

export const toMoney = (amount: number | null | undefined, currencyCode: string): Money => {
  const currency = currencyCode.toUpperCase()
  return {
    amount: Math.round((amount ?? 0) * 10 ** minorUnitDigits(currency)),
    currency,
  }
}

export const ucpJson = (
  capability: CapabilityName,
  body: Record<string, unknown>,
  init: ResponseInit = {}
) =>
  Response.json(
    {
      ucp: {
        version: UCP_VERSION,
        status: (init.status ?? 200) < 400 ? "success" : "error",
        capabilities: { [capability]: [{ version: UCP_VERSION }] },
      },
      ...body,
    },
    {
      ...init,
      headers: { "Cache-Control": "no-store", ...init.headers },
    }
  )

export const ucpError = (
  capability: CapabilityName,
  status: number,
  code: string,
  content: string
) =>
  ucpJson(
    capability,
    {
      messages: [
        {
          type: "error",
          code,
          content,
          severity: status >= 500 ? "recoverable" : "unrecoverable",
        },
      ],
    },
    { status }
  )

export const readJsonBody = async (request: Request): Promise<Record<string, unknown> | null> => {
  try {
    const body = await request.json()
    return body && typeof body === "object" && !Array.isArray(body) ? body : null
  } catch {
    return null
  }
}

export const toUcpProduct = (
  product: HttpTypes.StoreProduct,
  currencyCode: string,
  productUrl: string
) => {
  const optionTitles = new Map(
    (product.options ?? []).map((option) => [option.id, option.title])
  )
  const variants = (product.variants ?? []).filter(
    (variant) => variant.calculated_price?.calculated_amount != null
  )
  const amounts = variants.map((v) => v.calculated_price!.calculated_amount!)

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    description: product.description ?? "",
    url: productUrl,
    media: (product.images ?? []).map((image) => ({
      type: "image",
      url: image.url,
      alt_text: product.title,
    })),
    price_range: amounts.length
      ? {
          min: toMoney(Math.min(...amounts), currencyCode),
          max: toMoney(Math.max(...amounts), currencyCode),
        }
      : undefined,
    variants: variants.map((variant) => {
      const available = isVariantInStock(variant)
      return {
        id: variant.id,
        sku: variant.sku ?? undefined,
        title: variant.title ?? product.title,
        url: `${productUrl}?variant=${variant.id}`,
        price: toMoney(variant.calculated_price!.calculated_amount, currencyCode),
        availability: { available, status: available ? "in_stock" : "out_of_stock" },
        options: (variant.options ?? []).map((value) => ({
          name: optionTitles.get(value.option_id ?? "") ?? "",
          value: value.value,
        })),
      }
    }),
  }
}

export const toUcpCart = (
  cart: HttpTypes.StoreCart,
  continueUrl: string
) => {
  const currency = cart.currency_code
  return {
    id: cart.id,
    currency: currency.toUpperCase(),
    line_items: (cart.items ?? []).map((item) => ({
      id: item.id,
      item: {
        id: item.variant_id,
        title: [item.product_title, item.variant_title].filter(Boolean).join(" - "),
        price: toMoney(item.unit_price, currency),
      },
      quantity: item.quantity,
      totals: [
        { type: "subtotal", amount: toMoney(item.subtotal, currency) },
        { type: "total", amount: toMoney(item.total, currency) },
      ],
    })),
    totals: [
      { type: "subtotal", amount: toMoney(cart.item_subtotal, currency) },
      { type: "discount", amount: toMoney(cart.discount_total, currency) },
      { type: "fulfillment", amount: toMoney(cart.shipping_total, currency) },
      { type: "tax", amount: toMoney(cart.tax_total, currency) },
      { type: "total", amount: toMoney(cart.total, currency) },
    ],
    continue_url: continueUrl,
    messages: [],
  }
}

const MAX_LINE_ITEMS = 50
const MAX_QUANTITY = 100

/** Validates a UCP `line_items` array into Medusa variant/quantity pairs. */
export const parseLineItems = (
  value: unknown
): { variant_id: string; quantity: number }[] | null => {
  if (!Array.isArray(value) || value.length > MAX_LINE_ITEMS) return null

  const items: { variant_id: string; quantity: number }[] = []
  for (const entry of value) {
    const id = entry?.item?.id
    const quantity = entry?.quantity
    if (
      typeof id !== "string" ||
      !id ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_QUANTITY
    ) {
      return null
    }
    items.push({ variant_id: id, quantity })
  }
  return items
}

export const cartCountryCode = (cart: HttpTypes.StoreCart) =>
  (
    cart.shipping_address?.country_code ??
    cart.region?.countries?.[0]?.iso_2 ??
    ""
  ).toLowerCase()

export const cartContinueUrl = (origin: string, cart: HttpTypes.StoreCart) =>
  `${origin}/${cartCountryCode(cart)}/cart/resume/${cart.id}`
