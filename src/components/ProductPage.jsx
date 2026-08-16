import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Reveal from "./Reveal";
import ProductImage from "./ProductImage";
import useProduct from "../hooks/useProduct";
import useCart from "../hooks/useCart";

function ProductPage() {
  const { id } = useParams();
  const { product, loading, error } = useProduct(id);
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);


  /*
   * Reset the "Added to Bag" feedback when
   * navigating from one product to another.
   */
  useEffect(() => {
    setAdded(false);
  }, [id]);


  function handleAddToCart() {
    if (!product) {
      return;
    }

    addToCart(product.id);
    setAdded(true);
  }


  if (loading) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center">

        <p className="text-sm text-[var(--muted)]">
          Loading product...
        </p>

      </main>
    );
  }


  if (error || !product) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-6">

        <div className="text-center">

          <p className="text-sm uppercase tracking-[0.25em] text-[var(--muted)]">
            Product unavailable
          </p>

          <h1 className="mt-4 text-3xl font-semibold">
            We couldn't find this product.
          </h1>

          <p className="mt-4 text-sm text-[var(--muted)]">
            The product may have been removed or the link may be incorrect.
          </p>

          <Link
            to="/#products"
            className="inline-block mt-8 px-6 py-3 rounded-full bg-[var(--text)] text-white text-sm font-medium hover:bg-[var(--accent)] transition-colors"
          >
            Back to collection
          </Link>

        </div>

      </main>
    );
  }


  return (
    <main className="px-6 lg:px-12 py-12">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">

        {/* Product image */}
        <Reveal>

          <div className="group aspect-[4/5] overflow-hidden rounded-2xl bg-[#e9e3d8]">

            <ProductImage
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="eager"
            />

          </div>

        </Reveal>


        {/* Product information */}
        <Reveal
          delay={100}
          rootMargin="0px"
        >

          <div className="flex flex-col justify-center">

            {/* Back link */}
            <Link
              to="/#products"
              className="w-fit text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              ← Back to collection
            </Link>


            {/* Category */}
            <p className="mt-8 text-sm uppercase tracking-[0.25em] text-[var(--muted)]">
              {product.category}
            </p>


            {/* Product name */}
            <h1 className="mt-5 text-5xl lg:text-6xl font-semibold tracking-tight leading-none">
              {product.name}
            </h1>


            {/* Price */}
            <p className="mt-5 text-2xl">
              ₹{product.price}
            </p>


            {/* Description */}
            {product.description && (
              <p className="mt-8 max-w-lg text-[var(--muted)] leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            )}


            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              className={`mt-10 w-fit px-8 py-4 rounded-full text-white text-sm font-medium transition-all duration-300 ${
                added
                  ? "bg-[var(--text)]"
                  : "bg-[var(--accent)] hover:opacity-90"
              }`}
            >
              {added ? "✓ Added to Bag" : "Add to Bag"}
            </button>

          </div>

        </Reveal>

      </div>

    </main>
  );
}

export default ProductPage;
