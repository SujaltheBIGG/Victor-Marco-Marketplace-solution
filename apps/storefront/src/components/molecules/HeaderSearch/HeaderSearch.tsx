"use client"

import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"

const PLACEHOLDER = "Search products, brands and categories"

export const HeaderSearch = ({
  id,
  compact = false,
  className,
}: {
  id: string
  compact?: boolean
  className?: string
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("query") || "")

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const query = search.trim()
    router.push(query ? `/categories?query=${encodeURIComponent(query)}` : "/categories")
  }

  return (
    <form role="search" onSubmit={onSubmit} className={cn("relative items-center", className)}>
      <label htmlFor={id} className="sr-only">
        {PLACEHOLDER}
      </label>
      <div
        className={cn(
          "flex w-full items-center overflow-hidden bg-surface transition-colors focus-within:border-cta",
          compact ? "border border-border-strong" : "border-2 border-border-strong"
        )}
      >
        <Search className="ml-3 size-5 shrink-0 text-muted" aria-hidden />
        <input
          id={id}
          type="search"
          autoComplete="off"
          placeholder={PLACEHOLDER}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent px-3 py-2.5 text-small text-fg placeholder:text-muted focus:outline-none"
          data-testid={`${id}-input`}
        />
        {!compact && (
          <button
            type="submit"
            className="ui-label h-full shrink-0 bg-graphite px-5 py-2.5 text-ui text-on-graphite transition-colors hover:bg-graphite-raised"
            data-testid={`${id}-submit`}
          >
            Search
          </button>
        )}
      </div>
    </form>
  )
}
