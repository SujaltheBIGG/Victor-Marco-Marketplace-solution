"use client"

import Image from "next/image"
import { Search } from "lucide-react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { KeyboardEvent, useEffect, useId, useRef, useState } from "react"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { getSearchSuggestions, SearchSuggestions } from "@/lib/data/search-suggestions"
import { cn } from "@/lib/utils"

const PLACEHOLDER = "Search products, brands and categories"
const NO_SUGGESTIONS: SearchSuggestions = { products: [], categories: [] }

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
  const { locale } = useParams<{ locale: string }>()
  const [search, setSearch] = useState(searchParams.get("query") || "")
  const [suggestions, setSuggestions] = useState<SearchSuggestions>(NO_SUGGESTIONS)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const listId = useId()
  const formRef = useRef<HTMLFormElement>(null)

  const term = search.trim()

  useEffect(() => {
    if (term.length < 2) {
      setSuggestions(NO_SUGGESTIONS)
      return
    }
    let cancelled = false
    const timer = setTimeout(() => {
      getSearchSuggestions(term, locale)
        .then((result) => {
          if (!cancelled) {
            setSuggestions(result)
            setActive(-1)
          }
        })
        .catch(() => {})
    }, 200)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [term, locale])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!formRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [])

  const links = [
    ...suggestions.categories.map((c) => `/categories/${c.handle}`),
    ...suggestions.products.map((p) => `/products/${p.handle}`),
  ]
  const showPanel = open && term.length >= 2

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setOpen(false)
    if (showPanel && active >= 0 && links[active]) {
      router.push(`/${locale}${links[active]}`)
      return
    }
    router.push(term ? `/categories?query=${encodeURIComponent(term)}` : "/categories")
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false)
    } else if (e.key === "ArrowDown" && links.length) {
      e.preventDefault()
      setOpen(true)
      setActive((i) => (i + 1) % links.length)
    } else if (e.key === "ArrowUp" && links.length) {
      e.preventDefault()
      setActive((i) => (i <= 0 ? links.length - 1 : i - 1))
    }
  }

  const optionClass = (index: number) => cn("hover:bg-surface-subtle", active === index && "bg-surface-subtle")

  return (
    <form ref={formRef} role="search" onSubmit={onSubmit} className={cn("relative items-center", className)}>
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
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder={PLACEHOLDER}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
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

      {showPanel && (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 border border-border-strong bg-surface shadow-lg"
          data-testid={`${id}-suggestions`}
        >
          {suggestions.categories.length > 0 && (
            <div className="border-b border-border px-3 py-2">
              <p className="ui-label text-eyebrow text-muted">Categories</p>
              <ul className="mt-1">
                {suggestions.categories.map((category, i) => (
                  <li key={category.handle}>
                    <LocalizedClientLink
                      href={`/categories/${category.handle}`}
                      onClick={() => setOpen(false)}
                      role="option"
                      aria-selected={active === i}
                      className={cn("block px-2 py-1.5 text-small text-fg", optionClass(i))}
                    >
                      {category.name}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {suggestions.products.length > 0 && (
            <ul className="py-1">
              {suggestions.products.map((product, j) => {
                const index = suggestions.categories.length + j
                return (
                  <li key={product.handle}>
                    <LocalizedClientLink
                      href={`/products/${product.handle}`}
                      onClick={() => setOpen(false)}
                      role="option"
                      aria-selected={active === index}
                      className={cn("flex items-center gap-3 px-3 py-2", optionClass(index))}
                      data-testid={`${id}-suggestion`}
                    >
                      <span className="relative size-10 shrink-0 overflow-hidden border border-border bg-surface-subtle">
                        {product.thumbnail && (
                          <Image
                            src={decodeURIComponent(product.thumbnail)}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        )}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-small text-fg">{product.title}</span>
                      {product.price && (
                        <span className="text-small font-medium tabular-nums text-heading">{product.price}</span>
                      )}
                    </LocalizedClientLink>
                  </li>
                )
              })}
            </ul>
          )}
          {links.length === 0 && (
            <p className="px-3 py-3 text-small text-muted">No quick matches. Press Enter to search the whole catalog.</p>
          )}
          <button
            type="submit"
            className="block w-full border-t border-border px-3 py-2.5 text-left text-small font-medium text-fg hover:bg-surface-subtle"
          >
            See all results for “{term}”
          </button>
        </div>
      )}
    </form>
  )
}
