import { Elements } from "@stripe/react-stripe-js"
import { loadStripe, Stripe } from "@stripe/stripe-js"
import { HttpTypes } from "@medusajs/types"
import type { ReactNode } from "react"
import {
  getMedusaPaymentsAccount,
  isMedusaPayments,
  isStripe,
} from "@/lib/utils/checkout"

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
const medusaPaymentsKey =
  import.meta.env.VITE_MEDUSA_PAYMENTS_PUBLISHABLE_KEY || ""

// loadStripe should only be called once per configuration, so we cache the promises.
const stripePromises = new Map<string, Promise<Stripe | null>>()

const getStripePromise = (key: string, stripeAccount?: string) => {
  const cacheKey = `${key}:${stripeAccount ?? ""}`
  if (!stripePromises.has(cacheKey)) {
    stripePromises.set(
      cacheKey,
      loadStripe(key, stripeAccount ? { stripeAccount } : undefined)
    )
  }

  return stripePromises.get(cacheKey)!
}

type StripeElementsProviderProps = {
  cart: HttpTypes.StoreCart
  children: ReactNode
}

export function StripeElementsProvider({
  cart,
  children,
}: StripeElementsProviderProps) {
  const activeSession = cart?.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )
  const clientSecret = activeSession?.data?.client_secret as string | undefined

  if (!clientSecret || !isStripe(activeSession?.provider_id)) {
    return <>{children}</>
  }

  // Medusa Payments creates the payment on the account's Stripe connected account,
  // so Stripe.js needs to be initialized for that account.
  const key = isMedusaPayments(activeSession?.provider_id)
    ? medusaPaymentsKey
    : stripeKey
  const stripePromise = key
    ? getStripePromise(key, getMedusaPaymentsAccount(activeSession))
    : null

  return (
    <Elements
      // Elements can't switch Stripe instances, so it remounts when the account changes.
      key={`${key}:${getMedusaPaymentsAccount(activeSession) ?? ""}`}
      stripe={stripePromise}
      options={{ clientSecret }}
    >
      {children}
    </Elements>
  )
}
