import { useState } from "react";
import ProductCard from "./components/ProductCard";

const products = [
  {
    id: 1,
    name: "Puja Thali",
    price: 499,
    image: "/images/puja-thali.jpg",
    category: "utensils"
  },

  {
    id: 2,
    name: "Brass Diya",
    price: 99,
    image: "/images/brass_diya.jpg",
    category: "utensils",
  },

  {
    id: 3,
    name: "mogra incense",
    price: 59,
    image:"/images/mogra_incense.jpg",
    category: "pooja-essentials",
    

  },

];

function App() {
  const [selectCategory, setSelectCategory] = useState("all");

  const filteredProducts = products.filter((product) => {
  if (selectCategory === "all") {
    return true;
  }

  return product.category === selectCategory;
});

  return (
    <div>
      <div>
        <button onClick={() => setSelectCategory("all")}>
          All
        </button>

        <button onClick={() => setSelectCategory("utensils")}>
          Utensils
        </button>

        <button onClick={() => setSelectCategory("Pooja Essentials")}>
          Pooja Essentials
        </button>
      </div>

      <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-5">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </div>
  );
}
export default App;
