import { HttpTypes } from "@medusajs/types"
import { clsx } from "clsx"
import React from "react"

type ProductOptionSelectProps = {
  option: HttpTypes.StoreProductOption;
  current: string | undefined;
  updateOption: (title: string, value: string) => void;
  title: string;
  disabled: boolean;
  "data-testid"?: string;
};

const ProductOptionSelect: React.FC<ProductOptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value)

  return (
    <fieldset className="flex flex-col gap-y-3" disabled={disabled}>
      <legend className="text-sm mb-3">Select {title}</legend>
      <div
        className="flex flex-wrap justify-between gap-2"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          const isActive = v === current
          const inputId = `option-${option.id}-${v}`
          return (
            <label
              key={v}
              htmlFor={inputId}
              className={clsx(
                "border text-sm font-medium px-4 py-2.5 flex-1 rounded-base text-center cursor-pointer transition-all duration-200 ease-in-out has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-zinc-900",
                {
                  // Active state
                  "border-zinc-900 bg-zinc-50 text-zinc-900 shadow-sm":
                    isActive,
                  // Default state
                  "border-zinc-300 bg-zinc-50 text-zinc-600":
                    !isActive,
                  // Hover states
                  "hover:bg-zinc-100 hover:border-zinc-300 hover:text-zinc-900":
                    !isActive && !disabled,
                  // Disabled state
                  "opacity-50 cursor-not-allowed": disabled,
                }
              )}
              data-testid="option-button"
            >
              <input
                type="radio"
                id={inputId}
                name={`options[${option.id}]`}
                value={v}
                checked={isActive}
                onChange={() => updateOption(option.id, v)}
                className="sr-only"
              />
              {v}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export default ProductOptionSelect
