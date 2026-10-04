"use client"

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"

const SORT_OPTIONS = [
  { value: "", label: "Relevance" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "created_at", label: "Newest" },
]

const useSetParams = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (changes: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }
}

export const ListingSort = () => {
  const searchParams = useSearchParams()
  const setParams = useSetParams()
  const current = searchParams.get("sortBy") ?? ""

  return (
    <label className="relative flex items-center border border-border-strong bg-surface pl-3 pr-9">
      <span className="ui-label text-eyebrow text-muted">Sort:</span>
      <select
        value={current}
        onChange={(e) => setParams({ sortBy: e.target.value || null, page: null })}
        className="ui-label h-10 cursor-pointer appearance-none bg-transparent pl-2 text-eyebrow text-fg focus:outline-none"
        data-testid="listing-sort"
      >
        {SORT_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 size-4 text-muted" aria-hidden />
    </label>
  )
}

const pageWindow = (current: number, total: number): (number | "gap")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, 2, total - 1, total, current - 1, current, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ["gap" as const, p] : [p]))
}

export const ListingPagination = ({ pages }: { pages: number }) => {
  const searchParams = useSearchParams()
  const setParams = useSetParams()
  const current = Math.min(Math.max(+(searchParams.get("page") || 1), 1), pages)

  if (pages <= 1) return null

  const goTo = (page: number) => {
    setParams({ page: page > 1 ? String(page) : null })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const cell = "flex size-9 items-center justify-center border text-small tabular-nums transition-colors"

  return (
    <nav aria-label="Pagination" className="mt-8 flex justify-center" data-testid="listing-pagination">
      <ul className="flex items-center gap-2">
        <li>
          <button
            type="button"
            aria-label="Previous page"
            disabled={current <= 1}
            onClick={() => goTo(current - 1)}
            className={cn(cell, "border-border text-fg hover:border-fg disabled:opacity-40")}
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
        </li>
        {pageWindow(current, pages).map((page, i) =>
          page === "gap" ? (
            <li key={`gap-${i}`} className="px-1 text-muted" aria-hidden>
              …
            </li>
          ) : (
            <li key={page}>
              <button
                type="button"
                aria-current={page === current ? "page" : undefined}
                onClick={() => goTo(page)}
                className={cn(
                  cell,
                  page === current
                    ? "border-fg bg-graphite text-on-graphite"
                    : "border-border text-fg hover:border-fg"
                )}
              >
                {page}
              </button>
            </li>
          )
        )}
        <li>
          <button
            type="button"
            aria-label="Next page"
            disabled={current >= pages}
            onClick={() => goTo(current + 1)}
            className={cn(cell, "border-border text-fg hover:border-fg disabled:opacity-40")}
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </li>
      </ul>
    </nav>
  )
}
