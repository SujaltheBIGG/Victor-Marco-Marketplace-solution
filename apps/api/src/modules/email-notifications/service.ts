import { Logger, ProviderSendNotificationDTO, ProviderSendNotificationResultsDTO } from "@medusajs/framework/types"
import { AbstractNotificationProviderService } from "@medusajs/framework/utils"

import { renderTemplate } from "./templates"

type Options = { api_key?: string; from_email?: string; from_name?: string }

// Sends transactional email through Brevo's HTTP API (SMTP is blocked on many
// hosts). Without an API key the email is only logged, so local development
// and deploys without a key keep working.
export class EmailNotificationService extends AbstractNotificationProviderService {
  static identifier = "email"
  protected logger_: Logger
  protected options_: Options

  constructor({ logger }: { logger: Logger }, options: Options) {
    super()
    this.logger_ = logger
    this.options_ = options
  }

  async send(notification: ProviderSendNotificationDTO): Promise<ProviderSendNotificationResultsDTO> {
    const { subject, html } = notification.content?.html
      ? { subject: notification.content.subject ?? "A message from Fleek", html: notification.content.html }
      : renderTemplate(notification.template, (notification.data ?? {}) as Record<string, unknown>)

    if (!this.options_.api_key || !this.options_.from_email) {
      this.logger_.info(`Email not sent (no BREVO_API_KEY/EMAIL_FROM): "${subject}" to ${notification.to}`)
      return {}
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": this.options_.api_key, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: { email: this.options_.from_email, name: this.options_.from_name ?? "Fleek" },
        to: [{ email: notification.to }],
        subject,
        htmlContent: html,
      }),
    }).catch((error: Error) => error)

    if (response instanceof Error || !response.ok) {
      const detail = response instanceof Error ? response.message : `${response.status} ${await response.text()}`
      this.logger_.error(`Email "${subject}" to ${notification.to} failed: ${detail}`)
      return {}
    }

    const { messageId } = (await response.json()) as { messageId?: string }
    return { id: messageId }
  }
}
