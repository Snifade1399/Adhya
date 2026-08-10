import ProductCard from "./components/ProductCard";

const products = [
  {
    name: "Puja Thali",
    price: 499,
    image: "/images/puja-thali.jpg",
  },
];

function App() {
  return (
    <div>
      {products.map((product) => (
        <ProductCard
          name={product.name}
          price={product.price}
          image={product.image}
        />
      ))}
    </div>
  );
}

export default App;
