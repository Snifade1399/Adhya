import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function Cart({
  cart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
}) {
  const [cartProducts, setCartProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  /*
   * Fetch the products currently in the cart
   * from Supabase.
   */
  useEffect(() => {
    async function fetchCartProducts() {
      if (cart.length === 0) {
        setCartProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const productIds = cart.map((item) => item.productId);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds);

      if (error) {
        console.error("Error fetching cart products:", error);
        setError(error.message);
        setCartProducts([]);
        setLoading(false);
        return;
      }

      /*
       * Combine Supabase product information
       * with the quantity stored in the cart.
       */
      const combinedProducts = cart
        .map((item) => {
          const product = data.find(
            (product) => product.id === item.productId
          );

          if (!product) {
            return null;
          }

          return {
            ...product,
            quantity: item.quantity,
          };
        })
        .filter(Boolean);

      setCartProducts(combinedProducts);
      setLoading(false);
    }

    fetchCartProducts();
  }, [cart]);


  /*
   * Calculate subtotal
   */
  const subtotal = cartProducts.reduce((sum, product) => {
    return sum + product.price * product.quantity;
  }, 0);


  /*
   * Loading state
   */
  if (loading) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-6">

        <p className="text-sm text-[var(--muted)]">
          Loading your bag...
        </p>

      </main>
    );
  }


  /*
   * Error state
   */
  if (error) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-6">

        <div className="max-w-md text-center">

          <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">
            YOUR BAG
          </p>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight">
            Something went wrong.
          </h1>

          <p className="mt-5 text-sm text-[var(--muted)] leading-relaxed">
            We couldn't load the products in your bag.
            Please try refreshing the page.
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
            YOUR BAG
          </p>

          <h1 className="mt-6 text-5xl lg:text-6xl font-semibold tracking-tight">
            Your bag is empty.
          </h1>

          <p className="mt-6 max-w-md mx-auto text-[var(--muted)] leading-relaxed">
            Looks like you haven't added anything yet.
            Explore the collection and find something meaningful
            for your everyday rituals.
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


  /*
   * Cart with products
   */
  return (
    <main className="px-6 lg:px-10 py-16 lg:py-20">

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-12">

          <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">
            YOUR BAG
          </p>

          <h1 className="mt-4 text-5xl lg:text-6xl font-semibold tracking-tight">
            Shopping bag
          </h1>

          <p className="mt-4 text-[var(--muted)]">
            {cartProducts.length}{" "}
            {cartProducts.length === 1 ? "item" : "items"} in your bag.
          </p>

        </div>


        {/* Main cart layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-20">


          {/* Products */}
          <div className="space-y-6">

            {cartProducts.map((product) => (

              <div
                key={product.id}
                className="group flex flex-col sm:flex-row gap-6 pb-6 border-b border-[var(--border)]"
              >

                {/* Product image */}
                <Link
                  to={`/products/${product.id}`}
                  className="shrink-0"
                >

                  <div className="w-full sm:w-36 aspect-[4/5] overflow-hidden rounded-xl bg-[#e9e3d8]">

                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                  </div>

                </Link>


                {/* Product information */}
                <div className="flex flex-1 flex-col justify-between gap-6">

                  <div className="flex items-start justify-between gap-6">

                    <div>

                      <Link
                        to={`/products/${product.id}`}
                        className="text-lg font-medium hover:text-[var(--accent)] transition-colors"
                      >
                        {product.name}
                      </Link>

                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {product.category}
                      </p>

                      <p className="mt-3 text-sm">
                        ₹{product.price}
                      </p>

                    </div>


                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-sm text-[var(--muted)] hover:text-red-600 transition-colors"
                    >
                      Remove
                    </button>

                  </div>


                  {/* Quantity + item subtotal */}
                  <div className="flex items-center justify-between gap-4">

                    {/* Quantity controls */}
                    <div className="flex items-center border border-[var(--border)] rounded-full overflow-hidden">

                      <button
                        onClick={() => decreaseQuantity(product.id)}
                        className="w-10 h-10 flex items-center justify-center text-lg hover:bg-[var(--surface)] transition-colors"
                        aria-label={`Decrease quantity of ${product.name}`}
                      >
                        −
                      </button>

                      <span className="w-10 text-center text-sm font-medium">
                        {product.quantity}
                      </span>

                      <button
                        onClick={() => increaseQuantity(product.id)}
                        className="w-10 h-10 flex items-center justify-center text-lg hover:bg-[var(--surface)] transition-colors"
                        aria-label={`Increase quantity of ${product.name}`}
                      >
                        +
                      </button>

                    </div>


                    {/* Item subtotal */}
                    <p className="text-sm font-medium">
                      ₹{product.price * product.quantity}
                    </p>

                  </div>

                </div>

              </div>

            ))}


            {/* Continue shopping */}
            <Link
              to="/#products"
              className="inline-block pt-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              ← Continue shopping
            </Link>

          </div>


          {/* Order summary */}
          <aside className="lg:sticky lg:top-32 h-fit">

            <div className="border border-[var(--border)] rounded-2xl p-6 lg:p-8">

              <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
                ORDER SUMMARY
              </p>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                Your order
              </h2>


              {/* Pricing */}
              <div className="mt-8 space-y-4 text-sm">

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
                    Calculated at checkout
                  </span>

                </div>

              </div>


              {/* Total */}
              <div className="mt-6 pt-6 border-t border-[var(--border)]">

                <div className="flex justify-between items-center">

                  <span className="font-medium">
                    Total
                  </span>

                  <span className="text-xl font-semibold">
                    ₹{subtotal}
                  </span>

                </div>

              </div>


              {/* Checkout */}
              <Link
                to="/checkout"
                className="block w-full mt-8 px-6 py-4 rounded-full bg-[var(--text)] text-white text-sm font-medium text-center hover:bg-[var(--accent)] transition-colors"
              >
                Proceed to Checkout
              </Link>

              <p className="mt-4 text-xs text-center text-[var(--muted)] leading-relaxed">
                Secure checkout and payment options will be available soon.
              </p>

            </div>

          </aside>

        </div>

      </div>

    </main>
  );
}

export default Cart;
