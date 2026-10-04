import Image from "next/image"
import { Lock, ShieldCheck } from "lucide-react"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-border" data-testid="checkout-header">
        <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6">
          <LocalizedClientLink href="/" className="inline-flex items-center" data-testid="checkout-logo-link">
            <Image src="/Logo.svg" width={100} height={32} alt="Fleek" priority />
          </LocalizedClientLink>
          <span className="inline-flex items-center gap-1.5 text-small text-fg-secondary">
            <ShieldCheck className="size-4 text-success" aria-hidden />
            Secure checkout
          </span>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t border-border" data-testid="checkout-footer">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-3 px-4 py-6 text-body text-fg-secondary sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span className="inline-flex items-center gap-2">
            <Lock className="size-4" aria-hidden />
            Secure checkout
          </span>
          <nav aria-label="Legal" className="flex gap-5">
            <LocalizedClientLink href="/cart" className="hover:text-fg">
              Back to cart
            </LocalizedClientLink>
            <span>Terms</span>
            <span>Privacy</span>
          </nav>
          <span>© {new Date().getFullYear()} Fleek</span>
        </div>
      </footer>
    </div>
  )
}
