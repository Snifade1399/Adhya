import { Link } from "react-router-dom";

function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="group block"
    >
      <div>
        <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[#e9e3d8]">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="flex items-start justify-between mt-4">
          <div>
            <h2 className="text-base font-medium">
              {product.name}
            </h2>

            <p className="mt-1 text-sm text-[var(--muted)]">
              ₹{product.price}
            </p>
          </div>

          <span className="text-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
