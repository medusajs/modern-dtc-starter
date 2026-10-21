import { getStoredCountryCode } from "@/lib/data/country-code"
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: async ({ deps }) => {
    const { countryCode } = await getStoredCountryCode()

    throw redirect({
      to: "/$countryCode/search",
      params: { countryCode },
      search: { q: deps.q },
    })
  },
})
