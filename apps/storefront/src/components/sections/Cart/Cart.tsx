"use client"

import { HttpTypes } from "@medusajs/types"
import { CircleCheck, ShoppingCart } from "lucide-react"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { CartLineItem } from "@/components/organisms/CartPage/CartLineItem"
import { CartOrderSummary } from "@/components/organisms/CartPage/CartOrderSummary"
import { useCartContext } from "@/components/providers"
import { CartItemDetails, CartSeller } from "@/lib/data/cart-details"
import { filterValidCartItems } from "@/lib/helpers/filter-valid-cart-items"
import { convertToLocale } from "@/lib/helpers/money"

const groupBySeller = (items: HttpTypes.StoreCartLineItem[], details: CartItemDetails) => {
  const groups = new Map<string, { seller?: CartSeller; items: HttpTypes.StoreCartLineItem[] }>()
  for (const item of items) {
    const offerId = item.metadata?.offer_id
    const seller = typeof offerId === "string" ? details.sellersByOffer[offerId] : undefined
    const key = seller?.id ?? "marketplace"
    const group = groups.get(key) ?? { seller, items: [] }
    group.items.push(item)
    groups.set(key, group)
  }
  return [...groups.values()]
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`

export const Cart = ({ details }: { details: CartItemDetails }) => {
  const { cart } = useCartContext()
  const items = filterValidCartItems(cart?.items ?? [])

  if (!cart || !items.length) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center py-20 text-center" data-testid="cart-empty">
        <ShoppingCart className="size-10 text-muted" aria-hidden />
        <h1 className="mt-4 font-display text-h1 font-normal text-heading">Your cart is empty</h1>
        <p className="mt-2 text-body text-muted">
          Browse thousands of products from independent sellers.
        </p>
        <LocalizedClientLink
          href="/categories"
          className="ui-label mt-6 bg-cta px-6 py-3 text-ui text-cta-foreground transition-colors hover:bg-cta-hover"
        >
          Start shopping
        </LocalizedClientLink>
      </div>
    )
  }

  const currency = cart.currency_code ?? "eur"
  const groups = groupBySeller(items, details)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div data-testid="cart">
      <h1 className="font-display text-h1 font-normal text-heading lg:text-[2.5rem]">Cart</h1>
      <p className="mt-1 text-body text-muted">
        {plural(itemCount, "item")} from {plural(groups.length, "seller")}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="flex flex-col gap-4">
          {groups.map(({ seller, items: sellerItems }) => (
            <section
              key={seller?.id ?? "marketplace"}
              className="border border-border bg-surface px-6"
              data-testid={`cart-seller-${seller?.id ?? "marketplace"}`}
            >
              <header className="flex flex-wrap items-center gap-3 border-b border-border py-5">
                <p className="font-display text-h3 text-fg-secondary">
                  Sold by <span className="text-heading">{seller?.name ?? "Fleek"}</span>
                </p>
                {seller?.status === "open" && (
                  <span className="ui-label inline-flex items-center gap-1 rounded-full bg-[color:var(--color-success-tint)] px-2 py-0.5 text-[0.6875rem] text-success">
                    <CircleCheck className="size-3.5" aria-hidden />
                    Verified
                  </span>
                )}
              </header>
              <div className="divide-y divide-border">
                {sellerItems.map((item) => (
                  <CartLineItem
                    key={item.id}
                    item={item}
                    currencyCode={currency}
                    condition={details.conditionsByVariant[item.variant_id ?? ""]}
                  />
                ))}
              </div>
              <footer className="flex items-center justify-between border-t border-border py-5">
                <span className="font-medium text-fg">Seller total</span>
                <span className="font-mono tabular-nums text-fg">
                  {convertToLocale({
                    amount: sellerItems.reduce((sum, item) => sum + (item.total ?? 0), 0),
                    currency_code: currency,
                  })}
                </span>
              </footer>
            </section>
          ))}
        </div>

        <CartOrderSummary cart={cart}>
          <LocalizedClientLink
            href="/checkout?step=address"
            className="ui-label mt-5 flex h-12 items-center justify-center bg-cta text-ui text-cta-foreground transition-colors hover:bg-cta-hover"
            data-testid="cart-checkout-button"
          >
            Go to checkout
          </LocalizedClientLink>
          <p className="mt-3 text-eyebrow text-muted">Secure checkout · 30-day returns</p>
        </CartOrderSummary>
      </div>
    </div>
  )
}
