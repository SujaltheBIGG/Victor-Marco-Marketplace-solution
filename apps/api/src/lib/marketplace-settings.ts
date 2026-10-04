import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  createPricePreferencesWorkflow,
  createServiceZonesWorkflow,
  createTaxRatesWorkflow,
  deleteServiceZonesWorkflow,
  updatePricePreferencesWorkflow,
  updateTaxRatesWorkflow,
} from "@medusajs/medusa/core-flows"
import { createSellerShippingOptionsWorkflow } from "@mercurjs/core/workflows"

// Standard VAT rate per destination. Everything in the catalog is
// standard-rated, and consumer prices are shown including VAT.
export const VAT_RATES: Record<string, { rate: number; name: string }> = {
  de: { rate: 19, name: "MwSt." },
  fr: { rate: 20, name: "TVA" },
  es: { rate: 21, name: "IVA" },
  it: { rate: 22, name: "IVA" },
  dk: { rate: 25, name: "Moms" },
  se: { rate: 25, name: "Moms" },
  gb: { rate: 20, name: "VAT" },
}

type DeliveryRate = { amount: number; description: string }
type ShippingZone = {
  suffix: string
  countries: (all: string[]) => string[]
  standard: DeliveryRate
  express: DeliveryRate
}

// Marketplace-wide delivery rates by destination, VAT included. UK orders
// under £135 have UK VAT charged at checkout, so no import fees on delivery.
export const SHIPPING_ZONES: ShippingZone[] = [
  {
    suffix: "Germany",
    countries: (all) => all.filter((c) => c === "de"),
    standard: { amount: 4.95, description: "Delivery in 2-3 business days." },
    express: { amount: 9.95, description: "Next business day delivery." },
  },
  {
    suffix: "EU",
    countries: (all) => all.filter((c) => c !== "de" && c !== "gb"),
    standard: { amount: 9.95, description: "Delivery in 4-7 business days." },
    express: { amount: 19.95, description: "Delivery in 2-3 business days." },
  },
  {
    suffix: "UK",
    countries: (all) => all.filter((c) => c === "gb"),
    standard: { amount: 14.95, description: "Delivery in 5-8 business days, no import fees." },
    express: { amount: 29.95, description: "Delivery in 2-4 business days, no import fees." },
  },
]

const shippingOption = (
  name: string,
  code: string,
  rate: DeliveryRate,
  serviceZoneId: string,
  shippingProfileId: string
) => ({
  name,
  price_type: "flat" as const,
  provider_id: "manual_manual",
  service_zone_id: serviceZoneId,
  shipping_profile_id: shippingProfileId,
  type: { label: name.replace(" Shipping", ""), description: rate.description, code },
  prices: [
    { currency_code: "eur", amount: rate.amount },
    { currency_code: "usd", amount: rate.amount },
  ],
  rules: [
    { attribute: "enabled_in_store", value: "true", operator: "eq" as const },
    { attribute: "is_return", value: "false", operator: "eq" as const },
  ],
})

export async function createSellerShippingZones(
  container: MedusaContainer,
  input: {
    sellerId: string
    sellerName: string
    fulfillmentSetId: string
    shippingProfileId: string
    countries: string[]
  }
) {
  const zones = SHIPPING_ZONES.map((zone) => ({
    zone,
    name: `${input.sellerName} ${zone.suffix}`,
    countries: zone.countries(input.countries),
  })).filter((z) => z.countries.length)

  const { result: created } = await createServiceZonesWorkflow(container).run({
    input: {
      data: zones.map((z) => ({
        fulfillment_set_id: input.fulfillmentSetId,
        name: z.name,
        geo_zones: z.countries.map((country_code) => ({ country_code, type: "country" as const })),
      })),
    },
  })

  await createSellerShippingOptionsWorkflow(container).run({
    input: {
      seller_id: input.sellerId,
      shipping_options: zones.flatMap((z) => {
        const zoneId = created.find((c) => c.name === z.name)!.id
        return [
          shippingOption("Standard Shipping", "standard", z.zone.standard, zoneId, input.shippingProfileId),
          shippingOption("Express Shipping", "express", z.zone.express, zoneId, input.shippingProfileId),
        ]
      }),
    },
  })
}

export async function regionCountries(container: MedusaContainer) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: regions } = await query.graph({ entity: "region", fields: ["countries.iso_2"] })
  return [
    ...new Set(
      (regions as { countries?: { iso_2: string }[] }[]).flatMap((r) =>
        (r.countries ?? []).map((c) => c.iso_2)
      )
    ),
  ]
}

export async function marketplaceShippingProfileId(container: MedusaContainer) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: profiles } = (await query.graph({
    entity: "shipping_profile",
    fields: ["id", "name"],
  })) as { data: { id: string; name: string }[] }
  return (profiles.find((p) => p.name === "Marketplace Shipping") ?? profiles[0])?.id
}

type SellerShippingRow = {
  id: string
  name: string
  stock_locations?: {
    fulfillment_sets?: { id: string; service_zones?: { id: string; name: string }[] }[]
  }[]
}

// Sellers created before the destination zones existed ship everywhere at one
// flat rate; replace that zone with the Germany / EU / UK zones.
async function ensureSellerShippingZones(container: MedusaContainer) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const { data: sellers } = (await query.graph({
    entity: "seller",
    fields: [
      "id",
      "name",
      "stock_locations.fulfillment_sets.id",
      "stock_locations.fulfillment_sets.service_zones.id",
      "stock_locations.fulfillment_sets.service_zones.name",
    ],
  })) as { data: SellerShippingRow[] }

  const countries = await regionCountries(container)
  const shippingProfileId = await marketplaceShippingProfileId(container)
  if (!countries.length || !shippingProfileId) {
    return
  }

  for (const seller of sellers) {
    const fulfillmentSet = seller.stock_locations?.[0]?.fulfillment_sets?.[0]
    if (!fulfillmentSet) {
      continue
    }
    const zones = fulfillmentSet.service_zones ?? []
    if (zones.some((z) => z.name.endsWith(" Germany"))) {
      continue
    }
    if (zones.length) {
      await deleteServiceZonesWorkflow(container).run({ input: { ids: zones.map((z) => z.id) } })
    }
    await createSellerShippingZones(container, {
      sellerId: seller.id,
      sellerName: seller.name,
      fulfillmentSetId: fulfillmentSet.id,
      shippingProfileId,
      countries,
    })
    logger.info(`Set up Germany, EU and UK delivery rates for ${seller.name}`)
  }
}

async function ensureVatRates(container: MedusaContainer) {
  const taxModule = container.resolve(Modules.TAX)
  const regions = await taxModule.listTaxRegions({ country_code: Object.keys(VAT_RATES) })
  const rates = regions.length
    ? await taxModule.listTaxRates({ tax_region_id: regions.map((r) => r.id) })
    : []

  for (const region of regions) {
    if (region.province_code || region.parent_id) {
      continue
    }
    const vat = VAT_RATES[region.country_code]
    const data = { rate: vat.rate, name: vat.name, code: `${region.country_code.toUpperCase()}-VAT` }
    const current = rates.find((r) => r.tax_region_id === region.id && r.is_default)
    if (!current) {
      await createTaxRatesWorkflow(container).run({
        input: [{ tax_region_id: region.id, is_default: true, ...data }],
      })
    } else if (Number(current.rate) !== vat.rate) {
      await updateTaxRatesWorkflow(container).run({
        input: { selector: { id: current.id }, update: data },
      })
    }
  }
}

// Prices are entered and shown gross (incl. VAT), as EU consumer law requires.
async function ensureTaxInclusivePricing(container: MedusaContainer) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const pricingModule = container.resolve(Modules.PRICING)

  const { data: regions } = (await query.graph({
    entity: "region",
    fields: ["id", "currency_code"],
  })) as { data: { id: string; currency_code: string }[] }

  const wanted = [
    { attribute: "currency_code", value: "eur" },
    ...regions
      .filter((r) => r.currency_code === "eur")
      .map((r) => ({ attribute: "region_id", value: r.id })),
  ]
  const existing = await pricingModule.listPricePreferences({
    attribute: ["currency_code", "region_id"],
  })
  type Preference = { attribute?: string | null; value?: string | null }
  const same = (a: Preference, b: Preference) => a.attribute === b.attribute && a.value === b.value

  const missing = wanted.filter((w) => !existing.some((e) => same(e, w)))
  const exclusive = existing.filter((e) => !e.is_tax_inclusive && wanted.some((w) => same(e, w)))

  if (missing.length) {
    await createPricePreferencesWorkflow(container).run({
      input: missing.map((w) => ({ ...w, is_tax_inclusive: true })),
    })
  }
  if (exclusive.length) {
    await updatePricePreferencesWorkflow(container).run({
      input: { selector: { id: exclusive.map((e) => e.id) }, update: { is_tax_inclusive: true } },
    })
  }
}

export async function applyMarketplaceSettings(container: MedusaContainer) {
  await ensureVatRates(container)
  await ensureTaxInclusivePricing(container)
  await ensureSellerShippingZones(container)
}
