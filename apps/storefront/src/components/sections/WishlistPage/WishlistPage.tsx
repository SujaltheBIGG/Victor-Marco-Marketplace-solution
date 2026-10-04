"use client"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { ProductTileView } from "@/components/organisms/ProductTile/ProductTile"
import { useWishlist } from "@/components/providers/Wishlist/WishlistProvider"

export const WishlistPage = () => {
  const { items } = useWishlist()

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-10 sm:px-6" data-testid="wishlist-page">
      <h1 className="font-display text-h1 font-normal text-heading">Wishlist</h1>
      <p className="mt-2 text-body text-fg-secondary">
        {items.length
          ? `${items.length} saved ${items.length === 1 ? "item" : "items"}`
          : "Tap the heart on any product to save it here for later."}
      </p>
      {items.length ? (
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.handle}>
              <ProductTileView
                href={`/products/${item.handle}`}
                title={item.title}
                thumbnail={item.thumbnail}
                price={item.price}
                handle={item.handle}
              />
            </li>
          ))}
        </ul>
      ) : (
        <LocalizedClientLink
          href="/categories"
          className="ui-label mt-8 inline-flex items-center gap-2 bg-cta px-6 py-3 text-cta-foreground transition-colors hover:bg-cta-hover"
          data-testid="wishlist-browse-link"
        >
          Browse products
        </LocalizedClientLink>
      )}
    </div>
  )
}
