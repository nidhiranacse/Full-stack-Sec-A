import React, {
    useState,
    useEffect,
    createContext,
    useContext
} from "react";

import {
    BrowserRouter,
    Routes,
    Route,
    Link,
    useParams
} from "react-router-dom";


// ================= PRODUCTS =================

const products = [
    {
        id: 1,
        name: "Laptop",
        price: 55000,
        description: "Powerful laptop for students and developers."
    },
    {
        id: 2,
        name: "Smartphone",
        price: 25000,
        description: "Modern smartphone with a great camera."
    },
    {
        id: 3,
        name: "Headphones",
        price: 3000,
        description: "Wireless headphones with clear sound."
    }
];


// ================= CONTEXT =================

const CartContext = createContext();

function CartProvider({ children }) {

    const [cart, setCart] = useState([]);

    function addToCart(product) {
        setCart([...cart, product]);
    }

    return (
        <CartContext.Provider value={{ cart, addToCart }}>
            {children}
        </CartContext.Provider>
    );
}


// ================= NAVBAR =================

function Navbar() {

    const { cart } = useContext(CartContext);

    return (
        <nav className="navbar">

            <h2>My Shop</h2>

            <div>
                <Link to="/">Home</Link>
                <Link to="/products">Products</Link>

                <span>
                    🛒 Cart: {cart.length}
                </span>
            </div>

        </nav>
    );
}


// ================= HOME =================

function Home() {

    return (
        <div className="page">

            <h1>Welcome to My Shop</h1>

            <p>
                This is a React Single Page Application.
            </p>

            <Link to="/products">
                <button>View Products</button>
            </Link>

        </div>
    );
}


// ================= PRODUCTS =================

function Products() {

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);

    }, []);


    if (loading) {
        return (
            <div className="page">
                <h2>Loading products...</h2>
            </div>
        );
    }


    return (
        <div className="page">

            <h1>Products</h1>

            <div className="products">

                {products.map((product) => (

                    <div className="product-card" key={product.id}>

                        <h2>{product.name}</h2>

                        <p>₹{product.price}</p>

                        <Link to={`/products/${product.id}`}>
                            <button>View Details</button>
                        </Link>

                    </div>

                ))}

            </div>

        </div>
    );
}


// ================= PRODUCT DETAILS =================

function ProductDetails() {

    const { id } = useParams();

    const { addToCart } = useContext(CartContext);

    const product = products.find(
        (item) => item.id === Number(id)
    );


    if (!product) {
        return (
            <div className="page">

                <h1>Product Not Found</h1>

                <Link to="/products">
                    Back to Products
                </Link>

            </div>
        );
    }


    return (
        <div className="page">

            <h1>{product.name}</h1>

            <h2>₹{product.price}</h2>

            <p>{product.description}</p>

            <button onClick={() => addToCart(product)}>
                Add to Cart
            </button>

            <br />
            <br />

            <Link to="/products">
                ← Back to Products
            </Link>

        </div>
    );
}


// ================= 404 =================

function NotFound() {

    return (
        <div className="page">

            <h1>404</h1>

            <h2>Page Not Found</h2>

            <p>This page does not exist.</p>

            <Link to="/">
                Go Home
            </Link>

        </div>
    );
}


// ================= APP =================

function App() {

    return (

        <BrowserRouter>

            <CartProvider>

                <Navbar />

                <Routes>

                    <Route
                        path="/"
                        element={<Home />}
                    />

                    <Route
                        path="/products"
                        element={<Products />}
                    />

                    <Route
                        path="/products/:id"
                        element={<ProductDetails />}
                    />

                    <Route
                        path="*"
                        element={<NotFound />}
                    />

                </Routes>

            </CartProvider>

        </BrowserRouter>

    );
}


// ================= CSS =================

const style = document.createElement("style");

style.textContent = `

    * {
        box-sizing: border-box;
    }

    body {
        margin: 0;
        font-family: Arial, sans-serif;
        background: #f2f2f2;
        color: #333;
    }

    .navbar {
        background: #222;
        color: white;
        padding: 15px 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .navbar h2 {
        margin: 0;
    }

    .navbar a {
        color: white;
        text-decoration: none;
        margin-right: 20px;
    }

    .page {
        width: 80%;
        max-width: 900px;
        margin: 50px auto;
        text-align: center;
    }

    button {
        padding: 10px 18px;
        border: none;
        border-radius: 5px;
        background: #333;
        color: white;
        cursor: pointer;
    }

    button:hover {
        background: #555;
    }

    .products {
        display: flex;
        justify-content: center;
        gap: 20px;
        flex-wrap: wrap;
    }

    .product-card {
        background: white;
        width: 220px;
        padding: 25px;
        border-radius: 10px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
    }

    .product-card p {
        font-size: 20px;
        font-weight: bold;
    }

`;

document.head.appendChild(style);


export default App;