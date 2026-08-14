import { Link } from "react-router-dom";
function Navbar({ cartItemCount }) {
  return (
    <header className="flex items-center justify-between gap-4 px-6 py-5 bg-orange-500 text-white shadow-md">
      <button className="text-2xl">
      </button>

      <h1 className="text-2xl font-bold">
        Aaradhya Pooja Store
      </h1>

      <Link
        to="/cart"
        className="px-4 py-2 bg-white text-orange-500 rounded-lg font-bold hover:bg-orange-100"
      >
        Cart ({cartItemCount})
      </Link>
    </header>
  );
}

export default Navbar;
