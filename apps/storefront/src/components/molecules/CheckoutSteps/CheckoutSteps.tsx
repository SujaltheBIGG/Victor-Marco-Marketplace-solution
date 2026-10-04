"use client"

import { Check } from "lucide-react"
import { useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"

const STEPS = [
  { id: "address", label: "Address" },
  { id: "delivery", label: "Delivery" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
] as const

export type CheckoutStepId = (typeof STEPS)[number]["id"]

export const CheckoutSteps = ({ completed }: { completed: Partial<Record<CheckoutStepId, boolean>> }) => {
  const searchParams = useSearchParams()
  const currentIndex = Math.max(
    STEPS.findIndex((step) => step.id === searchParams.get("step")),
    0
  )

  return (
    <nav aria-label="Checkout progress" className="mt-6" data-testid="checkout-steps">
      <div className="h-1 bg-border" aria-hidden>
        <div
          className="h-full bg-graphite transition-[width] duration-300"
          style={{ width: `${((currentIndex + 1) / STEPS.length) * 100}%` }}
        />
      </div>
      <ol className="mt-5 grid grid-cols-4">
        {STEPS.map((step, i) => {
          const isCurrent = i === currentIndex
          const isDone = !isCurrent && !!completed[step.id]
          return (
            <li key={step.id} className="flex flex-col items-center gap-2 text-center" aria-current={isCurrent ? "step" : undefined}>
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border text-small tabular-nums",
                  isCurrent && "border-fg bg-graphite text-on-graphite",
                  isDone && "border-success bg-success text-on-graphite",
                  !isCurrent && !isDone && "border-border-strong text-muted"
                )}
              >
                {isDone ? <Check className="size-4" aria-hidden /> : i + 1}
              </span>
              <span className={cn("ui-label text-eyebrow", isCurrent ? "text-fg" : "text-muted")}>
                {step.label}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
