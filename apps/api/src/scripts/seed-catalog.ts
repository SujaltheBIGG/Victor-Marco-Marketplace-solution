// Shape of a seeded catalog item. The catalog itself lives in
// seed-marketplace-catalog.ts.

export type SeedCatalogItem = {
  title: string
  brand: string
  colorway: string
  category:
    | "Sandals"
    | "Sneakers"
    | "Boots"
    | "Sport"
    | "Accessories"
    | "Home and Living"
    | "Electronics"
    | "Fashion"
    | "Beauty and Wellness"
    | "Sports and Outdoors"
  price: number
  subcategory?: string
  sized: boolean
  description: string
  images: string[]
}
