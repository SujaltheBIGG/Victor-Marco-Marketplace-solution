import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { INFO_NAV, INFO_PAGES, InfoPageSlug } from "@/data/info-pages"
import { cn } from "@/lib/utils"

export const InfoPage = ({ slug }: { slug: InfoPageSlug }) => {
  const page = INFO_PAGES[slug]

  return (
    <div
      className="mx-auto grid w-full max-w-screen-xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[14rem_1fr] lg:py-14"
      data-testid={`info-page-${slug}`}
    >
      <nav aria-label="Help and policies" className="order-2 lg:order-1">
        <p className="ui-label text-eyebrow text-muted">Help &amp; policies</p>
        <ul className="mt-3 flex flex-col gap-1 border-l border-border">
          {INFO_NAV.map((item) => (
            <li key={item}>
              <LocalizedClientLink
                href={`/${item}`}
                aria-current={item === slug ? "page" : undefined}
                className={cn(
                  "-ml-px block border-l-2 px-3 py-1.5 text-small",
                  item === slug
                    ? "border-cta font-medium text-fg"
                    : "border-transparent text-fg-secondary hover:text-fg"
                )}
              >
                {INFO_PAGES[item].nav}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </nav>

      <article className="order-1 max-w-3xl lg:order-2">
        <h1 className="font-display text-h1 font-normal text-heading">{page.title}</h1>
        {page.sample && (
          <p className="mt-4 border border-border bg-surface-subtle px-4 py-3 text-small text-fg-secondary">
            Sample text for the Fleek demo marketplace. It is not legal advice.
          </p>
        )}
        <p className="mt-6 text-body text-fg-secondary">{page.intro}</p>

        {page.sections.map((section) => (
          <section key={section.heading} className="mt-9">
            <h2 className="font-display text-h3 font-normal text-heading">{section.heading}</h2>
            {section.paragraphs?.map((text) => (
              <p key={text} className="mt-3 text-body text-fg-secondary">
                {text}
              </p>
            ))}
            {section.list && (
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-body text-fg-secondary">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {section.table && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border border-border text-left text-small">
                  <thead className="bg-surface-subtle">
                    <tr>
                      {section.table.head.map((cell) => (
                        <th key={cell} scope="col" className="px-3 py-2 font-medium text-fg">
                          {cell}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {section.table.rows.map((row) => (
                      <tr key={row.join("|")}>
                        {row.map((cell, i) => (
                          <td key={i} className="px-3 py-2 text-fg-secondary">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}
      </article>
    </div>
  )
}
