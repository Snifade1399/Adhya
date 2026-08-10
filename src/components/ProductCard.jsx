function ProductCard({ product }) {
  return (
    <div className="w-=full p-4 space-y-1 rounded-xl shadow-md bg-orange-300">
      <img className="w-full h-64 object-cover" src={product.image} alt={product.name} />
      <h2 className="text-xl font-semibold text-amber-800">{product.name}</h2>
      <p className="font-bold text-cyan-900">₹{product.price}</p>
      <p>{product.category}</p>
    </div>
  );
}

export default ProductCard;
