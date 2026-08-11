import { useState } from "react";
import { Routes, Route } from "react-router-dom";
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

  {
    id: 4,
    name: "Pooja Dhoop",
    price: 159,
    image:"/images/pooja_dhoop.jpg",
    category: "pooja-essentials",
  },

  {
    id: 5,
    name : "Ganesha Idol",
    price: 599,
    image: "/images/ganesh_idol.jpg",
    category: "idols"
  },

  {
    id: 6,
    name:"Pooja kit",
    price: 399,
    image: "/images/pooja_kit.jpg",
    category: "kits",
  },

  {
    id: 7,
    name: "Shiv Idol",
    price: 499,
    image: "/images/shiv_idol.jpg",
    category: "idols",
  },

  {
    id: 8,
    name: "Pooja Til/Sesame oil",
    price: 299,
    image: "/images/til_oil.jpg",
    category: "pooja-essentials",
  },
];

function Home() {
  const [selectCategory, setSelectCategory] = useState("all");

  const filteredProducts = products.filter((product) => {
  if (selectCategory === "all") {
    return true;
  }

  return product.category === selectCategory;
});

  return (
    <div className="min-h-screen">
      
      <header className="flex items-center gap-4 px-6 py-5 bg-orange-500 text-white shadow-md">
        <button className="text-2xl">
        </button>

        <h1 className="text-2xl font-bold">
          Aaradhya Pooja Store
        </h1>
      </header>

      <div className="flex gap-3 px-6 py-6">
        <button 
          onClick={() => setSelectCategory("all")}
          className={selectCategory === "all" ? "bg-orange-500 text-white" : ""}
        >
          All
        </button>

        <button 
          onClick={() => setSelectCategory("utensils")}
          className={selectCategory === "utensils" ? "bg-orange-500 text-white" : ""}
        >
          Utensils
        </button>

        <button 
          onClick={() => setSelectCategory("pooja-essentials")}
          className={selectCategory === "pooja-essentials" ? "bg-orange-500 text-white" : ""}
        >
          Pooja Essentials
        </button>

        <button 
          onClick={() => setSelectCategory("idols")}
          className={selectCategory === "idols" ? "bg-orange-500 text-white" : ""}
        >
          Idols/Statues
        </button>

        <button 
          onClick={() => setSelectCategory("kits")}
          className={selectCategory === "kits" ? "bg-orange-500 text-white" : ""}
        >
          Pooja Kits
        </button>

      </div>

      <div className="p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </div>
  );
}

function App() {
  return(
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );

}
export default App;
