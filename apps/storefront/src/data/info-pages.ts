type InfoSection = {
  heading: string
  paragraphs?: string[]
  list?: string[]
  table?: { head: string[]; rows: string[][] }
}

type InfoPageContent = {
  nav: string
  title: string
  intro: string
  sample?: boolean
  sections: InfoSection[]
}

export const INFO_NAV = [
  "about",
  "faq",
  "shipping",
  "returns",
  "payment",
  "seller-terms",
  "terms",
  "privacy",
  "cookies",
  "imprint",
] as const

export type InfoPageSlug = (typeof INFO_NAV)[number]

export const INFO_PAGES: Record<InfoPageSlug, InfoPageContent> = {
  about: {
    nav: "About Fleek",
    title: "About Fleek",
    intro:
      "Fleek is a marketplace for independent sellers. You get one catalog, one cart and one checkout for tech, home, fashion, beauty and outdoor gear, while every product is sold and shipped by the seller who knows it best.",
    sections: [
      {
        heading: "How Fleek works",
        paragraphs: [
          "Every product page lists the offers from different sellers, so you can compare price, condition and delivery before you buy. Add items from several sellers to one cart and pay once.",
          "Each seller packs and ships their part of your order. You can follow every order from your account.",
        ],
      },
      {
        heading: "Sellers you can trust",
        list: [
          "Every seller is checked by our team before their shop goes live.",
          "Ratings and reviews come from customers who bought on Fleek.",
          "Buyer protection and 30-day returns apply to every order.",
        ],
      },
      {
        heading: "Fair for sellers",
        paragraphs: [
          "Sellers pay one transparent commission on each sale. There are no listing or monthly fees, and payouts are sent after delivery.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: ["Questions about an order or selling on Fleek? Email hello@fleek.example, Monday to Friday, 9:00 to 18:00 CET."],
      },
    ],
  },
  faq: {
    nav: "FAQs",
    title: "Frequently asked questions",
    intro: "Quick answers about ordering, delivery, returns and selling on Fleek.",
    sections: [
      {
        heading: "How do orders from several sellers work?",
        paragraphs: [
          "You check out once and pay once. Behind the scenes your order is split per seller, and each seller ships their items separately with their own tracking.",
        ],
      },
      {
        heading: "Are prices shown with VAT?",
        paragraphs: [
          "Yes. All prices include VAT at the rate of your delivery country. Delivery costs are added at checkout and shown before you pay.",
        ],
      },
      {
        heading: "How much does delivery cost?",
        paragraphs: [
          "Standard delivery is €4.95 within Germany, €9.95 to other EU countries and €14.95 to the UK. Express delivery is also available. See the Delivery page for all rates and times.",
        ],
      },
      {
        heading: "Can I return an item?",
        paragraphs: [
          "Yes, you can return most items within 30 days of delivery. Start a return from your orders, or see the Returns page for details.",
        ],
      },
      {
        heading: "Do I need an account to order?",
        paragraphs: [
          "No. You can check out as a guest. With an account you can track orders, start returns, message sellers and save addresses.",
        ],
      },
      {
        heading: "How do I contact a seller?",
        paragraphs: ["Sign in and use the message button on the product page or in your order to reach the seller directly."],
      },
      {
        heading: "How do I start selling?",
        paragraphs: [
          "Click Sell on Fleek, create your shop and complete the onboarding. Once our team approves your shop you can list offers straight away.",
        ],
      },
    ],
  },
  shipping: {
    nav: "Delivery",
    title: "Delivery",
    intro:
      "Every seller ships their own items, so delivery is charged per seller in your order. Rates depend on your delivery country and always include VAT.",
    sections: [
      {
        heading: "Rates and delivery times",
        table: {
          head: ["Destination", "Standard", "Express"],
          rows: [
            ["Germany", "€4.95 · 2-3 business days", "€9.95 · next business day"],
            ["France, Spain, Italy, Denmark, Sweden", "€9.95 · 4-7 business days", "€19.95 · 2-3 business days"],
            ["United Kingdom", "€14.95 · 5-8 business days", "€29.95 · 2-4 business days"],
          ],
        },
      },
      {
        heading: "Dispatch and tracking",
        paragraphs: [
          "Sellers dispatch within 2 business days. As soon as your parcel is on its way you receive the tracking details by email, and you can follow it in your account.",
        ],
      },
      {
        heading: "Deliveries to the United Kingdom",
        paragraphs: [
          "UK VAT is charged at checkout for orders up to £135, so there are no import fees to pay on delivery.",
        ],
      },
    ],
  },
  returns: {
    nav: "Returns & refunds",
    title: "Returns & refunds",
    intro:
      "Changed your mind? You can return most items within 30 days of delivery, which is longer than the 14-day right of withdrawal required by EU law.",
    sections: [
      {
        heading: "How to return an item",
        list: [
          "Go to your orders, choose the order and select Request return.",
          "Pick the items and a reason. The seller confirms the return and sends the return instructions.",
          "Pack the items securely and drop off the parcel within 14 days.",
        ],
      },
      {
        heading: "Refunds",
        paragraphs: [
          "We refund the item price and the original standard delivery cost within 14 days after the seller receives your return, using your original payment method.",
          "Returns of faulty or wrong items are always free. For other returns the seller may charge the return shipping cost, which is shown before you confirm.",
        ],
      },
      {
        heading: "Items that can't be returned",
        list: [
          "Sealed hygiene and beauty products once they have been opened.",
          "Personalised or made-to-order items.",
        ],
      },
      {
        heading: "Right of withdrawal",
        paragraphs: [
          "Consumers in the EU can withdraw from a purchase within 14 days of delivery without giving a reason. To withdraw, send a clear statement to the seller, for example by message or by email to returns@fleek.example.",
          "Model withdrawal form: To [seller name and address]: I hereby give notice that I withdraw from my contract for the sale of the following goods: [items], ordered on [date] / received on [date]. Name, address, date and, if on paper, signature.",
        ],
      },
    ],
  },
  payment: {
    nav: "Payment",
    title: "Payment",
    intro: "You pay once for your whole order, even when it comes from several sellers.",
    sections: [
      {
        heading: "Payment methods",
        paragraphs: [
          "Card payments (Visa, Mastercard and American Express) and PayPal will be available at launch. Payments are processed by a certified payment provider and Fleek never stores your card details.",
          "This is a demo store: checkout uses a test payment method, so no money is charged.",
        ],
      },
      {
        heading: "Invoices",
        paragraphs: [
          "Each seller issues the invoice for their part of your order, showing the VAT for your delivery country. You can find it in your orders.",
        ],
      },
    ],
  },
  "seller-terms": {
    nav: "Seller terms",
    title: "Seller terms",
    sample: true,
    intro: "These terms apply to businesses that sell on Fleek.",
    sections: [
      {
        heading: "Who can sell",
        paragraphs: [
          "Registered businesses in the EU and the UK can apply. Our team reviews every application before the shop goes live.",
        ],
      },
      {
        heading: "Fees and payouts",
        list: [
          "10% commission on the item price, VAT included. No listing or monthly fees.",
          "Payouts are sent to your connected bank account after the order has been delivered.",
          "Each order shows the commission and the payout amount in the seller hub.",
        ],
      },
      {
        heading: "Listings",
        paragraphs: [
          "Listings must be accurate and meet EU product-safety rules (GPSR), including the responsible economic operator and safety information. Counterfeit, unsafe and prohibited items are not allowed.",
        ],
      },
      {
        heading: "Orders and customer service",
        list: [
          "Ship within 2 business days and add tracking.",
          "Accept returns within 30 days of delivery.",
          "Reply to customer messages within 24 hours on business days.",
        ],
      },
      {
        heading: "Suspension",
        paragraphs: [
          "We may pause or close a shop that repeatedly breaks these terms, after telling the seller why and giving them a chance to respond.",
        ],
      },
    ],
  },
  terms: {
    nav: "Terms & conditions",
    title: "Terms & conditions",
    sample: true,
    intro:
      "Fleek runs an online marketplace where independent sellers offer their products. These terms explain how buying on Fleek works.",
    sections: [
      {
        heading: "Who you buy from",
        paragraphs: [
          "Your purchase contract is concluded with the seller named on the offer, not with Fleek. Fleek provides the marketplace, the checkout and customer support.",
        ],
      },
      {
        heading: "Placing an order",
        paragraphs: [
          "Product pages and the cart are not binding offers. By clicking Place order you make a binding offer to buy; the contract is concluded when the seller confirms your order by email.",
        ],
      },
      {
        heading: "Prices and delivery",
        paragraphs: [
          "All prices include VAT. Delivery costs are shown at checkout before you place your order. Delivery times are listed on the Delivery page.",
        ],
      },
      {
        heading: "Withdrawal, returns and warranty",
        paragraphs: [
          "You can withdraw from your purchase within 14 days and return most items within 30 days, as described on the Returns page. The statutory two-year warranty for defects applies against the seller.",
        ],
      },
      {
        heading: "Reviews",
        paragraphs: [
          "Reviews must be honest and about the product or seller. We may remove reviews that contain abuse, personal data or advertising.",
        ],
      },
      {
        heading: "Applicable law and disputes",
        paragraphs: [
          "German law applies, without limiting the consumer protection of the country where you live. We are not obliged and not willing to take part in dispute resolution proceedings before a consumer arbitration board.",
        ],
      },
    ],
  },
  privacy: {
    nav: "Privacy policy",
    title: "Privacy policy",
    sample: true,
    intro:
      "This policy explains which personal data Fleek processes when you shop or sell on Fleek, why we do it and what rights you have under the GDPR.",
    sections: [
      {
        heading: "Controller",
        paragraphs: ["Fleek Marketplace, Musterstraße 12, 10115 Berlin, Germany. Email: privacy@fleek.example."],
      },
      {
        heading: "What we process",
        list: [
          "Account details: name, email address, password (stored encrypted) and saved addresses.",
          "Order details: items, delivery address, payment status and messages with sellers.",
          "Technical data: IP address, browser and device information needed to run the site securely.",
        ],
      },
      {
        heading: "Why we process it",
        list: [
          "To run your account and process your orders (Art. 6(1)(b) GDPR).",
          "To meet legal duties such as tax record keeping (Art. 6(1)(c) GDPR).",
          "To keep the marketplace secure and prevent fraud (Art. 6(1)(f) GDPR).",
          "Optional preferences only with your consent (Art. 6(1)(a) GDPR).",
        ],
      },
      {
        heading: "Who receives your data",
        paragraphs: [
          "The seller you buy from receives the details needed to ship and invoice your order. We also use service providers for hosting, email delivery and payments, who process data only on our instructions.",
        ],
      },
      {
        heading: "How long we keep it",
        paragraphs: [
          "Account data is kept until you delete your account. Order and invoice records are kept for up to 10 years because German tax law requires it.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          "You can ask for access, correction, deletion, restriction or a copy of your data, object to processing and withdraw consent at any time. You can also complain to a data protection authority.",
        ],
      },
    ],
  },
  cookies: {
    nav: "Cookie policy",
    title: "Cookie policy",
    sample: true,
    intro:
      "Fleek uses a small number of cookies and browser storage entries. We don't use advertising or tracking cookies.",
    sections: [
      {
        heading: "Cookies and storage we use",
        table: {
          head: ["Name", "Purpose", "Duration"],
          rows: [
            ["_medusa_jwt", "Keeps you signed in", "Session, up to 7 days"],
            ["_medusa_cart_id", "Remembers your shopping cart", "Up to 7 days"],
            ["fleek-cookie-consent", "Stores your cookie choice", "Until you clear site data"],
            ["fleek-wishlist", "Saves your wishlist in this browser", "Until you clear site data"],
          ],
        },
      },
      {
        heading: "Changing your choice",
        paragraphs: [
          "Necessary cookies are always on because the shop can't work without them. To change your choice, clear this site's data in your browser and the cookie banner will appear again.",
        ],
      },
    ],
  },
  imprint: {
    nav: "Imprint",
    title: "Imprint",
    sample: true,
    intro: "Information according to § 5 DDG (German Digital Services Act). The details below are placeholders for this demo.",
    sections: [
      {
        heading: "Operator",
        paragraphs: [
          "Fleek Marketplace (demo company), Musterstraße 12, 10115 Berlin, Germany.",
          "Represented by: Max Mustermann.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: ["Email: hello@fleek.example · Phone: +49 30 000000"],
      },
      {
        heading: "Register and VAT",
        paragraphs: ["Commercial register: Amtsgericht Berlin-Charlottenburg, HRB 000000 (placeholder). VAT ID: DE000000000 (placeholder)."],
      },
      {
        heading: "Responsible for content",
        paragraphs: ["Max Mustermann, address as above (§ 18 (2) MStV)."],
      },
    ],
  },
}
