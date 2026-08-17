import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Checkout from "./pages/checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Account from "./pages/Account";
import Policies from "./pages/Policies";

import Cart from "./components/Cart";
import ProductPage from "./components/ProductPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollManager from "./components/ScrollManager";
import ProtectedRoute from "./components/ProtectedRoute";


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

        <Route path="/contact" element={<Policies policy="contact" />} />
        <Route path="/shipping" element={<Policies policy="shipping" />} />
        <Route path="/returns" element={<Policies policy="returns" />} />
        <Route path="/privacy" element={<Policies policy="privacy" />} />
        <Route path="/terms" element={<Policies policy="terms" />} />


        {/* Auth */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />

      </Routes>


      <Footer />

    </>
  );
}


export default App;
