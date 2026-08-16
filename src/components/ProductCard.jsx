import { Link } from "react-router-dom";
import ProductImage from "./ProductImage";

function ProductCard({ product }) {
  return (
    <Link
      to={product.slug ? `/products/${product.slug}` : `/products/${product.id}`}
      className="group block"
    >
      {/* Image */}
      <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[#e9e3d8]">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Product information */}
      <div className="mt-4 flex items-start justify-between gap-4">

        <div>
          <h3 className="text-sm font-medium tracking-tight">
            {product.name}
          </h3>

          <p className="mt-1 text-sm text-[var(--muted)]">
            {product.category}
          </p>
        </div>

        <p className="text-sm font-medium whitespace-nowrap">
          ₹{product.price}
        </p>

      </div>
    </Link>
  );
}

export default ProductCard;
