import { Link, useLocation } from "react-router-dom";


function OrderSuccess() {

  const location = useLocation();

  /*
   * Order data currently travels via router state set by the checkout page.
   * This is the integration point that will later fetch the order from the
   * server (e.g. a fetch-order Edge Function) instead of trusting client state.
   */
  const orderId = location.state?.orderId;
  const total = location.state?.total;
  const customerName = location.state?.customerName;


  /*
   * If somebody visits /order-success directly,
   * there won't be an order attached to the page.
   */
  if (!orderId) {

    return (
      <main className="min-h-[70vh] px-6 lg:px-10 py-20">

        <div className="max-w-2xl mx-auto text-center">

          <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">
            ORDER
          </p>

          <h1 className="mt-6 text-5xl lg:text-6xl font-semibold tracking-tight">
            No order found.
          </h1>

          <p className="mt-6 text-[var(--muted)] leading-relaxed">
            This page is only available after successfully placing an order.
          </p>

          <Link
            to="/"
            className="inline-block mt-10 px-7 py-4 rounded-full bg-[var(--text)] text-white text-sm font-medium hover:bg-[var(--accent)] transition-colors"
          >
            Continue Shopping
          </Link>

        </div>

      </main>
    );

  }


  return (
    <main className="min-h-[70vh] px-6 lg:px-10 py-20">

      <div className="max-w-3xl mx-auto text-center">

        {/* Success icon */}
        <div className="mx-auto w-16 h-16 rounded-full border border-[var(--border)] flex items-center justify-center">

          <span className="text-2xl">
            ✓
          </span>

        </div>


        {/* Heading */}
        <p className="mt-10 text-sm uppercase tracking-[0.3em] text-[var(--muted)]">
          ORDER CONFIRMED
        </p>


        <h1 className="mt-5 text-5xl lg:text-6xl font-semibold tracking-tight">
          Thank you{customerName ? `, ${customerName}` : ""}.
        </h1>


        <p className="mt-6 max-w-lg mx-auto text-[var(--muted)] leading-relaxed">
          Your payment has been confirmed and your order has been placed.
          We'll take care of the rest.
        </p>


        {/* Order details */}
        <div className="mt-12 max-w-md mx-auto border border-[var(--border)] rounded-2xl p-6 text-left">

          <div className="flex justify-between gap-6">

            <span className="text-sm text-[var(--muted)]">
              Order ID
            </span>

            <span className="text-sm font-medium text-right break-all">
              {orderId}
            </span>

          </div>


          {total !== undefined && (
            <div className="mt-5 pt-5 border-t border-[var(--border)] flex justify-between">

              <span className="text-sm text-[var(--muted)]">
                Total
              </span>

              <span className="text-lg font-semibold">
                ₹{total}
              </span>

            </div>
          )}

        </div>


        {/* Actions */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">

          <Link
            to="/"
            className="px-7 py-4 rounded-full bg-[var(--text)] text-white text-sm font-medium hover:bg-[var(--accent)] transition-colors"
          >
            Continue Shopping
          </Link>

          <Link
            to="/cart"
            className="px-7 py-4 rounded-full border border-[var(--border)] text-sm font-medium hover:bg-[var(--surface)] transition-colors"
          >
            View Bag
          </Link>

        </div>


      </div>

    </main>
  );
}


export default OrderSuccess;
