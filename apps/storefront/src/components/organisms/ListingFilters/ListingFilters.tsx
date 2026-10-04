"use client"

import { Check, SlidersHorizontal } from "lucide-react"
import { useState } from "react"

import useFilters from "@/hooks/useFilters"
import type { SearchFacets } from "@/lib/data/products"
import { cn } from "@/lib/utils"

type FacetItem = { value: string; count?: number }

const FacetGroup = ({ attributeKey, items }: { attributeKey: string; items: FacetItem[] }) => {
  const { updateFilters, isFilterActive } = useFilters(attributeKey)

  if (!items.length) return null

  return (
    <div data-testid={`listing-filter-${attributeKey}`}>
      <div className="flex items-center gap-3">
        <h3 className="ui-label shrink-0 text-eyebrow text-fg">{attributeKey}</h3>
        <span className="h-px flex-1 bg-border" aria-hidden />
      </div>
      <ul className="mt-3 space-y-1">
        {items.map(({ value, count }) => {
          const checked = isFilterActive(value)
          const disabled = count === 0
          return (
            <li key={value}>
              <button
                type="button"
                role="checkbox"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => updateFilters(value)}
                className="flex w-full items-center gap-3 py-1.5 text-left text-small text-fg transition-colors hover:text-fg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                data-testid={`listing-filter-${attributeKey}-${value.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center border",
                    checked ? "border-fg bg-graphite text-on-graphite" : "border-border-strong bg-surface"
                  )}
                  aria-hidden
                >
                  {checked && <Check className="size-3" />}
                </span>
                <span className="flex-1">{value}</span>
                {typeof count === "number" && (
                  <span className="font-mono text-eyebrow tabular-nums text-muted">{count}</span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export const ListingFilters = ({ facets }: { facets: SearchFacets }) => {
  const [open, setOpen] = useState(false)
  const groups = Object.entries(facets.attributes ?? {}).filter(([, items]) => items?.length)

  if (!groups.length) return null

  return (
    <div data-testid="listing-filters">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="ui-label mb-4 flex w-full items-center justify-center gap-2 border border-border-strong py-2.5 text-ui text-fg lg:hidden"
      >
        <SlidersHorizontal className="size-4" aria-hidden />
        Filters
      </button>
      <div className={cn("flex-col gap-6 lg:flex", open ? "flex" : "hidden")}>
        {groups.map(([key, items]) => (
          <FacetGroup key={key} attributeKey={key} items={items as FacetItem[]} />
        ))}
      </div>
    </div>
  )
}
