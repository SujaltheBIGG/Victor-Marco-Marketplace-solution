import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import { ChevronDown, LayoutDashboard, Package, Store, User } from "lucide-react"

import { CartDropdown, MobileNavbar } from "@/components/cells"
import { UserDropdown } from "@/components/cells/UserDropdown/UserDropdown"
import CountrySelector from "@/components/molecules/CountrySelector/CountrySelector"
import { HeaderSearch } from "@/components/molecules/HeaderSearch/HeaderSearch"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { MessageButton } from "@/components/molecules/MessageButton/MessageButton"
import { listCategories } from "@/lib/data/categories"
import { listRegions } from "@/lib/data/regions"
import { retrieveCustomer } from "@/lib/data/customer"

const utilityLinkClass =
  "hidden items-center gap-1.5 py-1 transition-colors hover:text-on-graphite sm:flex"

// Shown automatically in development; in production only when explicitly configured.
const adminUrl =
  process.env.NEXT_PUBLIC_ADMIN_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:7001" : undefined)

export const Header = async () => {
  const user = await retrieveCustomer().catch(() => null)
  const isLoggedIn = Boolean(user)

  const regions = await listRegions()

  const { categories, parentCategories } = (await listCategories({
    query: { include_ancestors_tree: true },
  })) as {
    categories: HttpTypes.StoreProductCategory[]
    parentCategories: HttpTypes.StoreProductCategory[]
  }

  return (
    <header className="sticky top-0 z-40 bg-surface" data-testid="header">
      <div className="bg-graphite text-on-graphite-muted" data-testid="header-utility-bar">
        <div className="mx-auto flex h-9 max-w-screen-xl items-center justify-between gap-3 overflow-hidden whitespace-nowrap px-4 text-xs sm:px-6">
          <p className="hidden text-small text-on-graphite-muted sm:block">
            Independent sellers. <span className="font-medium text-on-graphite">One checkout.</span>
          </p>
          <nav aria-label="Utility" className="ui-label ml-auto flex items-center gap-4">
            <a
              href={process.env.NEXT_PUBLIC_VENDOR_URL || "http://localhost:7002"}
              className={utilityLinkClass}
              data-testid="header-sell-link"
            >
              <Store className="size-3.5" aria-hidden />
              Sell on Fleek
            </a>
            {adminUrl && (
              <a href={adminUrl} className={utilityLinkClass} data-testid="header-admin-link">
                <LayoutDashboard className="size-3.5" aria-hidden />
                Admin
              </a>
            )}
            <LocalizedClientLink
              href={isLoggedIn ? "/user/orders" : "/login"}
              className={utilityLinkClass}
              data-testid="header-track-order-link"
            >
              <Package className="size-3.5" aria-hidden />
              Track order
            </LocalizedClientLink>
          </nav>
        </div>
      </div>

      <div className="border-b border-border">
        <div className="mx-auto flex max-w-screen-xl items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6">
          <div className="lg:hidden">
            <MobileNavbar parentCategories={parentCategories} categories={categories} />
          </div>
          <LocalizedClientLink
            href="/"
            className="inline-flex min-h-[44px] shrink-0 items-center"
            data-testid="header-logo-link"
          >
            <Image src="/Logo.svg" width={100} height={32} alt="Fleek" priority />
          </LocalizedClientLink>
          <HeaderSearch id="site-search" className="mx-auto hidden w-full max-w-xl sm:flex" />
          <div
            className="ml-auto flex items-center gap-1 sm:gap-3"
            data-testid="header-actions"
          >
            <CountrySelector regions={regions} />
            {isLoggedIn && <MessageButton />}
            {isLoggedIn ? (
              <UserDropdown isLoggedIn />
            ) : (
              <LocalizedClientLink
                href="/login"
                className="ui-label inline-flex items-center gap-2 px-2.5 py-2 text-ui text-fg hover:bg-surface-subtle"
                data-testid="header-sign-in-link"
              >
                <User className="size-5" aria-hidden />
                <span className="hidden lg:inline">Sign in</span>
              </LocalizedClientLink>
            )}
            <CartDropdown />
          </div>
        </div>
        <div className="px-4 pb-3 sm:hidden">
          <HeaderSearch id="site-search-mobile" compact className="flex" />
        </div>
      </div>

      <nav
        aria-label="Product categories"
        className="hidden border-b border-border bg-surface lg:block"
        data-testid="header-category-nav"
      >
        <ul className="mx-auto flex max-w-screen-xl flex-wrap items-stretch gap-x-5 px-4 sm:px-6">
          {parentCategories.map((parent) => {
            const children = parent.category_children ?? []
            return (
              <li key={parent.id} className="group/nav relative">
                <LocalizedClientLink
                  href={`/categories/${parent.handle}`}
                  className="ui-label flex h-11 items-center gap-1 whitespace-nowrap border-b-2 border-transparent text-[0.8125rem] text-fg-secondary transition-colors hover:text-fg group-hover/nav:border-fg"
                  data-testid={`header-category-${parent.handle}`}
                >
                  {parent.name}
                  {children.length > 0 && (
                    <ChevronDown
                      className="size-4 text-muted transition-transform group-hover/nav:rotate-180"
                      aria-hidden
                    />
                  )}
                </LocalizedClientLink>
                {children.length > 0 && (
                  <div className="pointer-events-none invisible absolute left-0 top-full z-30 min-w-[15rem] -translate-y-1 border border-t-0 border-border bg-surface p-4 opacity-0 shadow-md transition-[opacity,transform] duration-150 ease-out group-focus-within/nav:pointer-events-auto group-focus-within/nav:visible group-focus-within/nav:translate-y-0 group-focus-within/nav:opacity-100 group-hover/nav:pointer-events-auto group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:opacity-100 [li:nth-last-child(-n+2)_&]:left-auto [li:nth-last-child(-n+2)_&]:right-0">
                    <LocalizedClientLink
                      href={`/categories/${parent.handle}`}
                      className="ui-label block text-eyebrow text-fg"
                    >
                      {parent.name}
                    </LocalizedClientLink>
                    <ul className="mt-2 space-y-1.5">
                      {children.map((child) => (
                        <li key={child.id}>
                          <LocalizedClientLink
                            href={`/categories/${child.handle}`}
                            className="block text-small text-muted hover:text-fg"
                          >
                            {child.name}
                          </LocalizedClientLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            )
          })}
          <li>
            <LocalizedClientLink
              href="/categories"
              className="ui-label flex h-11 items-center whitespace-nowrap border-b-2 border-transparent text-[0.8125rem] text-fg-secondary transition-colors hover:border-fg hover:text-fg"
              data-testid="header-category-all"
            >
              All products
            </LocalizedClientLink>
          </li>
        </ul>
      </nav>
    </header>
  )
}
