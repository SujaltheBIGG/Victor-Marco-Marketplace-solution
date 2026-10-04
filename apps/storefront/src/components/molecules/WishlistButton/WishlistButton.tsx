"use client"

import { Heart } from "lucide-react"

import { useWishlist, WishlistItem } from "@/components/providers/Wishlist/WishlistProvider"
import { cn } from "@/lib/utils"

export const WishlistButton = ({
  item,
  variant = "icon",
  className,
}: {
  item: WishlistItem
  variant?: "icon" | "full"
  className?: string
}) => {
  const { has, toggle } = useWishlist()
  const saved = has(item.handle)
  const heart = <Heart className={cn("size-4", saved && "fill-cta text-cta")} aria-hidden />

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={() => toggle(item)}
        aria-pressed={saved}
        className={cn(
          "ui-label inline-flex w-full items-center justify-center gap-2 border border-border-strong px-4 py-3 text-ui text-fg transition-colors hover:border-cta",
          className
        )}
        data-testid="product-wishlist-button"
      >
        {heart}
        {saved ? "Saved to wishlist" : "Save to wishlist"}
      </button>
    )
  }

  const label = saved ? `Remove ${item.title} from wishlist` : `Save ${item.title} to wishlist`
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        toggle(item)
      }}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      className={cn(
        "flex size-9 items-center justify-center rounded-full border border-border bg-surface text-fg shadow-sm transition-colors hover:border-cta",
        className
      )}
      data-testid="wishlist-toggle"
    >
      {heart}
    </button>
  )
}
