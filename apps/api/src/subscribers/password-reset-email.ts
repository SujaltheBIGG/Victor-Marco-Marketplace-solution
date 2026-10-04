import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

import { adminUrl, sellerHubUrl, storefrontUrl } from "../modules/email-notifications/urls"

type PasswordResetEvent = { entity_id: string; token: string; actor_type: string }

// Shoppers reset on the storefront, admins in the admin panel and every other
// actor (sellers and their team members) in the seller hub.
export default async function passwordResetEmailHandler({ event, container }: SubscriberArgs<PasswordResetEvent>) {
  const { entity_id: email, token, actor_type } = event.data
  const query = `?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
  const url =
    actor_type === "customer"
      ? storefrontUrl(`/reset-password${query}`)
      : actor_type === "user"
        ? adminUrl(`/reset-password${query}`)
        : sellerHubUrl(`/reset-password${query}`)

  await container.resolve(Modules.NOTIFICATION).createNotifications({
    to: email,
    channel: "email",
    template: "password-reset",
    data: { url },
  })
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
  context: { subscriberId: "password-reset-email" },
}
