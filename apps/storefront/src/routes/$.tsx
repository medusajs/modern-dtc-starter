import { getStoredCountryCode } from "@/lib/data/country-code"
import { createFileRoute, notFound, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/$")({
  beforeLoad: async ({ location }) => {
    const firstSegment = location.pathname.split("/").filter(Boolean)[0]

    // A two-letter segment reaching the splat is already country-prefixed, so redirecting would loop.
    if (!firstSegment || firstSegment.length === 2) {
      throw notFound()
    }

    const { countryCode } = await getStoredCountryCode()

    throw redirect({ href: `/${countryCode}${location.href}` })
  },
})
