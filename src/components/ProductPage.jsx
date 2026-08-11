import { products } from "../data/Products";
import { useParams } from "react-router-dom";
function ProductPage() {

  const { id } = useParams();

  const product = products.find(
    (product) => product.id === Number(id)
  );

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.price}</p>
      <img src={product.image} alt={product.name} />
    </div>
  );
}

export default ProductPage;
