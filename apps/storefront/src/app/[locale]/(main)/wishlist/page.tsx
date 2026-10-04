import type { Metadata } from "next"

import { WishlistPage } from "@/components/sections/WishlistPage/WishlistPage"

export const metadata: Metadata = { title: "Wishlist" }

export default function Page() {
  return <WishlistPage />
}
