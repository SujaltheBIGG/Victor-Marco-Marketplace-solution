import { HttpTypes } from "@medusajs/types"
import {
  Dumbbell,
  LayoutGrid,
  type LucideIcon,
  Shirt,
  Smartphone,
  Sofa,
  Sparkles,
  Tag,
} from "lucide-react"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

const ICONS: Record<string, LucideIcon> = {
  "home-and-living": Sofa,
  electronics: Smartphone,
  fashion: Shirt,
  "beauty-and-wellness": Sparkles,
  "sports-and-outdoors": Dumbbell,
}

const Tile = ({
  href,
  label,
  Icon,
  highlight = false,
}: {
  href: string
  label: string
  Icon: LucideIcon
  highlight?: boolean
}) => (
  <li className="min-w-[6.5rem] shrink-0 sm:min-w-0">
    <LocalizedClientLink
      href={href}
      className="group flex h-full flex-col items-center gap-3 bg-surface px-3 py-6 text-center transition-colors duration-150 hover:bg-surface-subtle"
      data-testid={`home-category-tile-${href.split("/").pop()}`}
    >
      <Icon className="size-6 text-fg" aria-hidden />
      <span
        className={`ui-label text-[0.6875rem] leading-tight sm:text-eyebrow ${
          highlight ? "text-cta-hover" : "text-fg"
        }`}
      >
        {label}
      </span>
    </LocalizedClientLink>
  </li>
)

export const HomeCategoryTiles = ({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) => (
  <section
    aria-labelledby="categories-heading"
    className="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6"
  >
    <h2 id="categories-heading" className="sr-only">
      Shop by department
    </h2>
    <ul className="flex gap-px overflow-x-auto bg-border-strong [scrollbar-width:none] sm:grid sm:grid-cols-3 lg:grid-cols-6 [&::-webkit-scrollbar]:hidden">
      {categories.map((category) => (
        <Tile
          key={category.id}
          href={`/categories/${category.handle}`}
          label={category.name}
          Icon={ICONS[category.handle] ?? Tag}
        />
      ))}
      <Tile href="/categories" label="All products" Icon={LayoutGrid} highlight />
    </ul>
  </section>
)
