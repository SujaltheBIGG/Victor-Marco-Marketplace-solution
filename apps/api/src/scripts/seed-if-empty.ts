import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import seedDemoData from "./seed"

// Seeds only an empty database, so it can run on every deploy.
export default async function seedIfEmpty(args: ExecArgs) {
  const query = args.container.resolve(ContainerRegistrationKeys.QUERY)
  const logger = args.container.resolve(ContainerRegistrationKeys.LOGGER)

  const { data } = await query.graph({
    entity: "product",
    fields: ["id"],
    pagination: { take: 1 },
  })

  if (data.length) {
    logger.info("Catalog already present, skipping seed.")
    return
  }

  await seedDemoData(args)
}
