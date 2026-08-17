import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import ProductImage from "../components/ProductImage";
import { supabase } from "../lib/supabaseClient";
import useCart from "../hooks/useCart";
import useCartProducts from "../hooks/useCartProducts";


const CHECKOUT_ID_KEY = "adhya-checkout-id";
const RAZORPAY_CHECKOUT_URL = "https://checkout.razorpay.com/v1/checkout.js";


/* Razorpay provides Checkout as a browser script, rather than an npm package. */
function loadRazorpayCheckout() {

  if (window.Razorpay) {
    return Promise.resolve();
  }


  return new Promise((resolve, reject) => {

    const existingScript = document.querySelector(
      `script[src="${RAZORPAY_CHECKOUT_URL}"]`
    );

    if (existingScript) {
      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Unable to load the payment window.")),
        { once: true }
      );
      return;
    }


    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_URL;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Unable to load the payment window."));
    document.body.appendChild(script);

  });

}


/*
 * Returns the idempotency key for the current checkout session, generating a
 * UUID once and persisting it in sessionStorage so a page refresh or retry
 * reuses the same key. Removed only after payment is confirmed.
 * Session-scoped on purpose (sessionStorage, not localStorage): checkout
 * idempotency should never outlive the browsing session.
 */
function getOrCreateCheckoutId() {

  try {

    const existing = sessionStorage.getItem(CHECKOUT_ID_KEY);

    if (existing) {
      return existing;
    }

  } catch (error) {

    console.error("Could not read checkout id:", error);

  }


  let id = "";

  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    id = crypto.randomUUID();
  } else {
    id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      (character) => {
        const random = (Math.random() * 16) | 0;
        const value = character === "x" ? random : (random & 0x3) | 0x8;
        return value.toString(16);
      }
    );
  }


  try {

    sessionStorage.setItem(CHECKOUT_ID_KEY, id);

  } catch (error) {

    console.error("Could not store checkout id:", error);

  }


  return id;
}


function clearCheckoutId() {

  try {

    sessionStorage.removeItem(CHECKOUT_ID_KEY);

  } catch (error) {

    console.error("Could not clear checkout id:", error);

  }

}


function Checkout() {

  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { cartProducts, loading, error } = useCartProducts();


  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });


  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);


  /*
   * Idempotency key for this checkout session: generated once, persisted in
   * sessionStorage so a refresh or retry reuses it, cleared only after payment
   * is confirmed. Never regenerated per render.
   */
  const [checkoutId] = useState(getOrCreateCheckoutId);


  const subtotal = cartProducts.reduce(
    (sum, product) => {
      return sum + product.price * product.quantity;
    },
    0
  );


  const shipping = 0;
  const total = subtotal + shipping;


  function handleChange(event) {

    const { name, value } = event.target;


    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

  }


  async function handleSubmit(event) {

    event.preventDefault();


    if (submitting) {
      return;
    }


    setSubmitting(true);
    setSubmitError(null);


    const { data, error } =
      await supabase.functions.invoke(
        "create-order",
        {
          body: {
            checkoutId: checkoutId,
            customerName: formData.name,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            shippingAddress: formData.address,

            items: cart.map((item) => ({
              product_id: item.productId,
              quantity: item.quantity,
            })),
          },
        }
      );


    if (error) {

      console.error(
        "Order creation failed:",
        error
      );

      let message =
        error.message ||
        "Unable to create your order.";

      if (error.context) {

        try {

          const context = await error.context.json();

          if (context?.error) {
            message = context.error;
          }

        } catch {

          /* keep the fallback message */

        }

      }

      setSubmitError(message);
      setSubmitting(false);

      return;
    }


    if (
      !data?.orderId ||
      !data?.razorpayOrderId ||
      !data?.amount ||
      !data?.currency ||
      !data?.keyId
    ) {

      setSubmitError(
        "Unable to create your order."
      );

      setSubmitting(false);

      return;
    }


    try {

      await loadRazorpayCheckout();

      let paymentSubmitted = false;

      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "ĀDHYA",
        description: "Order payment",
        order_id: data.razorpayOrderId,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          order_id: data.orderId,
        },
        theme: {
          color: "#1f1b16",
        },
        handler: async (payment) => {

          paymentSubmitted = true;
          setSubmitError(null);

          try {

            const { data: verification, error: verificationError } =
              await supabase.functions.invoke("verify-payment", {
                body: {
                  orderId: data.orderId,
                  razorpayOrderId: payment.razorpay_order_id,
                  razorpayPaymentId: payment.razorpay_payment_id,
                  razorpaySignature: payment.razorpay_signature,
                },
              });

            if (verificationError || !verification?.success) {
              let message =
                verificationError?.message ||
                verification?.error ||
                "We could not confirm your payment. Please contact us with your payment ID.";

              if (verificationError?.context) {
                try {
                  const context = await verificationError.context.json();
                  message = context?.error || message;
                } catch {
                  /* keep the fallback message */
                }
              }

              throw new Error(message);
            }


            clearCart();
            clearCheckoutId();

            navigate("/order-success", {
              state: {
                orderId: data.orderId,
                total: data.amount / 100,
                customerName: formData.name,
              },
            });

          } catch (error) {

            console.error("Payment verification failed:", error);
            setSubmitError(
              error instanceof Error
                ? error.message
                : "We could not confirm your payment. Please contact us with your payment ID."
            );
            setSubmitting(false);

          }

        },
        modal: {
          ondismiss: () => {
            if (!paymentSubmitted) {
              setSubmitting(false);
            }
          },
        },
      });

      razorpay.open();

    } catch (error) {

      console.error("Could not open Razorpay Checkout:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to open the payment window. Please try again."
      );
      setSubmitting(false);

    }

  }


  /*
   * Loading
   */
  if (loading) {

    return (
      <main className="min-h-[70vh] flex items-center justify-center">

        <p className="text-sm text-[var(--muted)]">
          Loading checkout...
        </p>

      </main>
    );

  }


  /*
   * Error loading products
   */
  if (error) {

    return (
      <main className="min-h-[70vh] flex items-center justify-center px-6">

        <div className="max-w-md text-center">

          <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">
            CHECKOUT
          </p>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight">
            Something went wrong.
          </h1>

          <p className="mt-5 text-sm text-[var(--muted)]">
            We couldn't load the products in your order.
          </p>

          <p className="mt-3 text-xs text-[var(--muted)]">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-8 px-7 py-4 rounded-full bg-[var(--text)] text-white text-sm font-medium hover:bg-[var(--accent)] transition-colors"
          >
            Refresh
          </button>

        </div>

      </main>
    );

  }


  /*
   * Empty cart
   */
  if (cartProducts.length === 0) {

    return (
      <main className="min-h-[70vh] px-6 lg:px-10 py-20">

        <div className="max-w-3xl mx-auto text-center">

          <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">
            CHECKOUT
          </p>

          <h1 className="mt-6 text-5xl lg:text-6xl font-semibold tracking-tight">
            Your bag is empty.
          </h1>

          <p className="mt-6 text-[var(--muted)]">
            Add something to your bag before checking out.
          </p>

          <Link
            to="/#products"
            className="inline-block mt-10 px-7 py-4 rounded-full bg-[var(--text)] text-white text-sm font-medium hover:bg-[var(--accent)] transition-colors"
          >
            Continue Shopping
          </Link>

        </div>

      </main>
    );

  }


  return (
    <main className="px-6 lg:px-10 py-16 lg:py-20">

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-12">

          <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">
            CHECKOUT
          </p>

          <h1 className="mt-4 text-5xl lg:text-6xl font-semibold tracking-tight">
            Complete your order.
          </h1>

          <p className="mt-4 text-[var(--muted)]">
            Enter your details and review your order before placing it.
          </p>

        </div>


        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-20"
        >

          {/* Customer information */}
          <div className="space-y-10">

            {/* Contact */}
            <section>

              <h2 className="text-2xl font-semibold tracking-tight">
                Contact information
              </h2>


              <div className="mt-6 space-y-5">

                <div>

                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                  >
                    Full name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-transparent outline-none focus:border-[var(--text)] transition-colors"
                  />

                </div>


                <div>

                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-transparent outline-none focus:border-[var(--text)] transition-colors"
                  />

                </div>


                <div>

                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium mb-2"
                  >
                    Phone number
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-transparent outline-none focus:border-[var(--text)] transition-colors"
                  />

                </div>

              </div>

            </section>


            {/* Address */}
            <section>

              <h2 className="text-2xl font-semibold tracking-tight">
                Shipping address
              </h2>


              <div className="mt-6">

                <label
                  htmlFor="address"
                  className="block text-sm font-medium mb-2"
                >
                  Complete address
                </label>

                <textarea
                  id="address"
                  name="address"
                  required
                  rows="5"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House number, street, city, state, PIN code"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-transparent outline-none focus:border-[var(--text)] transition-colors resize-none"
                />

              </div>

            </section>


            <Link
              to="/cart"
              className="inline-block text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              ← Back to bag
            </Link>

          </div>


          {/* Summary */}
          <aside className="lg:sticky lg:top-32 h-fit">

            <div className="border border-[var(--border)] rounded-2xl p-6 lg:p-8">

              <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
                ORDER SUMMARY
              </p>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                Your order
              </h2>


              <div className="mt-8 space-y-5">

                {cartProducts.map((product) => (

                  <div
                    key={product.id}
                    className="flex gap-4"
                  >

                    <div className="w-16 h-20 shrink-0 overflow-hidden rounded-lg bg-[#e9e3d8]">

                      <ProductImage
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />

                    </div>


                    <div className="flex-1 min-w-0">

                      <div className="flex justify-between gap-4">

                        <p className="text-sm font-medium">
                          {product.name}
                        </p>

                        <p className="text-sm">
                          ₹{product.price * product.quantity}
                        </p>

                      </div>

                      <p className="mt-1 text-xs text-[var(--muted)]">
                        Qty {product.quantity}
                      </p>

                    </div>

                  </div>

                ))}

              </div>


              <div className="mt-8 pt-6 border-t border-[var(--border)] space-y-4 text-sm">

                <div className="flex justify-between gap-4">

                  <span className="text-[var(--muted)]">
                    Subtotal
                  </span>

                  <span>
                    ₹{subtotal}
                  </span>

                </div>


                <div className="flex justify-between gap-4">

                  <span className="text-[var(--muted)]">
                    Shipping
                  </span>

                  <span>
                    Free
                  </span>

                </div>

              </div>


              <div className="mt-6 pt-6 border-t border-[var(--border)]">

                <div className="flex justify-between items-center">

                  <span className="font-medium">
                    Total
                  </span>

                  <span className="text-xl font-semibold">
                    ₹{total}
                  </span>

                </div>

              </div>


              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-8 px-6 py-4 rounded-full bg-[var(--text)] text-white text-sm font-medium hover:bg-[var(--accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? "Preparing Payment..."
                  : "Pay Securely"}
              </button>


              {submitError && (
                <p className="mt-4 text-sm text-red-600 text-center">
                  {submitError}
                </p>
              )}


              <p className="mt-4 text-xs text-center text-[var(--muted)] leading-relaxed">
                Your order will be created securely before payment.
              </p>

            </div>

          </aside>

        </form>

      </div>

    </main>
  );
}


export default Checkout;
