import { HttpTypes } from "@medusajs/types"
import { ArrowRight } from "lucide-react"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { ProductTile } from "@/components/organisms/ProductTile/ProductTile"

export const HomeProductRail = ({
  id,
  heading,
  products,
  seeAllHref,
}: {
  id: string
  heading: string
  products: HttpTypes.StoreProduct[]
  seeAllHref?: string
}) => {
  if (!products.length) return null

  return (
    <section
      aria-labelledby={`rail-${id}-heading`}
      className="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6"
      data-testid={`home-rail-${id}`}
    >
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 id={`rail-${id}-heading`} className="font-display text-h1 font-normal text-heading">
          {heading}
        </h2>
        {seeAllHref && (
          <LocalizedClientLink
            href={seeAllHref}
            className="ui-label inline-flex items-center gap-1.5 text-ui text-fg hover:text-fg-secondary"
            data-testid={`home-rail-${id}-see-all`}
          >
            See all
            <ArrowRight className="size-4" aria-hidden />
          </LocalizedClientLink>
        )}
      </div>
      <ul className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-6 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <li
            key={product.id}
            className="w-[44vw] shrink-0 snap-start sm:w-[30vw] md:w-[14rem] lg:w-[15.5rem]"
          >
            <ProductTile product={product} />
          </li>
        ))}
      </ul>
    </section>
  )
}
