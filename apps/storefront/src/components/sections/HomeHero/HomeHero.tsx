import Image from "next/image"
import { ArrowRight } from "lucide-react"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

export const HomeHero = () => (
  <section
    aria-labelledby="hero-heading"
    className="relative w-full overflow-hidden border-b border-border bg-[#f8f7f2]"
    data-testid="home-hero"
  >
    <Image
      src="/images/home/hero-marketplace.jpg"
      alt=""
      fill
      priority
      sizes="100vw"
      className="hidden object-cover object-center lg:block"
    />
    <div className="relative mx-auto flex max-w-screen-xl items-center px-4 py-10 sm:px-6 sm:py-14 lg:min-h-[34rem]">
      <div className="max-w-xl">
        <span className="inline-flex items-center gap-2 text-eyebrow font-medium uppercase tracking-[0.12em] text-accent">
          <span aria-hidden className="size-1.5 rounded-full bg-cta" />
          Independent sellers · Every department
        </span>
        <h1
          id="hero-heading"
          className="mt-4 font-display text-display-xl font-normal uppercase text-fg lg:text-display-2xl"
        >
          One marketplace. More to discover.
        </h1>
        <p className="mt-4 max-w-lg text-body text-fg-secondary">
          Shop home, tech, fashion, beauty and outdoor finds from verified sellers. See the price and
          who ships, before you buy.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <LocalizedClientLink
            href="/categories"
            className="ui-label inline-flex items-center gap-2 bg-cta px-6 py-3 text-cta-foreground transition-colors hover:bg-cta-hover"
            data-testid="home-hero-shop-link"
          >
            Shop all products
            <ArrowRight className="size-4" aria-hidden />
          </LocalizedClientLink>
          <a
            href={process.env.NEXT_PUBLIC_VENDOR_URL || "http://localhost:7002"}
            className="ui-label inline-flex items-center bg-graphite px-6 py-3 text-on-graphite transition-colors hover:bg-graphite-raised"
            data-testid="home-hero-sell-link"
          >
            Sell on Fleek
          </a>
        </div>
      </div>
    </div>
    <div className="relative aspect-[16/10] w-full sm:aspect-[2/1] lg:hidden">
      <Image
        src="/images/home/hero-marketplace.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-right"
      />
    </div>
  </section>
)
