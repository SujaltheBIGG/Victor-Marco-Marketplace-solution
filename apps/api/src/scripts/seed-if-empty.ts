import { ExecArgs } from "@medusajs/framework/types"

import { ensureDemoReviews } from "../lib/demo-reviews"
import { applyMarketplaceSettings } from "../lib/marketplace-settings"
import seedDemoData from "./seed"

// Runs on every deploy: seeds an empty database, adds catalog products that
// are not in the store yet, re-applies VAT, pricing and delivery settings and
// gives unreviewed products and sellers a few demo reviews.
export default async function seedIfEmpty(args: ExecArgs) {
  await seedDemoData(args)
  await applyMarketplaceSettings(args.container)
  await ensureDemoReviews(args.container)
}
