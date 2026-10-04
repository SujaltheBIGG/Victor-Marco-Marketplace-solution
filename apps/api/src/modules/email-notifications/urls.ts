const publicUrl = process.env.PUBLIC_URL?.replace(/\/$/, "")
const locale = process.env.STOREFRONT_DEFAULT_LOCALE || process.env.NEXT_PUBLIC_DEFAULT_REGION || "de"

// In production everything lives behind PUBLIC_URL; locally each app has its own port.
export const storefrontUrl = (path: string) => `${publicUrl || "http://localhost:3000"}/${locale}${path}`
export const sellerHubUrl = (path: string) => `${publicUrl ? `${publicUrl}/seller` : "http://localhost:7002"}${path}`
export const adminUrl = (path: string) => `${publicUrl ? `${publicUrl}/dashboard` : "http://localhost:7001"}${path}`

export const formatMoney = (amount: unknown, currency: string) =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency: currency.toUpperCase() }).format(Number(amount ?? 0))
