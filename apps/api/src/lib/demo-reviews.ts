import { Link } from "@medusajs/framework/modules-sdk"
import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { MercurModules } from "@mercurjs/types"

type ReviewInput = {
  reference: "product" | "seller"
  rating: number
  customer_note: string
  seller_note: string | null
  status: "published"
  created_at: Date
}
type ReviewModuleService = {
  createReviews(data: ReviewInput[]): Promise<{ id: string }[]>
}

const REVIEWERS = [
  ["Anna", "Weber"], ["Lukas", "Schmidt"], ["Sophie", "Martin"], ["Marco", "Rossi"],
  ["Elena", "García"], ["Jonas", "Becker"], ["Clara", "Dubois"], ["Oliver", "Hughes"],
  ["Freja", "Nielsen"], ["Emil", "Larsson"], ["Lucía", "Fernández"], ["Paul", "Hoffmann"],
] as const
const reviewerEmail = (first: string, last: string) =>
  `${first}.${last}`.toLowerCase().normalize("NFD").replace(/[^a-z.]/g, "") + "@reviewers.fleek.test"

const PRODUCT_NOTES: Record<number, string[]> = {
  5: [
    "Exactly as described and arrived two days after ordering. Really happy with it.",
    "Great quality for the price. Neatly packed and the seller kept me updated.",
    "Second order from this seller and again everything was perfect.",
    "Looks even better in person. Would definitely buy again.",
    "Fast delivery and it feels really well made.",
  ],
  4: [
    "Very good overall. Delivery took a day longer than expected, but the product is great.",
    "Solid quality and works as promised. The instructions could be clearer.",
    "Good value for money. The colour is slightly different from the photos, but I like it.",
    "Does the job well and arrived well packed. Happy with the purchase.",
  ],
  3: [
    "Decent, but not quite as premium as I hoped for the price.",
    "Okay product. It arrived safely, but the setup took a while.",
  ],
}
const SELLER_NOTES: Record<number, string[]> = {
  5: [
    "Quick dispatch, careful packaging and friendly replies to my question.",
    "Reliable seller. Everything arrived on time and as described.",
    "Smooth from order to delivery. I will shop here again.",
  ],
  4: [
    "Good seller, the parcel just took a little longer than the estimate.",
    "Helpful when I asked about sizing. Delivery was fine.",
  ],
}
const RESPONSES = [
  "Thank you for the kind review, enjoy your purchase!",
  "Thanks for the feedback, we have shared it with our packing team.",
  "Glad you like it! Get in touch any time if you need help.",
]
const RATINGS = [5, 5, 4, 5, 4, 5, 3, 5, 4, 5, 5, 4]
const DAY = 24 * 60 * 60 * 1000

const buildReviews = (reference: "product" | "seller", seed: number, count: number): ReviewInput[] =>
  Array.from({ length: count }, (_, i) => {
    const rating = reference === "seller" ? Math.max(4, RATINGS[(seed + i) % RATINGS.length]) : RATINGS[(seed + i) % RATINGS.length]
    const notes = (reference === "seller" ? SELLER_NOTES : PRODUCT_NOTES)[rating]
    return {
      reference,
      rating,
      customer_note: notes[(seed * 3 + i) % notes.length],
      seller_note: (seed + i) % 3 === 0 ? RESPONSES[(seed + i) % RESPONSES.length] : null,
      status: "published",
      created_at: new Date(Date.now() - (3 + ((seed * 7 + i * 11) % 160)) * DAY),
    }
  })

// Demo shoppers' reviews so product and seller pages show ratings; only
// products and sellers without any review get them, so it is safe on every boot.
export async function ensureDemoReviews(container: MedusaContainer) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve<Link>(ContainerRegistrationKeys.LINK)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const reviewService = container.resolve<ReviewModuleService>(MercurModules.REVIEW)
  const customerModule = container.resolve(Modules.CUSTOMER)

  const emails = REVIEWERS.map(([first, last]) => reviewerEmail(first, last))
  const existing = await customerModule.listCustomers({ email: emails })
  const missing = REVIEWERS.filter(([first, last]) => !existing.some((c) => c.email === reviewerEmail(first, last)))
  const created = missing.length
    ? await customerModule.createCustomers(
        missing.map(([first_name, last_name]) => ({ first_name, last_name, email: reviewerEmail(first_name, last_name) }))
      )
    : []
  const reviewerIds = [...existing, ...created].map((c) => c.id)

  const { data: products } = (await query.graph({
    entity: "product",
    fields: ["id", "reviews.id"],
    filters: { status: "published" },
  })) as { data: { id: string; reviews?: { id: string }[] | null }[] }
  const { data: sellers } = (await query.graph({
    entity: "seller",
    fields: ["id", "reviews.id"],
    filters: { status: "open" },
  })) as { data: { id: string; reviews?: { id: string }[] | null }[] }

  const targets = [
    ...products.filter((p) => !p.reviews?.length).map((p, i) => ({ key: Modules.PRODUCT, field: "product_id", id: p.id, reference: "product" as const, count: 2 + (i % 4), seed: i })),
    ...sellers.filter((s) => !s.reviews?.length).map((s, i) => ({ key: MercurModules.SELLER, field: "seller_id", id: s.id, reference: "seller" as const, count: 4 + (i % 4), seed: i + 5 })),
  ]
  if (!targets.length) {
    return
  }

  const inputs = targets.flatMap((t) => buildReviews(t.reference, t.seed, t.count))
  const reviews = await reviewService.createReviews(inputs)

  let cursor = 0
  const links: Record<string, Record<string, string>>[] = []
  for (const t of targets) {
    for (let i = 0; i < t.count; i++) {
      const review = reviews[cursor++]
      links.push(
        { [t.key]: { [t.field]: t.id }, [MercurModules.REVIEW]: { review_id: review.id } },
        { [Modules.CUSTOMER]: { customer_id: reviewerIds[(t.seed + i * 5) % reviewerIds.length] }, [MercurModules.REVIEW]: { review_id: review.id } }
      )
    }
  }
  await link.create(links)
  logger.info(`Added ${reviews.length} demo reviews to ${targets.length} products and sellers`)
}
