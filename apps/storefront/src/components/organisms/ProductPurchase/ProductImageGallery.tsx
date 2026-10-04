"use client"

import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import { useState } from "react"

import { cn } from "@/lib/utils"

export const ProductImageGallery = ({
  images,
  title,
}: {
  images: HttpTypes.StoreProductImage[]
  title: string
}) => {
  const [active, setActive] = useState(0)
  const current = images[active] ?? images[0]

  return (
    <div className="flex flex-col gap-3" data-testid="product-gallery">
      <div className="relative aspect-square w-full overflow-hidden border border-border bg-surface">
        <Image
          src={current ? decodeURIComponent(current.url) : "/images/placeholder.svg"}
          alt={title}
          fill
          priority
          sizes="(min-width: 1280px) 592px, (min-width: 1024px) 46vw, 100vw"
          className="object-contain p-4"
          data-testid="product-gallery-main-image"
        />
      </div>
      {images.length > 1 && (
        <ul className="grid grid-cols-5 gap-3">
          {images.map((image, i) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-pressed={i === active}
                className={cn(
                  "relative block aspect-square w-full overflow-hidden border bg-surface transition-colors",
                  i === active ? "border-fg" : "border-border hover:border-border-strong"
                )}
                data-testid={`product-gallery-thumb-${i}`}
              >
                <Image
                  src={decodeURIComponent(image.url)}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-contain p-1.5"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
