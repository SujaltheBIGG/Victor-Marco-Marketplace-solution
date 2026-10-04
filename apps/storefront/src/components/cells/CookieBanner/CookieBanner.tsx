"use client"

import { useEffect, useState } from "react"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

const STORAGE_KEY = "fleek-cookie-consent"

export const CookieBanner = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      setVisible(!window.localStorage.getItem(STORAGE_KEY))
    } catch {
      setVisible(true)
    }
  }, [])

  const choose = (choice: "all" | "necessary") => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, at: new Date().toISOString() }))
    } catch {}
    setVisible(false)
  }

  if (!visible) {
    return null
  }

  return (
    <div
      role="region"
      aria-label="Cookie preferences"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-border-strong bg-surface shadow-[0_-8px_24px_rgba(0,0,0,0.08)]"
      data-testid="cookie-banner"
    >
      <div className="mx-auto flex max-w-screen-xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-small text-fg-secondary">
          We use necessary cookies to keep you signed in, remember your cart and show prices for your
          country. With your consent we also remember your preferences. Read our{" "}
          <LocalizedClientLink href="/cookies" className="underline underline-offset-2 hover:text-fg">
            cookie policy
          </LocalizedClientLink>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose("necessary")}
            className="ui-label border border-border-strong px-4 py-2.5 text-ui text-fg transition-colors hover:border-cta"
            data-testid="cookie-banner-necessary"
          >
            Necessary only
          </button>
          <button
            type="button"
            onClick={() => choose("all")}
            className="ui-label bg-cta px-4 py-2.5 text-ui text-cta-foreground transition-colors hover:bg-cta-hover"
            data-testid="cookie-banner-accept"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
