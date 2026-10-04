import { BadgeCheck, Lock, ShieldCheck, Truck } from "lucide-react"

const USPS = [
  {
    Icon: Truck,
    title: "Tracked delivery",
    text: "Every seller ships with tracking, so you always know where your order is.",
  },
  {
    Icon: ShieldCheck,
    title: "Buyer protection",
    text: "Covered from cart to delivery on every order you place.",
  },
  {
    Icon: BadgeCheck,
    title: "Verified sellers",
    text: "Every seller is reviewed and approved before they can list.",
  },
  {
    Icon: Lock,
    title: "Secure checkout",
    text: "One cart and one payment, even when you buy from several sellers.",
  },
]

export const HomeUspStrip = () => (
  <section
    aria-labelledby="usp-heading"
    className="mt-4 w-full border-y border-border bg-surface-subtle"
    data-testid="home-usp-strip"
  >
    <h2 id="usp-heading" className="sr-only">
      Why shop on Fleek
    </h2>
    <ul className="mx-auto grid max-w-screen-xl grid-cols-2 gap-x-6 gap-y-8 px-4 py-10 sm:px-6 lg:grid-cols-4">
      {USPS.map(({ Icon, title, text }) => (
        <li key={title} className="flex items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center border border-border bg-surface text-fg">
            <Icon className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="ui-label text-ui text-fg">{title}</p>
            <p className="mt-1 text-small text-muted">{text}</p>
          </div>
        </li>
      ))}
    </ul>
  </section>
)
