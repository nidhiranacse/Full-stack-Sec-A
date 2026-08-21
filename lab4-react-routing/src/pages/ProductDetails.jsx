import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";

const ProductDetails = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`https://fakestoreapi.com/products/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <h2 className="loading">Loading Product...</h2>;
  }

  if (!product) {
    return <h2>Product not found</h2>;
  }

  return (
    <div className="product-details">
      <img src={product.image} alt={product.title} />

      <div>
        <h1>{product.title}</h1>

        <p className="price">
          ${product.price}
        </p>

        <p>{product.description}</p>

        <button
          className="btn"
          onClick={() => addToCart(product)}
        >
          Add to Cart 🛒
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;