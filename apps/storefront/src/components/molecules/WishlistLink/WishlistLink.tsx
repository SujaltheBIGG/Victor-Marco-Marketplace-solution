"use client"

import { Heart } from "lucide-react"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { useWishlist } from "@/components/providers/Wishlist/WishlistProvider"

export const WishlistLink = () => {
  const { items } = useWishlist()

  return (
    <LocalizedClientLink
      href="/wishlist"
      className="relative inline-flex items-center px-2.5 py-2 text-fg hover:bg-surface-subtle"
      aria-label={`Wishlist, ${items.length} ${items.length === 1 ? "item" : "items"}`}
      data-testid="header-wishlist-link"
    >
      <Heart className="size-5" aria-hidden />
      {items.length > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-cta px-1 text-[10px] font-semibold leading-none text-cta-foreground">
          {items.length}
        </span>
      )}
    </LocalizedClientLink>
  )
}
