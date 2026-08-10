function ProductCard({ name, price, image }) {
  return (
    <div>
      <img src={image} alt={name} />
      <h2>{name}</h2>
      <p>₹{price}</p>
    </div>
  );
}

export default ProductCard;
