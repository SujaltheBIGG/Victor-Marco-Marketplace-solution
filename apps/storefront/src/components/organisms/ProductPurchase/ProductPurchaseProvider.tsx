"use client"

import { HttpTypes } from "@medusajs/types"
import { createContext, ReactNode, useContext, useMemo, useState } from "react"

import useGetAllSearchParams from "@/hooks/useGetAllSearchParams"
import { getBuyboxWinner, getVariantOffers, StoreOffer } from "@/lib/helpers/buybox"

type ProductPurchaseContextValue = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  selectedOptions: Record<string, string>
  variantOffers: StoreOffer[]
  selectedOffer?: StoreOffer
  selectOffer: (offerId: string) => void
}

const ProductPurchaseContext = createContext<ProductPurchaseContextValue | null>(null)

export const optionKey = (title?: string) => title?.toLowerCase() ?? ""

export const ProductPurchaseProvider = ({
  product,
  offers,
  children,
}: {
  product: HttpTypes.StoreProduct
  offers: StoreOffer[]
  children: ReactNode
}) => {
  const { allSearchParams } = useGetAllSearchParams()
  const [pickedOfferId, setPickedOfferId] = useState<string>()

  const defaultVariant = useMemo(() => {
    const variants = product.variants ?? []
    return variants.find((v) => getVariantOffers(offers, v.id).length > 0) ?? variants[0]
  }, [product.variants, offers])

  const selectedOptions: Record<string, string> = {
    ...Object.fromEntries(
      (defaultVariant?.options ?? []).map((o) => [optionKey(o.option?.title), o.value])
    ),
    ...allSearchParams,
  }

  const variant = product.variants?.find((v) =>
    (v.options ?? []).every((o) => selectedOptions[optionKey(o.option?.title)] === o.value)
  )

  const variantOffers = variant ? getVariantOffers(offers, variant.id) : []
  // A picked offer only applies while it belongs to the selected variant.
  const selectedOffer =
    variantOffers.find((o) => o.id === pickedOfferId) ?? getBuyboxWinner(variantOffers)

  return (
    <ProductPurchaseContext.Provider
      value={{
        product,
        variant,
        selectedOptions,
        variantOffers,
        selectedOffer,
        selectOffer: setPickedOfferId,
      }}
    >
      {children}
    </ProductPurchaseContext.Provider>
  )
}

export const useProductPurchase = () => {
  const context = useContext(ProductPurchaseContext)
  if (!context) {
    throw new Error("useProductPurchase must be used within a ProductPurchaseProvider")
  }
  return context
}
