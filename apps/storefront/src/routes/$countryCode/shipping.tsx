import { createFileRoute } from "@tanstack/react-router"
import { getStorePolicies } from "@/lib/data/store-policies"
import Shipping from "@/pages/shipping"

export const Route = createFileRoute("/$countryCode/shipping")({
  loader: ({ params }) => getStorePolicies(params.countryCode),
  component: Shipping,
})
