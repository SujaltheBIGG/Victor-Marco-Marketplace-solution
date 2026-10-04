import { CircleCheck } from "lucide-react"
import { Metadata } from "next"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
}

export default async function GuestOrderConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>
}) {
  const { group } = await searchParams
  const reference = group?.replace(/^og_/, "").slice(-8).toUpperCase()

  return (
    <main className="mx-auto w-full max-w-screen-xl px-4 py-16 sm:px-6" data-testid="order-confirmed-page">
      <div className="mx-auto flex max-w-xl flex-col items-center border border-border bg-surface px-6 py-12 text-center">
        <CircleCheck className="size-12 text-success" aria-hidden />
        <h1 className="mt-5 font-display text-h1 font-normal text-heading">Thank you for your order</h1>
        <p className="mt-3 text-body text-fg-secondary">
          Your order is placed. Each seller ships their part separately, and you&apos;ll get a
          confirmation email with tracking details shortly.
        </p>
        {reference && (
          <p className="ui-label mt-6 border border-border bg-surface-subtle px-4 py-2 text-eyebrow text-fg">
            Order reference · {reference}
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LocalizedClientLink
            href="/"
            className="ui-label bg-cta px-6 py-3 text-ui text-cta-foreground transition-colors hover:bg-cta-hover"
            data-testid="order-confirmed-continue"
          >
            Continue shopping
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/register"
            className="ui-label border border-border-strong px-6 py-3 text-ui text-fg transition-colors hover:border-fg"
          >
            Create an account
          </LocalizedClientLink>
        </div>
        <p className="mt-4 text-small text-muted">Create an account with the same email to track this order.</p>
      </div>
    </main>
  )
}
