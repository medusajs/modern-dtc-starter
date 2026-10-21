import { getStoredCountryCode } from "@/lib/data/country-code"
import { createFileRoute, notFound, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/$")({
  beforeLoad: async ({ location }) => {
    const firstSegment = location.pathname.split("/").filter(Boolean)[0]

    // A two-letter segment reaching the splat is already country-prefixed, so redirecting would loop.
    // Dotfiles (/.well-known) and API paths (/ucp) are never storefront pages.
    if (
      !firstSegment ||
      firstSegment.length === 2 ||
      firstSegment.startsWith(".") ||
      firstSegment === "ucp"
    ) {
      throw notFound()
    }

    const { countryCode } = await getStoredCountryCode()

    throw redirect({ href: `/${countryCode}${location.href}` })
  },
})
