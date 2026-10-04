import { ChevronRight } from "lucide-react"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { cn } from "@/lib/utils"

export type Crumb = { label: string; href?: string }

export const PageBreadcrumbs = ({
  items,
  currentClassName = "text-small font-medium text-fg",
}: {
  items: Crumb[]
  currentClassName?: string
}) => (
  <nav aria-label="Breadcrumb" data-testid="breadcrumbs">
    <ol className="flex flex-wrap items-center gap-2">
      {items.map((item, i) => {
        const isCurrent = i === items.length - 1
        return (
          <li key={`${item.label}-${i}`} className="flex items-center gap-2">
            {item.href && !isCurrent ? (
              <LocalizedClientLink
                href={item.href}
                className="ui-label text-eyebrow text-muted transition-colors hover:text-fg"
              >
                {item.label}
              </LocalizedClientLink>
            ) : (
              <span
                aria-current={isCurrent ? "page" : undefined}
                className={cn(isCurrent ? currentClassName : "ui-label text-eyebrow text-muted")}
              >
                {item.label}
              </span>
            )}
            {!isCurrent && <ChevronRight className="size-3.5 text-muted" aria-hidden />}
          </li>
        )
      })}
    </ol>
  </nav>
)
