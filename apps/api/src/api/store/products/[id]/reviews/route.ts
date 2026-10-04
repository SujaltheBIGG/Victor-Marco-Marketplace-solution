import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type ReviewRow = {
  id: string
  rating: number
  customer_note: string | null
  seller_note: string | null
  status: string
  created_at: string
  customer?: { first_name: string | null; last_name: string | null } | null
}

// Published reviews of one product, newest first, for the product page.
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: [product],
  } = (await query.graph({
    entity: "product",
    fields: [
      "id",
      "reviews.id",
      "reviews.rating",
      "reviews.customer_note",
      "reviews.seller_note",
      "reviews.status",
      "reviews.created_at",
      "reviews.customer.first_name",
      "reviews.customer.last_name",
    ],
    filters: { id: req.params.id },
  })) as { data: { id: string; reviews?: ReviewRow[] | null }[] }

  const reviews = (product?.reviews ?? [])
    .filter((r) => r.status === "published")
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .map((r) => ({
      id: r.id,
      rating: r.rating,
      text: r.customer_note,
      response: r.seller_note,
      author: [r.customer?.first_name, r.customer?.last_name?.charAt(0)].filter(Boolean).join(" ") + (r.customer?.last_name ? "." : ""),
      created_at: r.created_at,
    }))

  const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

  res.json({ reviews, count: reviews.length, average: Math.round(average * 10) / 10 })
}
