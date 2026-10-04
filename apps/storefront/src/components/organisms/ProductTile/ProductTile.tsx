import Image from "next/image"
import { HttpTypes } from "@medusajs/types"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { getProductPrice } from "@/lib/helpers/get-product-price"

export const ProductTileView = ({
  href,
  title,
  thumbnail,
  price,
  originalPrice,
  handle,
}: {
  href: string
  title: string
  thumbnail?: string | null
  price?: string | null
  originalPrice?: string | null
  handle?: string | null
}) => (
  <article
    className="group/tile relative flex h-full flex-col overflow-hidden border border-border bg-surface transition-colors duration-150 hover:border-cta"
    data-testid="product-tile"
    data-product-handle={handle ?? undefined}
  >
    <div className="relative aspect-square overflow-hidden bg-surface-subtle">
      <Image
        src={thumbnail ? decodeURIComponent(thumbnail) : "/images/placeholder.svg"}
        alt={title}
        fill
        sizes="(min-width: 1024px) 248px, (min-width: 640px) 30vw, 44vw"
        className="object-cover"
      />
    </div>
    <div className="flex flex-1 flex-col gap-1.5 p-3">
      <h3 className="text-small font-medium text-fg">
        <LocalizedClientLink
          href={href}
          className="line-clamp-2 after:absolute after:inset-0 after:content-[''] hover:text-heading"
          data-testid="product-tile-link"
        >
          {title}
        </LocalizedClientLink>
      </h3>
      {price && (
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="font-display text-h3 font-medium tabular-nums text-heading">{price}</span>
          {originalPrice && originalPrice !== price && (
            <span className="text-small tabular-nums text-muted line-through">{originalPrice}</span>
          )}
        </div>
      )}
    </div>
  </article>
)

export const ProductTile = ({ product }: { product: HttpTypes.StoreProduct }) => {
  const { cheapestPrice } = getProductPrice({ product })

  return (
    <ProductTileView
      href={`/products/${product.handle}`}
      title={product.title || "Product"}
      thumbnail={product.thumbnail}
      price={cheapestPrice?.calculated_price}
      originalPrice={cheapestPrice?.original_price}
      handle={product.handle}
    />
  )
}
