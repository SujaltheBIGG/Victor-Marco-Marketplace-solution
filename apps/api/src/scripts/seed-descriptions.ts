import type { SeedCatalogItem } from "./seed-catalog"

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

export const buildProductDescription = (item: SeedCatalogItem): string =>
  `<p>${escapeHtml(item.description)}</p>` +
  `<p>Brand: <strong>${escapeHtml(item.brand)}</strong> · Colour: <strong>${escapeHtml(item.colorway)}</strong></p>`
