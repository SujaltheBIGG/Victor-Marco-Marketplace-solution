import { ListingPagination } from "@/components/molecules/ListingControls/ListingControls"
import { ProductTileView } from "@/components/organisms/ProductTile/ProductTile"
import { PRODUCT_LIMIT } from "@/const"
import { listOffers } from "@/lib/data/offers"
import { getOfferAmount, StoreOffer } from "@/lib/helpers/buybox"
import { convertToLocale } from "@/lib/helpers/money"

// Offers are fetched in one page and grouped per product, so a seller with
// several offers on one product shows a single tile at their lowest price.
const SELLER_OFFER_LIMIT = 500

export const SellerOffersListing = async ({
  seller_id,
  locale,
  page = 1,
}: {
  seller_id: string
  locale: string
  page?: number
}) => {
  const { offers } = await listOffers({
    sellerId: seller_id,
    countryCode: locale,
    limit: SELLER_OFFER_LIMIT,
  })

  const byProduct = new Map<string, StoreOffer>()
  for (const offer of offers as StoreOffer[]) {
    if (!offer.product) continue
    const current = byProduct.get(offer.product_id)
    const amount = getOfferAmount(offer) ?? Number.POSITIVE_INFINITY
    if (!current || amount < (getOfferAmount(current) ?? Number.POSITIVE_INFINITY)) {
      byProduct.set(offer.product_id, offer)
    }
  }

  const tiles = [...byProduct.values()]
  const pages = Math.ceil(tiles.length / PRODUCT_LIMIT) || 1
  const currentPage = Math.min(Math.max(page, 1), pages)
  const visible = tiles.slice((currentPage - 1) * PRODUCT_LIMIT, currentPage * PRODUCT_LIMIT)

  return (
    <section className="mt-10" data-testid="seller-offers-listing">
      <p className="mb-4 text-small text-muted">
        <span className="font-semibold text-fg">{tiles.length}</span>{" "}
        {tiles.length === 1 ? "product" : "products"} from this seller
      </p>
      {visible.length === 0 ? (
        <div className="border border-border px-6 py-16 text-center">
          <p className="font-display text-h3 text-heading">No products listed yet</p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((offer) => {
            const amount = getOfferAmount(offer)
            return (
              <li key={offer.product_id}>
                <ProductTileView
                  href={`/products/${offer.product?.handle}`}
                  title={offer.product?.title ?? "Product"}
                  thumbnail={offer.product?.thumbnail}
                  handle={offer.product?.handle}
                  price={
                    amount !== null
                      ? convertToLocale({
                          amount,
                          currency_code: offer.calculated_price?.currency_code ?? "eur",
                        })
                      : null
                  }
                />
              </li>
            )
          })}
        </ul>
      )}
      <ListingPagination pages={pages} />
    </section>
  )
}
