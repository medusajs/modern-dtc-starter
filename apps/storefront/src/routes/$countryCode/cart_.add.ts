import { getRegion } from "@/lib/data/regions"
import { CART_KEY } from "@/lib/utils/cart"
import { getVariantOptionsKeymap } from "@/lib/utils/product"
import { sdk } from "@/lib/utils/sdk"
import { HttpTypes } from "@medusajs/types"
import { createFileRoute } from "@tanstack/react-router"
import { isEqual } from "lodash-es"

const MAX_QUANTITY = 100

const readCookie = (request: Request, name: string) =>
  request.headers
    .get("cookie")
    ?.split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1] || undefined

const resolveVariantId = async (form: FormData, regionId: string) => {
  const productId = form.get("product_id")?.toString()
  const selectedOptions: Record<string, string> = {}
  form.forEach((value, key) => {
    const match = key.match(/^options\[(.+)\]$/)
    if (match) selectedOptions[match[1]] = value.toString()
  })

  if (!productId || Object.keys(selectedOptions).length === 0) {
    return form.get("variant_id")?.toString() || undefined
  }

  const { product } = await sdk.store.product.retrieve(productId, {
    region_id: regionId,
    fields: "id,*variants,*variants.options",
  })

  return product.variants?.find((variant: HttpTypes.StoreProductVariant) =>
    isEqual(getVariantOptionsKeymap(variant.options ?? []), selectedOptions)
  )?.id
}

const addLineItem = async (
  cartId: string | undefined,
  regionId: string,
  variantId: string,
  quantity: number
) => {
  const id = cartId ?? (await sdk.store.cart.create({ region_id: regionId })).cart.id
  await sdk.store.cart.createLineItem(id, { variant_id: variantId, quantity })
  return id
}

export const Route = createFileRoute("/$countryCode/cart_/add")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const region = await getRegion({ country_code: params.countryCode })
        if (!region) {
          return new Response("Unknown country code", { status: 404 })
        }

        const form = await request.formData()
        const quantity = Math.min(
          Math.max(parseInt(form.get("quantity")?.toString() ?? "1", 10) || 1, 1),
          MAX_QUANTITY
        )

        let variantId: string | undefined
        try {
          variantId = await resolveVariantId(form, region.id)
        } catch {
          return new Response("Product not found", { status: 404 })
        }
        if (!variantId) {
          return new Response("Select a valid product variant", { status: 400 })
        }

        const existingCartId = readCookie(request, CART_KEY)
        let cartId: string
        try {
          cartId = await addLineItem(existingCartId, region.id, variantId, quantity)
        } catch (error) {
          if (!existingCartId) {
            return new Response(
              error instanceof Error ? error.message : "Could not add item to cart",
              { status: 400 }
            )
          }
          // The stored cart may be completed or belong to another region.
          try {
            cartId = await addLineItem(undefined, region.id, variantId, quantity)
          } catch (retryError) {
            return new Response(
              retryError instanceof Error ? retryError.message : "Could not add item to cart",
              { status: 400 }
            )
          }
        }

        return new Response(null, {
          status: 303,
          headers: {
            Location: `/${params.countryCode}/cart`,
            "Set-Cookie": `${CART_KEY}=${cartId}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`,
          },
        })
      },
    },
  },
})
