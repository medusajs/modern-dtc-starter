import { DEFAULT_CART_DROPDOWN_FIELDS } from "@/components/cart"
import ProductOptionSelect from "@/components/product-option-select"
import ProductPrice from "@/components/product-price"
import { Button } from "@/components/ui/button"
import { useCartDrawer } from "@/lib/hooks/use-cart-drawer"
import { useAddToCart } from "@/lib/hooks/use-cart"
import { getVariantOptionsKeymap, isVariantInStock } from "@/lib/utils/product"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { HttpTypes } from "@medusajs/types"
import { useLocation } from "@tanstack/react-router"
import { isEqual } from "lodash-es"
import { useEffect, useMemo, useRef, useState, memo } from "react"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct;
  region: HttpTypes.StoreRegion;
  disabled?: boolean;
  initialVariantId?: string;
  onVariantChange?: (variant: HttpTypes.StoreProductVariant | undefined) => void;
  onOptionsChange?: (options: Record<string, string>) => void;
};

const ProductActions = memo(function ProductActions({
  product,
  region,
  disabled,
  initialVariantId,
  onVariantChange,
  onOptionsChange,
}: ProductActionsProps) {
  const defaultOptions = useMemo(() => {
    const variants = product?.variants ?? []
    const defaultVariant =
      variants.find((v) => v.id === initialVariantId) ??
      variants.find(isVariantInStock) ??
      variants[0]
    return getVariantOptionsKeymap(defaultVariant?.options ?? []) ?? {}
  }, [product?.variants, initialVariantId])

  const [selectedOptions, setSelectedOptions] =
    useState<Record<string, string | undefined>>(defaultOptions)
  const [quantity, setQuantity] = useState(1)
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname) || "dk"

  const addToCartMutation = useAddToCart({
    fields: DEFAULT_CART_DROPDOWN_FIELDS,
  })
  const { openCart } = useCartDrawer()

  const actionsRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    setSelectedOptions(defaultOptions)
  }, [defaultOptions])

  const selectedVariant = useMemo(() => {
    if (!product?.variants || product?.variants.length === 0) {
      return
    }

    // If there's only one variant and no options, select it directly
    if (
      product?.variants.length === 1 &&
      (!product?.options || product?.options.length === 0)
    ) {
      return product?.variants[0]
    }

    const variant = product?.variants.find((v) => {
      const optionsKeymap = getVariantOptionsKeymap(v?.options ?? [])
      const matches = isEqual(optionsKeymap, selectedOptions)

      return matches
    })

    return variant
  }, [product?.variants, product?.options, selectedOptions])

  // Notify parent component when variant changes
  useEffect(() => {
    onVariantChange?.(selectedVariant)
  }, [selectedVariant, onVariantChange])

  // Notify parent component when options change
  useEffect(() => {
    // Filter out undefined values before calling callback
    const definedOptions: Record<string, string> = {}
    for (const [key, value] of Object.entries(selectedOptions)) {
      if (value !== undefined) {
        definedOptions[key] = value
      }
    }
    onOptionsChange?.(definedOptions)
  }, [selectedOptions, onOptionsChange])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product?.variants?.some((v) => {
      const optionsKeymap = getVariantOptionsKeymap(v?.options ?? [])
      return isEqual(optionsKeymap, selectedOptions)
    })
  }, [product?.variants, selectedOptions])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If no variant is selected, we can't add to cart
    if (!selectedVariant) {
      return false
    }

    return isVariantInStock(selectedVariant)
  }, [selectedVariant])

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    addToCartMutation.mutateAsync(
      {
        variant_id: selectedVariant.id,
        quantity: quantity,
        country_code: countryCode,
        product,
        variant: selectedVariant,
        region,
      },
      {
        onSuccess: () => {
          openCart()
        },
      }
    )
  }

  return (
    <form
      method="post"
      action={`/${countryCode}/cart/add`}
      onSubmit={(event) => {
        event.preventDefault()
        handleAddToCart()
      }}
      className="flex flex-col gap-y-6"
      ref={actionsRef}
    >
      <input type="hidden" name="product_id" value={product.id} />
      {selectedVariant && (
        <input type="hidden" name="variant_id" value={selectedVariant.id} />
      )}
      <input type="hidden" name="quantity" value={quantity} />

      <div className="flex flex-col gap-y-1">
        <ProductPrice
          product={product as HttpTypes.StoreProduct}
          variant={selectedVariant}
          priceProps={{
            textSize: "large",
          }}
        />
        {selectedVariant && (
          <p
            className={inStock ? "text-sm text-zinc-600" : "text-sm text-red-600"}
            data-testid="product-availability"
          >
            {inStock ? "In stock" : "Out of stock"}
          </p>
        )}
      </div>

      {/* Variant options (color, size, etc.) */}
      {(product.variants?.length ?? 0) > 1 && (
        <div className="flex flex-col gap-y-6">
          {(product.options || []).map((option) => {
            return (
              <div key={option.id}>
                <ProductOptionSelect
                  option={option}
                  current={selectedOptions[option.id]}
                  updateOption={setOptionValue}
                  title={option.title ?? ""}
                  data-testid="product-options"
                  disabled={!!disabled || addToCartMutation.isPending}
                />
              </div>
            )
          })}
        </div>
      )}

      {/* Quantity selector */}
      <div className="flex flex-col gap-y-2">
        <span className="text-sm font-medium" id="quantity-label">Quantity</span>
        <div className="flex items-center gap-x-4" role="group" aria-labelledby="quantity-label">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1 || !!disabled}
            className="w-10 h-10 flex items-center justify-center border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="w-12 text-center font-medium" aria-live="polite">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            disabled={!!disabled}
            className="w-10 h-10 flex items-center justify-center border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to cart button */}
      <Button
        type="submit"
        disabled={!inStock || !selectedVariant || !!disabled || !isValidVariant}
        variant="primary"
        className="w-full"
        data-testid="add-product-button"
      >
        {!selectedVariant
          ? "Select variant"
          : !inStock || !isValidVariant
            ? "Out of stock"
            : "Add to cart"}
      </Button>
    </form>
  )
})

export default ProductActions
