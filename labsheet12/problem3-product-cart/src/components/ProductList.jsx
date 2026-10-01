import { useCart } from "../context/CartContext";

function ProductList({ products }) {
  const { dispatch } = useCart();

  if (products.length === 0) {
    return <p>No results</p>;
  }

  return (
    <div>
      {products.map((product) => (
        <div
          key={product.id}
          data-testid="product-item"
        >
          <h3>{product.name}</h3>

          <p>₹{product.price}</p>

          <button
            data-testid="add-btn"
            onClick={() =>
              dispatch({
                type: "ADD_ITEM",
                payload: product,
              })
            }
          >
            Add
          </button>
        </div>
      ))}
    </div>
  );
}

export default ProductList;