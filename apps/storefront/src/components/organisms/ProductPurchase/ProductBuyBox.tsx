"use client"

import {
  ArrowRight,
  BadgeCheck,
  Check,
  CircleCheck,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react"
import { ReactNode, useState } from "react"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { useCartContext } from "@/components/providers"
import useUpdateSearchParams from "@/hooks/useUpdateSearchParams"
import { getOfferAmount, getOfferStock } from "@/lib/helpers/buybox"
import { convertToLocale } from "@/lib/helpers/money"
import { toast } from "@/lib/helpers/toast"
import { cn } from "@/lib/utils"

import { optionKey, useProductPurchase } from "./ProductPurchaseProvider"

const LOW_STOCK_THRESHOLD = 5

const TRUST_POINTS = [
  { Icon: RotateCcw, label: "30-day returns" },
  { Icon: ShieldCheck, label: "Buyer protection" },
  { Icon: BadgeCheck, label: "Verified sellers" },
  { Icon: Truck, label: "Tracked delivery" },
]

export const ProductBuyBox = ({
  locale,
  children,
}: {
  locale: string
  children?: ReactNode
}) => {
  const { product, variant, selectedOptions, selectedOffer } = useProductPurchase()
  const { addToCart, onAddToCart, cart, isAddingItem } = useCartContext()
  const updateSearchParams = useUpdateSearchParams()
  const [quantity, setQuantity] = useState(1)
  const [addedOfferId, setAddedOfferId] = useState<string>()

  const amount = selectedOffer ? getOfferAmount(selectedOffer) : null
  const currency = selectedOffer?.calculated_price?.currency_code ?? "eur"
  const stock = selectedOffer ? getOfferStock(selectedOffer) : 0
  const inCart =
    cart?.items?.find((item) => item.metadata?.offer_id === selectedOffer?.id)?.quantity ?? 0
  const available = Math.max(stock - inCart, 0)
  const canBuy = !!selectedOffer && amount !== null && available > 0
  const justAdded = !!selectedOffer && addedOfferId === selectedOffer.id
  const seller = selectedOffer?.seller
  const choosableOptions = (product.options ?? []).filter(
    (option) => (option.values?.length ?? 0) > 1
  )

  const handleAddToCart = async () => {
    if (!selectedOffer || !variant || amount === null || !canBuy) return

    const qty = Math.min(quantity, available)
    const unitSubtotal = selectedOffer.calculated_price?.calculated_amount_without_tax ?? amount

    onAddToCart(
      {
        thumbnail: product.thumbnail || "",
        product_title: product.title,
        quantity: qty,
        subtotal: unitSubtotal * qty,
        total: amount * qty,
        tax_total: (amount - unitSubtotal) * qty,
        variant_id: variant.id,
        product_id: product.id,
        variant,
        metadata: { offer_id: selectedOffer.id },
      },
      currency
    )

    try {
      await addToCart({ offerId: selectedOffer.id, quantity: qty, countryCode: locale })
      setAddedOfferId(selectedOffer.id)
      setQuantity(1)
    } catch {
      toast.error({
        title: "Couldn't add to cart",
        description: "This offer no longer has enough stock.",
      })
    }
  }

  const buttonLabel = !selectedOffer || amount === null
    ? "Not available"
    : available > 0
      ? "Add to cart"
      : "Out of stock"

  return (
    <div className="flex flex-col" data-testid="product-buy-box">
      <h1
        className="font-display text-[2rem] font-medium leading-tight text-heading lg:text-[2.5rem]"
        data-testid="product-title"
      >
        {product.title}
      </h1>

      <div className="mt-5 border-t border-border pt-5">
        {amount !== null ? (
          <p
            className="font-display text-[2.75rem] font-medium leading-none tabular-nums text-heading"
            data-testid="product-price"
          >
            {convertToLocale({ amount, currency_code: currency })}
          </p>
        ) : (
          <p className="text-body text-muted" data-testid="product-price-unavailable">
            Not available in your region
          </p>
        )}
      </div>

      {seller && (
        <div className="mt-5 border border-border bg-surface-subtle p-4" data-testid="product-seller-box">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-body text-fg-secondary">
              Sold by <span className="font-semibold text-fg">{seller.name}</span>
            </p>
            {seller.status === "open" && (
              <span className="inline-flex items-center gap-1 text-small font-medium text-success">
                <CircleCheck className="size-4" aria-hidden />
                Verified seller
              </span>
            )}
          </div>
          <LocalizedClientLink
            href={`/sellers/${seller.handle}`}
            className="ui-label mt-3 inline-block text-eyebrow text-fg hover:underline"
            data-testid="product-seller-link"
          >
            Seller details
          </LocalizedClientLink>
        </div>
      )}

      {choosableOptions.map((option) => {
        const key = optionKey(option.title)
        return (
          <div key={option.id} className="mt-5" data-testid={`product-option-${key}`}>
            <p className="text-small text-fg-secondary">
              {option.title}: <span className="font-medium text-fg">{selectedOptions[key]}</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {option.values?.map((value) => {
                const active = selectedOptions[key] === value.value
                return (
                  <button
                    key={value.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => updateSearchParams(key, value.value)}
                    className={cn(
                      "ui-label min-w-12 border px-3 py-2 text-eyebrow transition-colors",
                      active
                        ? "border-fg bg-graphite text-on-graphite"
                        : "border-border-strong text-fg hover:border-fg"
                    )}
                    data-testid={`product-option-${key}-${value.value.toLowerCase()}`}
                  >
                    {value.value}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      <p className="mt-5 flex items-center gap-2 text-body text-fg">
        <Truck className="size-5 shrink-0" aria-hidden />
        <span>
          <span className="font-medium">Tracked delivery</span>
          <span className="text-fg-secondary"> · shipping calculated at checkout</span>
        </span>
      </p>

      <div className="mt-4 flex gap-3">
        <div className="flex h-12 shrink-0 items-center border border-border-strong">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="flex h-full w-11 items-center justify-center text-fg-secondary hover:text-fg disabled:opacity-40"
          >
            <Minus className="size-4" aria-hidden />
          </button>
          <span className="w-10 text-center tabular-nums" data-testid="product-quantity">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => Math.min(Math.max(available, 1), q + 1))}
            disabled={quantity >= available}
            className="flex h-full w-11 items-center justify-center text-fg-secondary hover:text-fg disabled:opacity-40"
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!canBuy || isAddingItem}
          className="ui-label flex h-12 flex-1 items-center justify-center gap-2 bg-cta text-ui text-cta-foreground transition-colors hover:bg-cta-hover disabled:cursor-not-allowed disabled:opacity-60"
          data-testid="product-add-to-cart-button"
        >
          {justAdded ? (
            <>
              <Check className="size-5" aria-hidden />
              Added to cart
            </>
          ) : (
            <>
              <ShoppingCart className="size-5" aria-hidden />
              {isAddingItem ? "Adding…" : buttonLabel}
            </>
          )}
        </button>
      </div>

      {justAdded && (
        <LocalizedClientLink
          href="/cart"
          className="mt-3 inline-flex items-center gap-1 self-start text-body font-medium text-fg hover:underline"
          data-testid="product-view-cart-link"
        >
          View cart
          <ArrowRight className="size-4" aria-hidden />
        </LocalizedClientLink>
      )}

      {canBuy && available <= LOW_STOCK_THRESHOLD && (
        <p className="mt-3 text-body font-medium text-[color:var(--color-warning)]">
          Only {available} left in stock
        </p>
      )}

      <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-border pt-5">
        {TRUST_POINTS.map(({ Icon, label }) => (
          <li key={label} className="flex items-center gap-2 text-small text-fg-secondary">
            <Icon className="size-4 shrink-0" aria-hidden />
            {label}
          </li>
        ))}
      </ul>

      {children}
    </div>
  )
}
