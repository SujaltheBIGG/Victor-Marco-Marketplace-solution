"use client"

import { X } from "lucide-react"
import { ReactNode, useState, useTransition } from "react"

import { useCartContext } from "@/components/providers"
import { applyPromotions, deletePromotionCode } from "@/lib/data/cart"
import { convertToLocale } from "@/lib/helpers/money"
import { toast } from "@/lib/helpers/toast"
import { Cart } from "@/types/cart"

const Row = ({ label, value, testId }: { label: string; value: ReactNode; testId: string }) => (
  <div className="flex items-center justify-between gap-4 py-2.5 text-small" data-testid={testId}>
    <span className="text-fg-secondary">{label}</span>
    <span className="font-mono tabular-nums text-fg">{value}</span>
  </div>
)

export const CartOrderSummary = ({
  cart,
  title = "Order summary",
  children,
}: {
  cart: Cart
  title?: string
  children?: ReactNode
}) => {
  const { refreshCart } = useCartContext()
  const [code, setCode] = useState("")
  const [isPending, startTransition] = useTransition()
  const currency = cart.currency_code ?? "eur"
  const money = (amount?: number | null) =>
    convertToLocale({ amount: amount ?? 0, currency_code: currency })
  const promotions = (cart.promotions ?? []).filter((p) => p.code)

  const applyCode = () => {
    const value = code.trim()
    if (!value || isPending) return
    startTransition(async () => {
      const result = await applyPromotions([value])
      if (!result.success || !result.applied) {
        toast.info({ title: result.success ? "Promotion code not found" : result.error })
        return
      }
      setCode("")
      toast.success({ title: "Promotion code applied" })
      await refreshCart()
    })
  }

  const removeCode = (promoCode: string) => {
    startTransition(async () => {
      await deletePromotionCode(promoCode)
      await refreshCart()
    })
  }

  return (
    <aside className="border border-border bg-surface p-5" data-testid="cart-summary">
      <h2 className="font-display text-h2 font-normal text-heading">{title}</h2>

      <div className="mt-3 divide-y divide-border">
        <Row label="Subtotal" value={money(cart.item_total)} testId="cart-summary-subtotal" />
        <Row
          label="Shipping"
          value={cart.shipping_total ? money(cart.shipping_total) : "Calculated at checkout"}
          testId="cart-summary-shipping"
        />
        {!!cart.discount_total && (
          <Row label="Discount" value={`−${money(cart.discount_total)}`} testId="cart-summary-discount" />
        )}
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-border pt-4" data-testid="cart-summary-total">
        <span className="font-display text-h3 text-heading">Total</span>
        <span className="font-mono text-h2 font-medium tabular-nums text-heading">{money(cart.total)}</span>
      </div>
      {!!cart.tax_total && (
        <p className="mt-1 text-eyebrow text-muted">Includes {money(cart.tax_total)} VAT</p>
      )}

      <div className="mt-5">
        <label htmlFor="promo-code" className="ui-label text-eyebrow text-fg">
          Promo code
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="promo-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyCode()}
            placeholder="Enter code"
            className="h-11 min-w-0 flex-1 border border-border-strong bg-surface-subtle px-3 font-mono text-small text-fg placeholder:text-muted focus:border-fg focus:outline-none"
            data-testid="promo-code-input"
          />
          <button
            type="button"
            onClick={applyCode}
            disabled={!code.trim() || isPending}
            className="ui-label h-11 border border-border-strong px-4 text-eyebrow text-fg transition-colors hover:border-fg disabled:opacity-50"
            data-testid="promo-code-apply"
          >
            Apply
          </button>
        </div>
        {promotions.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {promotions.map((promotion) => (
              <li
                key={promotion.id}
                className="ui-label inline-flex items-center gap-1.5 border border-border bg-surface-subtle px-2 py-1 text-eyebrow text-fg"
              >
                {promotion.code}
                <button
                  type="button"
                  aria-label={`Remove code ${promotion.code}`}
                  onClick={() => removeCode(promotion.code!)}
                  className="text-muted hover:text-fg"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {children}
    </aside>
  )
}
