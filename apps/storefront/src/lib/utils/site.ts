export const STORE_NAME = "Medusa Store"

export const getSiteUrl = (): string => {
  const configured = import.meta.env.VITE_STOREFRONT_URL as string | undefined
  if (configured) return configured.replace(/\/$/, "")
  if (typeof window !== "undefined") return window.location.origin
  return `http://localhost:${import.meta.env.VITE_PORT || 8000}`
}

export const getRequestOrigin = (request: Request): string => {
  const configured = import.meta.env.VITE_STOREFRONT_URL as string | undefined
  return configured ? configured.replace(/\/$/, "") : new URL(request.url).origin
}

export const listCountryCodes = (
  regions: { countries?: { iso_2?: string | null }[] | null }[]
): string[] =>
  regions.flatMap((region) =>
    (region.countries ?? [])
      .map((country) => country.iso_2?.toLowerCase())
      .filter((code): code is string => Boolean(code))
  )
