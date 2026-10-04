import Image from "next/image"
import { ArrowRight, Store } from "lucide-react"

export const HomePromoBanner = () => (
  <section className="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6" data-testid="home-promo-banner">
    <div className="relative overflow-hidden bg-graphite px-8 py-12 text-on-graphite sm:px-12 sm:py-14">
      <Image
        src="/images/home/promo-bg.jpeg"
        alt=""
        fill
        sizes="(min-width: 1280px) 1232px, 100vw"
        className="object-cover object-right"
      />
      <div aria-hidden className="promo-scrim absolute inset-0" />
      <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <span className="ui-label inline-flex items-center gap-2 text-white">
            <Store className="size-3.5" aria-hidden />
            Sell on Fleek
          </span>
          <h2 className="mt-3 font-display text-h2 font-normal text-on-graphite">
            Open your shop and reach buyers in every department.
          </h2>
          <p className="mt-3 text-on-graphite-muted">
            List your products, manage orders and get paid out, all from one seller dashboard.
          </p>
        </div>
        <a
          href={process.env.NEXT_PUBLIC_VENDOR_URL || "http://localhost:7002"}
          className="ui-label inline-flex shrink-0 items-center gap-2 bg-on-graphite px-6 py-3 text-graphite transition-colors hover:bg-white/85"
          data-testid="home-promo-banner-link"
        >
          Start selling
          <ArrowRight className="size-4" aria-hidden />
        </a>
      </div>
    </div>
  </section>
)
