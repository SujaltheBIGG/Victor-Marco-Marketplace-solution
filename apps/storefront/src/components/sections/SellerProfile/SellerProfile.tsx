import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import { SellerDTO } from "@mercurjs/types"
import { CircleCheck } from "lucide-react"

import { Chat } from "@/components/organisms/Chat/Chat"

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((word) => /[a-z0-9]/i.test(word))
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("")

export const SellerProfile = ({
  seller,
  user,
}: {
  seller: SellerDTO
  user: HttpTypes.StoreCustomer | null
}) => {
  const memberSince = new Date(seller.created_at).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  })

  return (
    <section className="border border-border bg-surface p-6 sm:p-8" data-testid="seller-profile">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden border border-border bg-surface-subtle">
          {seller.logo ? (
            <Image src={seller.logo} alt={seller.name} fill sizes="64px" className="object-cover" />
          ) : (
            <span className="font-display text-h3 text-heading">{initials(seller.name)}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-h1 font-normal text-heading" data-testid="seller-name">
            {seller.name}
          </h1>
          {seller.status === "open" && (
            <span className="mt-2 inline-flex items-center gap-1 text-small font-medium text-success">
              <CircleCheck className="size-4" aria-hidden />
              Verified seller
            </span>
          )}
          {seller.description && (
            <p className="mt-3 max-w-2xl text-body text-fg-secondary">{seller.description}</p>
          )}
          <p className="ui-label mt-4 text-eyebrow text-muted">Selling on Fleek since {memberSince}</p>
        </div>
        {user && (
          <div className="sm:w-56">
            <Chat user={user} seller={seller} buttonClassNames="w-full uppercase" />
          </div>
        )}
      </div>
    </section>
  )
}
