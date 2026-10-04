type Data = Record<string, unknown>

const escape = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)

const layout = (heading: string, body: string, cta?: { label: string; url: string }) => `<!doctype html>
<html><body style="margin:0;background:#f8f7f2;font-family:Helvetica,Arial,sans-serif;color:#1d1d1f">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f2;padding:32px 16px"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e6e3da">
<tr><td style="padding:24px 32px;border-bottom:1px solid #e6e3da;font-size:22px;font-weight:700;letter-spacing:2px">FLEEK</td></tr>
<tr><td style="padding:32px">
<h1 style="margin:0 0 16px;font-size:22px;font-weight:600">${escape(heading)}</h1>
${body}
${cta ? `<p style="margin:28px 0 0"><a href="${escape(cta.url)}" style="display:inline-block;background:#f2a33a;color:#1d1d1f;padding:12px 22px;text-decoration:none;font-weight:600;letter-spacing:1px;font-size:13px;text-transform:uppercase">${escape(cta.label)}</a></p>` : ""}
</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #e6e3da;font-size:12px;color:#77756f">Fleek · Independent sellers, one checkout.</td></tr>
</table></td></tr></table></body></html>`

const p = (text: string) => `<p style="margin:0 0 12px;font-size:15px;line-height:1.55">${text}</p>`

type Item = { title: string; quantity: number; total: string }
const itemsTable = (items: Item[], total: string, shipping?: string) => `
<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border-top:1px solid #e6e3da;font-size:14px">
${items.map((i) => `<tr><td style="padding:10px 0;border-bottom:1px solid #e6e3da">${escape(i.title)} × ${i.quantity}</td><td align="right" style="padding:10px 0;border-bottom:1px solid #e6e3da">${escape(i.total)}</td></tr>`).join("")}
${shipping ? `<tr><td style="padding:10px 0;color:#77756f">Shipping</td><td align="right" style="padding:10px 0;color:#77756f">${escape(shipping)}</td></tr>` : ""}
<tr><td style="padding:10px 0;font-weight:600">Total (incl. VAT)</td><td align="right" style="padding:10px 0;font-weight:600">${escape(total)}</td></tr>
</table>`

export const renderTemplate = (template: string, data: Data): { subject: string; html: string } => {
  switch (template) {
    case "order-placed":
      return {
        subject: `Your Fleek order #${data.display_id} is confirmed`,
        html: layout(
          `Thanks for your order, ${escape(data.first_name || "there")}!`,
          p(`We've sent order <strong>#${escape(data.display_id)}</strong> to <strong>${escape(data.seller_name)}</strong>, who will pack and ship it. You'll get tracking details once it's on its way.`) +
            itemsTable(data.items as Item[], String(data.total), String(data.shipping)) +
            (data.address ? p(`<span style="color:#77756f">Delivering to</span><br>${escape(data.address)}`) : ""),
          { label: "View your orders", url: String(data.orders_url) }
        ),
      }
    case "seller-new-order":
      return {
        subject: `New order #${data.display_id} on Fleek`,
        html: layout(
          `You have a new order`,
          p(`Order <strong>#${escape(data.display_id)}</strong> was just placed with <strong>${escape(data.seller_name)}</strong>. Please confirm and ship it within 2 business days.`) +
            itemsTable(data.items as Item[], String(data.total)),
          { label: "Open the order", url: String(data.order_url) }
        ),
      }
    case "seller-approved":
      return {
        subject: `${data.seller_name} is approved on Fleek`,
        html: layout(
          `Your shop is live`,
          p(`Good news: <strong>${escape(data.seller_name)}</strong> has been approved. Your warehouse and delivery rates for Germany, the EU and the UK are already set up.`) +
            p("Add your first offers in the seller hub and they will appear on Fleek straight away."),
          { label: "Go to the seller hub", url: String(data.dashboard_url) }
        ),
      }
    case "password-reset":
      return {
        subject: "Reset your Fleek password",
        html: layout(
          "Reset your password",
          p("We received a request to reset the password for your Fleek account. The link below is valid for 15 minutes.") +
            p(`<span style="color:#77756f">If you didn't ask for this, you can safely ignore this email.</span>`),
          { label: "Choose a new password", url: String(data.url) }
        ),
      }
    default:
      return { subject: "A message from Fleek", html: layout("Hello from Fleek", p(escape(JSON.stringify(data)))) }
  }
}
