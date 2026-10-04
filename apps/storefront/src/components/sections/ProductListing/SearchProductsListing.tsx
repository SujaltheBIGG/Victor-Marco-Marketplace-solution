"use client"

import { HttpTypes } from "@medusajs/types"
import { ListingPagination, ListingSort } from "@/components/molecules/ListingControls/ListingControls"
import { ListingFilters } from "@/components/organisms/ListingFilters/ListingFilters"
import { ProductTile } from "@/components/organisms/ProductTile/ProductTile"
import { useSearchParams } from "next/navigation"
import { PRODUCT_LIMIT } from "@/const"
import { ProductListingSkeleton } from "@/components/organisms/ProductListingSkeleton/ProductListingSkeleton"
import { useEffect, useMemo, useState } from "react"
import {
  getSearchFacets,
  searchProducts,
  type SearchFacets,
} from "@/lib/data/products"
import type { SortOptions } from "@/types/product"
import { cn } from "@/lib/utils"

const EMPTY_FACETS: SearchFacets = { attributes: {} }

// URL params that drive the listing itself rather than attribute filters.
const RESERVED_PARAMS = new Set([
  "query",
  "page",
  "sortBy",
  "min_price",
  "max_price",
])

export const SearchProductsListing = ({
  category_id,
  collection_id,
  seller_id,
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION,
}: {
  category_id?: string | string[]
  collection_id?: string
  seller_id?: string
  locale?: string
}) => {
  const searchParams = useSearchParams()
  const categoryKey = Array.isArray(category_id)
    ? category_id.join(",")
    : category_id

  const query = searchParams.get("query") || ""
  const page = +(searchParams.get("page") || 1)
  const sortBy = (searchParams.get("sortBy") as SortOptions | null) || undefined

  const [facets, setFacets] = useState<SearchFacets>(EMPTY_FACETS)
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!locale) return
    getSearchFacets({ countryCode: locale, category_id, collection_id })
      .then(setFacets)
      .catch(() => setFacets(EMPTY_FACETS))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, categoryKey, collection_id])

  const searchParamsKey = searchParams.toString()
  const attributesKey = useMemo(() => {
    const selected: Record<string, string[]> = {}
    searchParams.forEach((raw, key) => {
      if (RESERVED_PARAMS.has(key) || !raw) {
        return
      }
      selected[key] = raw.split(",").filter(Boolean)
    })
    return JSON.stringify(selected)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsKey])
  const attributes = useMemo(
    () => JSON.parse(attributesKey) as Record<string, string[]>,
    [attributesKey]
  )

  useEffect(() => {
    async function fetchProducts() {
      if (!locale) return

      try {
        setIsLoading(true)
        const result = await searchProducts({
          query: query || undefined,
          countryCode: locale,
          category_id,
          collection_id,
          seller_id,
          attributes,
          page,
          limit: PRODUCT_LIMIT,
          sortBy,
        })

        setProducts(result.products)
        setCount(result.count)
      } catch (error) {
        setProducts([])
        setCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, categoryKey, collection_id, seller_id, query, page, sortBy, attributesKey])

  if (isLoading && products.length === 0) return <ProductListingSkeleton />

  const pages = Math.ceil(count / PRODUCT_LIMIT) || 1

  return (
    <div
      className="grid min-h-[50vh] gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10"
      data-testid="product-listing"
    >
      <aside>
        <ListingFilters facets={facets} />
      </aside>
      <div className="flex min-w-0 flex-col">
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-small text-muted" data-testid="listing-count">
            <span className="font-semibold text-fg">{count}</span>{" "}
            {count === 1 ? "product" : "products"}
          </p>
          <ListingSort />
        </div>
        {!isLoading && !products.length ? (
          <div className="flex flex-col items-center border border-border px-6 py-16 text-center">
            <p className="font-display text-h3 text-heading">No products found</p>
            <p className="mt-2 text-small text-muted">
              Try removing a filter or searching for something else.
            </p>
          </div>
        ) : (
          <ul
            className={cn(
              "grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4",
              isLoading && "opacity-60"
            )}
          >
            {products.map((product) => (
              <li key={product.id}>
                <ProductTile product={product} />
              </li>
            ))}
          </ul>
        )}
        <ListingPagination pages={pages} />
      </div>
    </div>
  )
}
