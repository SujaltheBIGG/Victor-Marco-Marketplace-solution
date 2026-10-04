import Image from "next/image"
import { BadgeCheck, Lock, ShieldCheck } from "lucide-react"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import footerLinks from "@/data/footerLinks"
import { listCategories } from "@/lib/data/categories"

const linkClass =
  "inline-flex min-h-[44px] items-center py-2 text-fg-secondary transition-colors duration-150 hover:underline"

const testId = (label: string) => `footer-link-${label.toLowerCase().replace(/\s+/g, "-")}`

const LinkColumn = ({
  title,
  links,
  external = false,
}: {
  title: string
  links: { label: string; path: string }[]
  external?: boolean
}) => (
  <nav aria-label={title} className="flex flex-col gap-4">
    <h2 className="ui-label text-ui text-fg">{title}</h2>
    <ul className="flex flex-col gap-1">
      {links.map(({ label, path }) => (
        <li key={label}>
          {external ? (
            <a
              href={path}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              data-testid={testId(label)}
            >
              {label}
            </a>
          ) : (
            <LocalizedClientLink href={path} className={linkClass} data-testid={testId(label)}>
              {label}
            </LocalizedClientLink>
          )}
        </li>
      ))}
    </ul>
  </nav>
)

export async function Footer() {
  const { parentCategories, categories } = await listCategories().catch(() => ({
    parentCategories: [],
    categories: [],
  }))

  const shopLinks = parentCategories.map((c) => ({
    label: c.name,
    path: `/categories/${c.handle}`,
  }))

  return (
    <footer
      className="w-full border-t border-border-strong bg-surface-subtle text-fg"
      data-testid="footer"
    >
      <div className="mx-auto flex max-w-screen-xl flex-col gap-12 px-4 py-12 sm:px-6 lg:gap-16 lg:px-8 lg:py-16">
        <div className="flex items-center">
          <Image src="/Logo.svg" width={100} height={32} alt="Fleek" />
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          <LinkColumn title="Shop" links={shopLinks} />
          <LinkColumn title="Customer service" links={footerLinks.customerServices} />
          <LinkColumn title="About Fleek" links={footerLinks.about} />
          <LinkColumn title="Connect" links={footerLinks.connect} external />
        </div>

        {categories.length > 0 && (
          <div className="flex flex-col gap-8 border-t border-border pt-10">
            <nav aria-labelledby="footer-popular-categories" className="flex flex-col gap-3">
              <h3 id="footer-popular-categories" className="ui-label text-eyebrow text-muted">
                Popular categories
              </h3>
              <ul className="flex flex-wrap gap-x-5 gap-y-1">
                {categories.map((c) => (
                  <li key={c.id}>
                    <LocalizedClientLink
                      href={`/categories/${c.handle}`}
                      className="inline-flex min-h-[44px] items-center py-2 text-muted transition-colors hover:text-fg hover:underline"
                    >
                      {c.name}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}

        <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 border border-border bg-surface px-4 py-4">
          <li className="inline-flex items-center gap-2 text-body text-fg-secondary">
            <ShieldCheck className="size-4 shrink-0" aria-hidden />
            Buyer protection on every order
          </li>
          <li className="inline-flex items-center gap-2 text-body text-fg-secondary">
            <BadgeCheck className="size-4 shrink-0" aria-hidden />
            Verified sellers
          </li>
          <li className="inline-flex items-center gap-2 text-body text-fg-secondary">
            <Lock className="size-4 shrink-0" aria-hidden />
            Secure checkout
          </li>
        </ul>

        <div
          className="flex flex-col gap-2 border-t border-border pt-8 text-muted sm:flex-row sm:items-center sm:justify-between"
          data-testid="footer-copyright"
        >
          <p className="text-body">© {new Date().getFullYear()} Fleek</p>
          <p className="text-body">Marketplace powered by independent sellers</p>
        </div>
      </div>
    </footer>
  )
}
