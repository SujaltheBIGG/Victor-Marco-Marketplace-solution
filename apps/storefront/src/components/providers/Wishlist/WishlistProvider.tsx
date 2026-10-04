"use client"

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"

export type WishlistItem = {
  handle: string
  title: string
  thumbnail?: string | null
  price?: string | null
}

type WishlistContextValue = {
  items: WishlistItem[]
  has: (handle: string) => boolean
  toggle: (item: WishlistItem) => void
  remove: (handle: string) => void
}

// Saved items live in this browser, so shoppers can use the wishlist without
// signing in.
const STORAGE_KEY = "fleek-wishlist"

const WishlistContext = createContext<WishlistContextValue | null>(null)

const readItems = (): WishlistItem[] => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]")
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeItems = (items: WishlistItem[]) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {}
}

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>([])

  useEffect(() => {
    setItems(readItems())
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setItems(readItems())
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const update = useCallback((next: (prev: WishlistItem[]) => WishlistItem[]) => {
    setItems((prev) => {
      const value = next(prev)
      writeItems(value)
      return value
    })
  }, [])

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      has: (handle) => items.some((item) => item.handle === handle),
      toggle: (item) =>
        update((prev) =>
          prev.some((saved) => saved.handle === item.handle)
            ? prev.filter((saved) => saved.handle !== item.handle)
            : [item, ...prev]
        ),
      remove: (handle) => update((prev) => prev.filter((item) => item.handle !== handle)),
    }),
    [items, update]
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider")
  }
  return context
}
