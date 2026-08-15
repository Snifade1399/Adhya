import { products } from "../data/Products";
import { Link } from "react-router-dom";

function Cart({
  cart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
}) {
  const cartProducts = cart.map((item) => {
    const product = products.find(
      (product) => product.id === item.productId
    );

    return {
      ...product,
      quantity: item.quantity,
    };
  });

  const subtotal = cartProducts.reduce((sum, product) => {
    return sum + product.price * product.quantity;
  }, 0);

  // Empty cart
  if (cartProducts.length === 0) {
    return (
      <main className="min-h-[70vh] px-6 lg:px-12 py-20">
        <div className="max-w-3xl mx-auto text-center">

          <p className="text-sm uppercase tracking-[0.25em] text-[var(--muted)]">
            Your bag
          </p>

          <h1 className="mt-5 text-5xl lg:text-6xl font-semibold tracking-tight">
            Your bag is empty.
          </h1>

          <p className="mt-6 text-[var(--muted)] leading-relaxed">
            Nothing has been added yet. Explore the collection
            and find something that belongs in your space.
          </p>

          <Link
            to="/#products"
            className="inline-block mt-10 px-8 py-4 rounded-full bg-[var(--text)] text-white text-sm font-medium hover:bg-[var(--accent)] transition-colors"
          >
            Explore Collection
          </Link>

        </div>
      </main>
    );
  }

  return (
    <main className="px-6 lg:px-12 py-12">

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col gap-4 mb-12">

          <p className="text-sm uppercase tracking-[0.25em] text-[var(--muted)]">
            Your bag
          </p>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">

            <h1 className="text-5xl lg:text-6xl font-semibold tracking-tight">
              Shopping bag
            </h1>

            <Link
              to="/#products"
              className="w-fit text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              ← Continue shopping
            </Link>

          </div>

        </div>


        {/* Cart layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">

          {/* Products */}
          <div className="space-y-0">

            {cartProducts.map((product) => (
              <div
                key={product.id}
                className="flex flex-col sm:flex-row gap-6 py-8 border-t border-[var(--border)]"
              >

                {/* Product image */}
                <Link
                  to={`/products/${product.id}`}
                  className="group w-full sm:w-40 aspect-square shrink-0 overflow-hidden rounded-xl bg-[#e9e3d8]"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </Link>


                {/* Product information */}
                <div className="flex flex-1 flex-col">

                  <div className="flex justify-between gap-6">

                    <div>
                      <Link
                        to={`/products/${product.id}`}
                        className="text-lg font-medium tracking-tight hover:text-[var(--accent)] transition-colors"
                      >
                        {product.name}
                      </Link>

                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {product.category}
                      </p>
                    </div>

                    <p className="text-sm font-medium whitespace-nowrap">
                      ₹{product.price}
                    </p>

                  </div>


                  {/* Quantity controls */}
                  <div className="mt-auto pt-6 flex items-center justify-between">

                    <div className="flex items-center border border-[var(--border)] rounded-full overflow-hidden">

                      <button
                        onClick={() => decreaseQuantity(product.id)}
                        className="w-9 h-9 flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-[#eeeae3] transition-colors"
                      >
                        −
                      </button>

                      <span className="w-10 text-center text-sm">
                        {product.quantity}
                      </span>

                      <button
                        onClick={() => increaseQuantity(product.id)}
                        className="w-9 h-9 flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-[#eeeae3] transition-colors"
                      >
                        +
                      </button>

                    </div>


                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-sm text-[var(--muted)] hover:text-red-600 transition-colors"
                    >
                      Remove
                    </button>

                  </div>

                </div>

              </div>
            ))}

          </div>


          {/* Summary */}
          <aside className="lg:sticky lg:top-8 h-fit">

            <div className="border-t border-[var(--border)] pt-6">

              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted)]">
                  Subtotal
                </span>

                <span className="text-lg font-medium">
                  ₹{subtotal}
                </span>
              </div>


              <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">
                Taxes and shipping will be calculated at checkout.
              </p>


              <button
                className="w-full mt-8 px-6 py-4 rounded-full bg-[var(--text)] text-white text-sm font-medium hover:bg-[var(--accent)] transition-colors"
              >
                Checkout
              </button>

            </div>

          </aside>

        </div>

      </div>

    </main>
  );
}

export default Cart;
