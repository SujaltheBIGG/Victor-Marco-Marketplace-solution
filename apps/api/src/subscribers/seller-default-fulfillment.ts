import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  createLocationFulfillmentSetWorkflow,
  createServiceZonesWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows"
import {
  createSellerShippingOptionsWorkflow,
  createSellerStockLocationsWorkflow,
} from "@mercurjs/core/workflows"

type SellerRow = {
  id: string
  name: string
  status: string
  stock_locations?: { id: string }[] | null
  address?: { address_1?: string | null; city?: string | null; country_code?: string | null } | null
}

const shippingOption = (
  name: string,
  code: string,
  description: string,
  amount: number,
  serviceZoneId: string,
  shippingProfileId: string
) => ({
  name,
  price_type: "flat" as const,
  provider_id: "manual_manual",
  service_zone_id: serviceZoneId,
  shipping_profile_id: shippingProfileId,
  type: { label: name.replace(" Shipping", ""), description, code },
  prices: [
    { currency_code: "eur", amount },
    { currency_code: "usd", amount },
  ],
  rules: [
    { attribute: "enabled_in_store", value: "true", operator: "eq" as const },
    { attribute: "is_return", value: "false", operator: "eq" as const },
  ],
})

// A newly approved seller gets a warehouse that ships to every store country
// with Standard and Express options, so their offers can be bought right away.
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

  const [{ data: salesChannels }, { data: regions }, { data: profiles }] = await Promise.all([
    query.graph({ entity: "sales_channel", fields: ["id"], filters: { name: "Default Sales Channel" } }),
    query.graph({ entity: "region", fields: ["countries.iso_2"] }),
    query.graph({ entity: "shipping_profile", fields: ["id", "name"] }),
  ])

  const countries = [
    ...new Set(
      (regions as { countries?: { iso_2: string }[] }[]).flatMap((r) =>
        (r.countries ?? []).map((c) => c.iso_2)
      )
    ),
  ]
  const shippingProfileId = (
    (profiles as { id: string; name: string }[]).find((p) => p.name === "Marketplace Shipping") ??
    (profiles as { id: string }[])[0]
  )?.id

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

  const {
    result: [zone],
  } = await createServiceZonesWorkflow(container).run({
    input: {
      data: [
        {
          fulfillment_set_id: fulfillmentSetId,
          name: `${seller.name} delivery zone`,
          geo_zones: countries.map((country_code) => ({ country_code, type: "country" as const })),
        },
      ],
    },
  })

  await createSellerShippingOptionsWorkflow(container).run({
    input: {
      seller_id: seller.id,
      shipping_options: [
        shippingOption("Standard Shipping", "standard", "Ships in 2-4 business days.", 4.95, zone.id, shippingProfileId),
        shippingOption("Express Shipping", "express", "Ships within 24 hours.", 9.95, zone.id, shippingProfileId),
      ],
    },
  })

  logger.info(`Created default warehouse and shipping options for seller ${seller.name}`)
}

export const config: SubscriberConfig = {
  // Approving from the store edit form updates the status instead of running
  // the approve workflow, so both events are handled.
  event: ["seller.approved", "seller.updated"],
  context: {
    subscriberId: "seller-default-fulfillment-handler",
  },
}
