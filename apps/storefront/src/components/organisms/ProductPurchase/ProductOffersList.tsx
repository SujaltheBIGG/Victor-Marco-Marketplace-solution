"use client"

import { Check, CircleCheck } from "lucide-react"

import { getOfferAmount, getOfferStock } from "@/lib/helpers/buybox"
import { convertToLocale } from "@/lib/helpers/money"
import { cn } from "@/lib/utils"

import { useProductPurchase } from "./ProductPurchaseProvider"

export const ProductOffersList = () => {
  const { variant, variantOffers, selectedOffer, selectOffer } = useProductPurchase()

  if (!variantOffers.length) return null

  const condition = variant?.options?.find((o) => o.option?.title === "Condition")?.value

  return (
    <section aria-labelledby="offers-heading" data-testid="product-offers">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="offers-heading" className="font-display text-h2 font-normal text-heading">
          Offers{condition ? ` · ${condition}` : ""} ({variantOffers.length})
        </h2>
        <p className="text-small text-muted">Sorted by lowest price</p>
      </div>
      <ul className="space-y-3">
        {variantOffers.map((offer) => {
          const isSelected = offer.id === selectedOffer?.id
          const amount = getOfferAmount(offer)
          const inStock = getOfferStock(offer) > 0
          return (
            <li key={offer.id}>
              <button
                type="button"
                onClick={() => selectOffer(offer.id)}
                aria-pressed={isSelected}
                disabled={!inStock}
                className={cn(
                  "flex w-full items-center justify-between gap-4 border bg-surface p-4 text-left transition-colors",
                  isSelected ? "border-fg ring-1 ring-fg" : "border-border hover:border-border-strong",
                  !inStock && "cursor-not-allowed opacity-50"
                )}
                data-testid={`product-offer-${offer.id}`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-fg">{offer.seller?.name}</span>
                    {offer.seller?.status === "open" && (
                      <span className="inline-flex items-center gap-1 text-small text-success">
                        <CircleCheck className="size-3.5" aria-hidden />
                        Verified
                      </span>
                    )}
                    {isSelected && (
                      <span className="ui-label inline-flex items-center gap-1 rounded-full bg-graphite px-2 py-0.5 text-[0.625rem] text-on-graphite">
                        <Check className="size-3" aria-hidden />
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-small text-muted">
                    {[condition, inStock ? "In stock" : "Out of stock", "Tracked delivery"]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <span className="shrink-0 font-display text-h3 font-medium tabular-nums text-heading">
                  {amount !== null
                    ? convertToLocale({
                        amount,
                        currency_code: offer.calculated_price?.currency_code ?? "eur",
                      })
                    : "—"}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
