import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  createLocationFulfillmentSetWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows"
import { createSellerStockLocationsWorkflow } from "@mercurjs/core/workflows"

import {
  createSellerShippingZones,
  marketplaceShippingProfileId,
  regionCountries,
} from "../lib/marketplace-settings"

type SellerRow = {
  id: string
  name: string
  status: string
  stock_locations?: { id: string }[] | null
  address?: { address_1?: string | null; city?: string | null; country_code?: string | null } | null
}

// A newly approved seller gets a warehouse with Standard and Express delivery
// to Germany, the EU and the UK, so their offers can be bought right away.
// Sellers that already have a location are left untouched.
export default async function sellerDefaultFulfillmentHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const {
    data: [seller],
  } = (await query.graph({
    entity: "seller",
    fields: ["id", "name", "status", "stock_locations.id", "address.*"],
    filters: { id: event.data.id },
  })) as { data: SellerRow[] }

  if (!seller || seller.status !== "open" || seller.stock_locations?.length) {
    return
  }

  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id"],
    filters: { name: "Default Sales Channel" },
  })
  const countries = await regionCountries(container)
  const shippingProfileId = await marketplaceShippingProfileId(container)

  if (!countries.length || !shippingProfileId) {
    logger.warn(`Skipping default fulfillment for seller ${seller.id}: no regions or shipping profile`)
    return
  }

  const {
    result: [location],
  } = await createSellerStockLocationsWorkflow(container).run({
    input: {
      seller_id: seller.id,
      locations: [
        {
          name: `${seller.name} Warehouse`,
          address: {
            address_1: seller.address?.address_1 ?? "",
            city: seller.address?.city ?? undefined,
            country_code: seller.address?.country_code ?? countries[0],
          },
        },
      ],
    },
  })

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
    [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
  })

  const salesChannelId = (salesChannels as { id: string }[])[0]?.id
  if (salesChannelId) {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: { id: location.id, add: [salesChannelId] },
    })
  }

  await createLocationFulfillmentSetWorkflow(container).run({
    input: {
      location_id: location.id,
      fulfillment_set_data: { name: `${seller.name} delivery`, type: "shipping" },
    },
  })

  const {
    data: [locationWithSet],
  } = (await query.graph({
    entity: "stock_location",
    fields: ["fulfillment_sets.id"],
    filters: { id: location.id },
  })) as { data: { fulfillment_sets?: { id: string }[] }[] }

  const fulfillmentSetId = locationWithSet?.fulfillment_sets?.[0]?.id
  if (!fulfillmentSetId) {
    return
  }

  await createSellerShippingZones(container, {
    sellerId: seller.id,
    sellerName: seller.name,
    fulfillmentSetId,
    shippingProfileId,
    countries,
  })

  logger.info(`Created default warehouse and delivery rates for seller ${seller.name}`)
}

export const config: SubscriberConfig = {
  // Approving from the store edit form updates the status instead of running
  // the approve workflow, so both events are handled.
  event: ["seller.approved", "seller.updated"],
  context: {
    subscriberId: "seller-default-fulfillment-handler",
  },
}
