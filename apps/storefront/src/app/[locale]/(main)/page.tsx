import { HttpTypes } from "@medusajs/types"
import { HomeCategoryTiles } from "@/components/sections/HomeCategoryTiles/HomeCategoryTiles"
import { HomeHero } from "@/components/sections/HomeHero/HomeHero"
import { HomeProductRail } from "@/components/sections/HomeProductRail/HomeProductRail"
import { HomePromoBanner } from "@/components/sections/HomePromoBanner/HomePromoBanner"
import { HomeUspStrip } from "@/components/sections/HomeUspStrip/HomeUspStrip"

import type { Metadata } from "next"
import { headers } from "next/headers"
import Script from "next/script"
import { listCategories } from "@/lib/data/categories"
import { listProducts } from "@/lib/data/products"
import { listRegions } from "@/lib/data/regions"
import {
  buildHreflangAlternates,
  getStorefrontLocales,
  toHreflang,
} from "@/lib/helpers/hreflang"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "https"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`

  let locales: string[] = []
  try {
    locales = getStorefrontLocales(await listRegions())
  } catch {
    locales = [locale]
  }

  const { canonical, languages } = buildHreflangAlternates({
    baseUrl,
    path: "",
    locale,
    locales,
  })

  const title = "Shop Fleek"
  const description =
    "Discover home, technology, fashion, beauty, and outdoor finds from independent sellers on Fleek."
  const ogImage = "/B2C_Storefront_Open_Graph.png"

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-video-preview": -1,
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title: `${title} | ${
        process.env.NEXT_PUBLIC_SITE_NAME ||
        "Fleek Marketplace"
      }`,
      description,
      url: canonical,
      siteName:
        process.env.NEXT_PUBLIC_SITE_NAME ||
        "Fleek Marketplace",
      type: "website",
      images: [
        {
          url: ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`,
          width: 1200,
          height: 630,
          alt:
            process.env.NEXT_PUBLIC_SITE_NAME ||
            "Fleek Marketplace",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`],
    },
  }
}

const RAIL_SIZE = 10

const categoryTreeIds = (category: HttpTypes.StoreProductCategory) => [
  category.id,
  ...(category.category_children ?? []).map((child) => child.id),
]

const listRailProducts = async (
  locale: string,
  options: { order: string; categoryIds?: string[] }
) => {
  try {
    const { response } = await listProducts({
      countryCode: locale,
      category_id: options.categoryIds,
      queryParams: { limit: RAIL_SIZE, order: options.order },
    })
    return response.products
  } catch {
    return []
  }
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "https"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`

  const siteName =
    process.env.NEXT_PUBLIC_SITE_NAME ||
    "Fleek Marketplace"

  const { parentCategories } = await listCategories()
  const featuredDepartments = parentCategories.slice(0, 3)

  const [newProducts, ...departmentProducts] = await Promise.all([
    listRailProducts(locale, { order: "-created_at" }),
    ...featuredDepartments.map((category) =>
      listRailProducts(locale, { order: "created_at", categoryIds: categoryTreeIds(category) })
    ),
  ])

  const departmentRails = featuredDepartments.map((category, i) => ({
    category,
    products: departmentProducts[i],
  }))

  return (
    <main className="flex w-full flex-col text-fg">
      <Script
        id="ld-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: siteName,
            url: `${baseUrl}/${locale}`,
            logo: `${baseUrl}/favicon.ico`,
          }),
        }}
      />
      <Script
        id="ld-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteName,
            url: `${baseUrl}/${locale}`,
            inLanguage: toHreflang(locale),
          }),
        }}
      />

      <HomeHero />
      <HomeCategoryTiles categories={parentCategories} />
      <HomeProductRail
        id="new"
        heading="New on Fleek"
        products={newProducts}
        seeAllHref="/categories"
      />
      <HomePromoBanner />
      {departmentRails.map(({ category, products }) => (
        <HomeProductRail
          key={category.id}
          id={category.handle}
          heading={category.name}
          products={products}
          seeAllHref={`/categories/${category.handle}`}
        />
      ))}
      <HomeUspStrip />
    </main>
  )
}
