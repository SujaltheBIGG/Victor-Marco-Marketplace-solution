import { HttpTypes } from "@medusajs/types"
import { ShieldCheck } from "lucide-react"
import { notFound } from "next/navigation"

import { Crumb, PageBreadcrumbs } from "@/components/molecules/PageBreadcrumbs/PageBreadcrumbs"
import { Chat } from "@/components/organisms/Chat/Chat"
import { ProductBuyBox } from "@/components/organisms/ProductPurchase/ProductBuyBox"
import { ProductImageGallery } from "@/components/organisms/ProductPurchase/ProductImageGallery"
import { ProductOffersList } from "@/components/organisms/ProductPurchase/ProductOffersList"
import { ProductPurchaseProvider } from "@/components/organisms/ProductPurchase/ProductPurchaseProvider"
import { HomeProductRail } from "@/components/sections/HomeProductRail/HomeProductRail"
import { retrieveCustomer } from "@/lib/data/customer"
import { listOffers } from "@/lib/data/offers"
import { PRODUCT_DETAIL_FIELDS } from "@/lib/data/product-fields"
import { listProducts } from "@/lib/data/products"
import { getBuyboxWinner, rankOffers, StoreOffer } from "@/lib/helpers/buybox"
import { isRichText, sanitizeRichText } from "@/lib/helpers/sanitize-rich-text"

const COMPLIANCE = [
  {
    title: "Warranty",
    text: "Every product carries the legal warranty, and Fleek adds 30-day returns on every order.",
  },
  {
    title: "Product safety (GPSR)",
    text: "Sellers confirm their listings meet EU product-safety rules. Safety information and the responsible operator are available on request.",
  },
]

const sectionHeading = "font-display text-h2 font-normal text-heading"

type AttributeValue = { id: string; name: string; attribute?: { name: string } | null }

const groupSpecifications = (values: AttributeValue[]) => {
  const rows = new Map<string, string[]>()
  for (const value of values) {
    const name = value.attribute?.name
    if (!name || !value.name) continue
    rows.set(name, [...(rows.get(name) ?? []), value.name])
  }
  return [...rows.entries()]
}

export const ProductDetailsPage = async ({
  handle,
  locale,
}: {
  handle: string
  locale: string
}) => {
  const product = (await listProducts({
    countryCode: locale,
    queryParams: { handle: [handle], limit: 1, fields: PRODUCT_DETAIL_FIELDS },
  }).then(({ response }) => response.products[0])) as
    | (HttpTypes.StoreProduct & { product_attribute_values?: AttributeValue[] })
    | undefined

  if (!product) notFound()

  const category = product.categories?.[0]

  const [{ offers }, customer, related] = await Promise.all([
    listOffers({ productId: product.id, countryCode: locale }),
    retrieveCustomer(),
    category
      ? listProducts({
          countryCode: locale,
          category_id: category.id,
          queryParams: { limit: 11 },
        }).then(({ response }) =>
          response.products.filter((p) => p.id !== product.id).slice(0, 10)
        )
      : Promise.resolve([]),
  ])

  const storeOffers = offers as StoreOffer[]
  const chatSeller = getBuyboxWinner(rankOffers(storeOffers))?.seller
  const specifications = groupSpecifications(product.product_attribute_values ?? [])

  const breadcrumbs: Crumb[] = [{ label: "Home", href: "/" }]
  if (category?.parent_category) {
    breadcrumbs.push({
      label: category.parent_category.name,
      href: `/categories/${category.parent_category.handle}`,
    })
  }
  if (category) {
    breadcrumbs.push({ label: category.name, href: `/categories/${category.handle}` })
  }
  breadcrumbs.push({ label: product.title })

  return (
    <ProductPurchaseProvider product={product} offers={storeOffers}>
      <div className="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6" data-testid="product-details-page">
        <PageBreadcrumbs items={breadcrumbs} />

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductImageGallery images={product.images ?? []} title={product.title} />
          <ProductBuyBox locale={locale}>
            {customer && chatSeller && (
              <div className="mt-5">
                <Chat
                  user={customer}
                  seller={chatSeller}
                  buttonClassNames="w-full uppercase"
                  product={product}
                />
              </div>
            )}
          </ProductBuyBox>
        </div>

        <div className="mt-16 flex max-w-3xl flex-col gap-14">
          {product.description && (
            <section aria-labelledby="description-heading" data-testid="product-description">
              <h2 id="description-heading" className={sectionHeading}>
                Description
              </h2>
              {isRichText(product.description) ? (
                <div
                  className="mt-4 text-body text-fg-secondary [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-border-strong [&_blockquote]:pl-4 [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-h3 [&_h2]:text-heading [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:font-medium [&_h3]:text-fg [&_img]:hidden [&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichText(product.description) }}
                />
              ) : (
                <p className="mt-4 whitespace-pre-line text-body text-fg-secondary">
                  {product.description}
                </p>
              )}
            </section>
          )}

          <ProductOffersList />

          {specifications.length > 0 && (
            <section aria-labelledby="specs-heading" data-testid="product-specifications">
              <h2 id="specs-heading" className={sectionHeading}>
                Specifications
              </h2>
              <dl className="mt-4 divide-y divide-border border border-border">
                {specifications.map(([name, values]) => (
                  <div key={name} className="grid grid-cols-[10rem_1fr] gap-4 px-4 py-3 text-small">
                    <dt className="text-muted">{name}</dt>
                    <dd className="text-fg">{values.join(", ")}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section aria-labelledby="compliance-heading" data-testid="product-compliance">
            <h2 id="compliance-heading" className={sectionHeading}>
              Compliance &amp; warranty
            </h2>
            <div className="mt-4 grid gap-6 border border-border p-5 sm:grid-cols-2">
              {COMPLIANCE.map(({ title, text }) => (
                <div key={title} className="flex gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center border border-border">
                    <ShieldCheck className="size-4" aria-hidden />
                  </span>
                  <div>
                    <p className="text-small font-medium text-fg">{title}</p>
                    <p className="mt-1 text-small text-muted">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-6">
        <HomeProductRail id="related" heading="You might also like" products={related} />
      </div>
    </ProductPurchaseProvider>
  )
}
