import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Checkout from "./pages/checkout";
import OrderSuccess from "./pages/OrderSuccess";

import Cart from "./components/Cart";
import ProductPage from "./components/ProductPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollManager from "./components/ScrollManager";


function App() {
  return (
    <>

      <ScrollManager />

      <Navbar />


      <Routes>

        {/* Home */}
        <Route
          path="/"
          element={<Home />}
        />


        {/* Product page */}
        <Route
          path="/products/:id"
          element={<ProductPage />}
        />


        {/* Cart */}
        <Route
          path="/cart"
          element={<Cart />}
        />


        {/* Checkout */}
        <Route
          path="/checkout"
          element={<Checkout />}
        />


        {/* Order success */}
        <Route
          path="/order-success"
          element={<OrderSuccess />}
        />

      </Routes>


      <Footer />

    </>
  );
}


export default App;
