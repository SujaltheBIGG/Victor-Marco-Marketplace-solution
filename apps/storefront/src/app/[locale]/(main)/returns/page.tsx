import type { Metadata } from "next"

import { InfoPage } from "@/components/sections/InfoPage/InfoPage"
import { INFO_PAGES } from "@/data/info-pages"

const page = INFO_PAGES["returns"]

export const metadata: Metadata = { title: page.title, description: page.intro }

export default function Page() {
  return <InfoPage slug="returns" />
}
