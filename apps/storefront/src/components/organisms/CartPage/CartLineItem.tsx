"use client"

import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import { Minus, Plus, Trash2 } from "lucide-react"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { useCartContext } from "@/components/providers"
import { convertToLocale } from "@/lib/helpers/money"
import { toast } from "@/lib/helpers/toast"
import { cn } from "@/lib/utils"

export const CartLineItem = ({
  item,
  currencyCode,
  condition,
  editable = true,
}: {
  item: HttpTypes.StoreCartLineItem
  currencyCode: string
  condition?: string
  editable?: boolean
}) => {
  const { updateCartItem, removeCartItem, isUpdatingItem, isRemovingItem } = useCartContext()
  const size = item.variant_title && item.variant_title !== "One Size" ? item.variant_title : null
  const busy = isUpdatingItem || isRemovingItem

  const setQuantity = async (quantity: number) => {
    try {
      await updateCartItem(item.id, quantity)
    } catch {
      toast.error({ title: "Couldn't update quantity", description: "Not enough stock for this offer." })
    }
  }

  return (
    <div className="flex gap-4 py-5" data-testid={`cart-item-${item.id}`}>
      <LocalizedClientLink
        href={`/products/${item.product_handle}`}
        className="relative size-20 shrink-0 overflow-hidden border border-border bg-surface sm:size-24"
      >
        <Image
          src={item.thumbnail ? decodeURIComponent(item.thumbnail) : "/images/placeholder.svg"}
          alt={item.product_title ?? "Product"}
          fill
          sizes="96px"
          className="object-contain p-1.5"
        />
      </LocalizedClientLink>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <LocalizedClientLink
            href={`/products/${item.product_handle}`}
            className="text-body font-medium text-fg hover:underline"
            data-testid="cart-item-title"
          >
            {item.product_title}
          </LocalizedClientLink>
          <span className="shrink-0 font-mono text-body tabular-nums text-fg" data-testid="cart-item-price">
            {convertToLocale({ amount: item.total ?? 0, currency_code: currencyCode })}
          </span>
        </div>

        {(condition || size) && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {condition && (
              <span
                className={cn(
                  "ui-label inline-flex items-center gap-1.5 text-eyebrow",
                  condition === "New" ? "text-success" : "text-fg-secondary"
                )}
              >
                <span aria-hidden className="size-1.5 rounded-full bg-current" />
                {condition}
              </span>
            )}
            {size && (
              <span className="text-small text-muted">
                Size: <span className="text-fg">{size}</span>
              </span>
            )}
          </div>
        )}

        <div className="mt-1 flex flex-wrap items-center gap-4">
          {editable ? (
            <div className="flex h-9 items-center border border-border-strong">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={busy || item.quantity <= 1}
                onClick={() => setQuantity(item.quantity - 1)}
                className="flex h-full w-9 items-center justify-center text-fg-secondary hover:text-fg disabled:opacity-40"
              >
                <Minus className="size-3.5" aria-hidden />
              </button>
              <span className="w-8 text-center text-small tabular-nums" data-testid="cart-item-quantity">
                {item.quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={busy}
                onClick={() => setQuantity(item.quantity + 1)}
                className="flex h-full w-9 items-center justify-center text-fg-secondary hover:text-fg disabled:opacity-40"
              >
                <Plus className="size-3.5" aria-hidden />
              </button>
            </div>
          ) : (
            <span className="text-small text-muted">Qty {item.quantity}</span>
          )}
          <span className="text-small text-muted">
            Unit price:{" "}
            <span className="font-mono tabular-nums">
              {convertToLocale({ amount: item.unit_price ?? 0, currency_code: currencyCode })}
            </span>
          </span>
          {editable && (
            <button
              type="button"
              aria-label={`Remove ${item.product_title}`}
              disabled={busy}
              onClick={() => removeCartItem(item.id)}
              className="ml-auto flex size-9 items-center justify-center text-muted transition-colors hover:text-fg disabled:opacity-40"
              data-testid="cart-item-remove"
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
