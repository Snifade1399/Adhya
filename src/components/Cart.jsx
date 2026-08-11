import { products } from "../data/Products";

function Cart({ cart, increaseQuantity }) {
  const cartProducts = cart.map((item) => {
    const product = products.find(
      (product) => product.id === item.productId
    );

    return {
      ...product,
      quantity: item.quantity,
    };
  });

  return (
    <div>
      <h1>Shopping Cart</h1>

      {cartProducts.map((product) => (
        <div key={product.id}>
          <img
            className="w-32 h-32 object-cover"
            src={product.image}
            alt={product.name}
          />

          <h2>{product.name}</h2>
          
          <p>₹{product.price}</p>
          
          <p>Quantity: {product.quantity}</p>
          
          <button onClick={() => increaseQuantity(product.id)}>
            +
          </button>
        </div>
      ))}
    </div>
  );
}

export default Cart;
