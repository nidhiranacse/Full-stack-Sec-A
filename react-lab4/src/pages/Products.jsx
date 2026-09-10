import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Products() {

    const { addToCart } = useCart();

    const products = [
        {
            id: 1,
            name: "Laptop",
            price: 60000,
            description: "Powerful laptop for programming and work."
        },
        {
            id: 2,
            name: "Smartphone",
            price: 25000,
            description: "Modern smartphone with excellent features."
        },
        {
            id: 3,
            name: "Headphones",
            price: 3000,
            description: "Wireless headphones with high-quality sound."
        }
    ];

    return (
        <div className="page">

            <h1>Products</h1>

            <div className="products">

                {products.map(product => (

                    <div className="product-card" key={product.id}>

                        <h2>{product.name}</h2>

                        <p>₹{product.price}</p>

                        <p>{product.description}</p>

                        <Link to={`/products/${product.id}`}>
                            <button>View Details</button>
                        </Link>

                        <button
                            onClick={() => addToCart(product)}
                        >
                            Add to Cart
                        </button>

                    </div>

                ))}

            </div>

        </div>
    );
}

export default Products;