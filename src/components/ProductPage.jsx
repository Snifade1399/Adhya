import { Link } from "react-router-dom";
import { products } from "../data/Products";
import { useParams } from "react-router-dom";
import { useState } from "react";


function ProductPage({addToCart}) {

  const { id } = useParams();
  
  const [added, setAdded] = useState(false);

  const product = products.find(
    (product) => product.id === Number(id)
  );

  return (
  <main className="px-6 lg:px-12 py-12">

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">

      {/* Product image */}
      <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[#e9e3d8]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product information */}
      <div className="flex flex-col justify-center">

        <Link
          to="/#products"
          className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          ← Back to collection
        </Link>

        <p className="text-sm uppercase tracking-[0.25em] text-[var(--muted)]">
          ĀDHYA
        </p>

        <h1 className="mt-5 text-5xl lg:text-6xl font-semibold tracking-tight">
          {product.name}
        </h1>

        <p className="mt-4 text-2xl">
          ₹{product.price}
        </p>

        <p className="mt-8 max-w-lg text-[var(--muted)] leading-relaxed">
          Thoughtfully chosen for everyday rituals and meaningful spaces.
          Simple objects, made to become part of your everyday life.
        </p>

        <button
          onClick={() => {
            addToCart(product.id);
            setAdded(true);
          }}
          className="mt-10 w-fit px-8 py-4 rounded-full bg-[var(--accent)] text-white text-sm font-medium transition-all duration-300"
        >
          {added ? "✓ Added to Bag" : "Add to Bag"}
        </button>
      </div>

    </div>

  </main>
);
}
export default ProductPage;
