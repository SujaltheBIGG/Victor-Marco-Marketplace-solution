import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { CreateNotificationDTO } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

import { formatMoney, sellerHubUrl, storefrontUrl } from "../modules/email-notifications/urls"

type OrderRow = {
  id: string
  display_id: number
  email: string | null
  currency_code: string
  items?: { product_title: string | null; title: string; quantity: number; unit_price: number }[] | null
  shipping_methods?: { amount: number }[] | null
  shipping_address?: { first_name?: string | null; address_1?: string | null; postal_code?: string | null; city?: string | null } | null
  seller?: { name: string; email: string | null } | null
}

// Each seller's part of a checkout is its own order: the shopper gets a
// confirmation per order and the seller gets a new-order alert.
export default async function orderPlacedEmailHandler({ event, container }: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notifications = container.resolve(Modules.NOTIFICATION)

  const {
    data: [order],
  } = (await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "currency_code",
      "items.product_title",
      "items.title",
      "items.quantity",
      "items.unit_price",
      "shipping_methods.amount",
      "shipping_address.*",
      "seller.name",
      "seller.email",
    ],
    filters: { id: event.data.id },
  })) as unknown as { data: OrderRow[] }

  if (!order) {
    return
  }

  const money = (amount: number) => formatMoney(amount, order.currency_code)
  const items = (order.items ?? []).map((item) => ({
    title: item.product_title || item.title,
    quantity: item.quantity,
    total: money(Number(item.unit_price) * Number(item.quantity)),
  }))
  const itemsTotal = (order.items ?? []).reduce((sum, i) => sum + Number(i.unit_price) * Number(i.quantity), 0)
  const shipping = (order.shipping_methods ?? []).reduce((sum, m) => sum + Number(m.amount), 0)
  const address = order.shipping_address
  const sellerName = order.seller?.name ?? "the seller"

  const messages: CreateNotificationDTO[] = []
  if (order.email) {
    messages.push({
      to: order.email,
      channel: "email",
      template: "order-placed",
      data: {
        display_id: order.display_id,
        first_name: address?.first_name,
        seller_name: sellerName,
        items,
        shipping: money(shipping),
        total: money(itemsTotal + shipping),
        address: [address?.address_1, [address?.postal_code, address?.city].filter(Boolean).join(" ")].filter(Boolean).join(", "),
        orders_url: storefrontUrl("/user/orders"),
      },
    })
  }
  if (order.seller?.email) {
    messages.push({
      to: order.seller.email,
      channel: "email",
      template: "seller-new-order",
      data: {
        display_id: order.display_id,
        seller_name: sellerName,
        items,
        total: money(itemsTotal),
        order_url: sellerHubUrl(`/orders/${order.id}`),
      },
    })
  }

  if (messages.length) {
    await notifications.createNotifications(messages)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
  context: { subscriberId: "order-placed-email" },
}
