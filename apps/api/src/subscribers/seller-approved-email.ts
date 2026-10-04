import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

import { sellerHubUrl } from "../modules/email-notifications/urls"

export default async function sellerApprovedEmailHandler({ event, container }: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notifications = container.resolve(Modules.NOTIFICATION)

  const {
    data: [seller],
  } = (await query.graph({
    entity: "seller",
    fields: ["id", "name", "email"],
    filters: { id: event.data.id },
  })) as { data: { id: string; name: string; email: string | null }[] }

  if (!seller?.email) {
    return
  }

  await notifications.createNotifications({
    to: seller.email,
    channel: "email",
    template: "seller-approved",
    data: { seller_name: seller.name, dashboard_url: sellerHubUrl("/") },
  })
}

export const config: SubscriberConfig = {
  event: "seller.approved",
  context: { subscriberId: "seller-approved-email" },
}
