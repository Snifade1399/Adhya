import { Link } from "react-router-dom";


const SUPPORT_EMAIL = "debabrata13990872@gmail.com";
const SUPPORT_PHONE = "+91 9399956492";


const policies = {
  contact: {
    eyebrow: "SUPPORT",
    title: "Contact us",
    intro: "We're here to help with orders, delivery, returns, and product questions.",
    sections: [
      {
        heading: "Customer support",
        content: (
          <>
            <p>
              Email us at <a className="underline hover:text-[var(--accent)]" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> or call <a className="underline hover:text-[var(--accent)]" href="tel:+919399956492">{SUPPORT_PHONE}</a>.
            </p>
            <p className="mt-4">Please include your order ID when contacting us about an existing order.</p>
          </>
        ),
      },
    ],
  },
  shipping: {
    eyebrow: "POLICY",
    title: "Shipping policy",
    intro: "ĀDHYA currently ships within India only.",
    sections: [
      {
        heading: "Delivery",
        content: <p>Orders are delivered to the shipping address entered at checkout. Delivery timing may vary by destination, courier availability, weather, and other factors outside our control.</p>,
      },
      {
        heading: "Order updates",
        content: <p>For help with an order or delivery, contact us with your order ID.</p>,
      },
    ],
  },
  returns: {
    eyebrow: "POLICY",
    title: "Cancellation and returns",
    intro: "We accept return requests within 7 days of delivery.",
    sections: [
      {
        heading: "Eligibility",
        content: <p>Items must be unused, unwashed, and returned with their original packaging and tags. We may request photos to assess products reported as damaged, defective, or incorrect.</p>,
      },
      {
        heading: "How to start a return",
        content: <p>Contact support within 7 days of delivery with your order ID and the reason for the return. We will provide the return instructions and address after reviewing your request.</p>,
      },
      {
        heading: "Cancellations and refunds",
        content: <p>Contact us as soon as possible if you need to cancel an order. Approved refunds are issued to the original payment method after the returned item is received and inspected, or after we confirm that the order cannot be fulfilled.</p>,
      },
    ],
  },
  privacy: {
    eyebrow: "POLICY",
    title: "Privacy policy",
    intro: "This policy explains how ĀDHYA handles information collected through this store.",
    sections: [
      {
        heading: "Information we collect",
        content: <p>When you place an order, we collect your name, email address, phone number, shipping address, and order details. Payment card and banking details are processed by Razorpay and are not stored by ĀDHYA.</p>,
      },
      {
        heading: "How we use it",
        content: <p>We use this information to process payments, fulfil orders, provide customer support, prevent fraud, and meet legal obligations.</p>,
      },
      {
        heading: "Service providers",
        content: <p>We use trusted service providers, including Razorpay for payment processing and Supabase for order data, only as needed to operate the store.</p>,
      },
      {
        heading: "Contact",
        content: <p>For privacy questions or requests, email us at <a className="underline hover:text-[var(--accent)]" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>,
      },
    ],
  },
  terms: {
    eyebrow: "POLICY",
    title: "Terms and conditions",
    intro: "These terms apply when you browse or buy from ĀDHYA.",
    sections: [
      {
        heading: "Orders and pricing",
        content: <p>Product availability and prices may change without notice. An order is accepted only after payment has been successfully confirmed. We may cancel an order when payment cannot be verified, an item is unavailable, or there is an obvious pricing or listing error.</p>,
      },
      {
        heading: "Payments",
        content: <p>Payments are securely processed by Razorpay. We do not store your card or banking credentials.</p>,
      },
      {
        heading: "Returns",
        content: <p>Returns and refunds are governed by our Cancellation and Returns Policy.</p>,
      },
      {
        heading: "Contact",
        content: <p>Questions about these terms can be sent to <a className="underline hover:text-[var(--accent)]" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>,
      },
    ],
  },
};


function Policies({ policy }) {

  const page = policies[policy];

  if (!page) {
    return null;
  }


  return (
    <main className="min-h-[70vh] px-6 lg:px-10 py-16 lg:py-20">

      <article className="max-w-3xl mx-auto">

        <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">
          {page.eyebrow}
        </p>

        <h1 className="mt-5 text-5xl lg:text-6xl font-semibold tracking-tight">
          {page.title}
        </h1>

        <p className="mt-6 text-lg text-[var(--muted)] leading-relaxed">
          {page.intro}
        </p>

        <div className="mt-12 space-y-10">
          {page.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-semibold tracking-tight">
                {section.heading}
              </h2>
              <div className="mt-4 text-[var(--muted)] leading-relaxed">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-14 pt-6 border-t border-[var(--border)] text-sm text-[var(--muted)]">
          Last updated: 18 August 2026
        </p>

        <Link
          to="/"
          className="inline-block mt-8 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          ← Back to shop
        </Link>

      </article>

    </main>
  );

}


export default Policies;
