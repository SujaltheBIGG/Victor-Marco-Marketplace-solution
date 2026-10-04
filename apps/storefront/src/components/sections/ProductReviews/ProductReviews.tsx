import { Star } from "lucide-react"

import type { ProductReviewList } from "@/lib/data/reviews"
import { cn } from "@/lib/utils"

export const RatingStars = ({ value, size = "size-4" }: { value: number; size?: string }) => (
  <span className="inline-flex items-center gap-0.5" aria-hidden>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={cn(size, i <= Math.round(value) ? "fill-cta text-cta" : "fill-none text-border-strong")}
      />
    ))}
  </span>
)

export const RatingSummary = ({ average, count }: { average: number; count: number }) => (
  <a
    href="#reviews"
    className="mt-3 inline-flex items-center gap-2 text-small text-fg-secondary hover:text-fg"
    data-testid="product-rating-summary"
  >
    <RatingStars value={average} />
    <span>
      <span className="font-medium text-fg">{average.toFixed(1)}</span> · {count}{" "}
      {count === 1 ? "review" : "reviews"}
    </span>
    <span className="sr-only">Rated {average.toFixed(1)} out of 5</span>
  </a>
)

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })

export const ProductReviews = ({ data }: { data: ProductReviewList }) => (
  <section id="reviews" aria-labelledby="reviews-heading" className="scroll-mt-24" data-testid="product-reviews">
    <h2 id="reviews-heading" className="font-display text-h2 font-normal text-heading">
      Customer reviews
    </h2>
    {data.count === 0 ? (
      <p className="mt-4 text-body text-fg-secondary">
        No reviews yet. Reviews appear here once customers have received their order.
      </p>
    ) : (
      <>
        <div className="mt-4 flex items-center gap-4">
          <span className="font-display text-[2.5rem] font-medium leading-none text-heading">
            {data.average.toFixed(1)}
          </span>
          <div>
            <RatingStars value={data.average} size="size-5" />
            <p className="mt-1 text-small text-muted">
              Based on {data.count} {data.count === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {data.reviews.map((review) => (
            <li key={review.id} className="py-5" data-testid="product-review">
              <div className="flex items-center justify-between gap-4">
                <RatingStars value={review.rating} />
                <time dateTime={review.created_at} className="text-small text-muted">
                  {formatDate(review.created_at)}
                </time>
              </div>
              {review.text && <p className="mt-2 text-body text-fg">{review.text}</p>}
              <p className="mt-2 text-small text-muted">{review.author || "Fleek customer"}</p>
              {review.response && (
                <p className="mt-3 border-l-2 border-border-strong pl-3 text-small text-fg-secondary">
                  <span className="font-medium text-fg">Seller reply:</span> {review.response}
                </p>
              )}
            </li>
          ))}
        </ul>
      </>
    )}
  </section>
)
