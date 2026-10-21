import { createFileRoute } from "@tanstack/react-router"
import { getStorePolicies } from "@/lib/data/store-policies"
import Returns from "@/pages/returns"

export const Route = createFileRoute("/$countryCode/returns")({
  loader: ({ params }) => getStorePolicies(params.countryCode),
  component: Returns,
})
