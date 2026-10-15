import { useState } from "react";

function Cart() {
    const [cart, setCart] = useState([]);
    const [discount, setDiscount] = useState(10);

    const products = [
        { id: 1, name: "Laptop", price: 50000 },
        { id: 2, name: "Headphones", price: 2000 },
        { id: 3, name: "Mouse", price: 800 },
        { id: 4, name: "Keyboard", price: 1500 }
    ];

    const addToCart = (product) => {
        const exists = cart.find(item => item.id === product.id);

        if (exists) {
            setCart(cart.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const increaseQty = (id) => {
        setCart(cart.map(item =>
            item.id === id
                ? { ...item, quantity: item.quantity + 1 }
                : item
        ));
    };

    const decreaseQty = (id) => {
        setCart(cart.map(item =>
            item.id === id && item.quantity > 1
                ? { ...item, quantity: item.quantity - 1 }
                : item
        ));
    };

    const removeItem = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const subtotal = cart.reduce(
        (total, item) => total + item.price * item.quantity, 0
    );

    const discountAmount = subtotal * discount / 100;
    const grandTotal = subtotal - discountAmount;

    return (
        <div className="container">
            <h1>🛒 Shopping Cart</h1>

            <h2>Available Products</h2>

            <div className="products">
                {products.map(product => (
                    <div className="product" key={product.id}>
                        <h3>{product.name}</h3>
                        <p>Price: ₹{product.price.toLocaleString("en-IN")}</p>
                        <button onClick={() => addToCart(product)}>
                            Add to Cart
                        </button>
                    </div>
                ))}
            </div>

            <h2>My Cart</h2>

            {cart.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                cart.map(item => (
                    <div className="cart-item" key={item.id}>
                        <strong>{item.name}</strong>
                        <p>₹{item.price.toLocaleString("en-IN")} × {item.quantity}</p>

                        <button onClick={() => decreaseQty(item.id)}>-</button>
                        <span className="quantity">{item.quantity}</span>
                        <button onClick={() => increaseQty(item.id)}>+</button>
                        <button className="remove" onClick={() => removeItem(item.id)}>
                            Remove
                        </button>
                    </div>
                ))
            )}

            <div className="summary">
                <h2>Bill Summary</h2>
                <p>Subtotal: ₹{subtotal.toLocaleString("en-IN")}</p>

                <label>Discount: </label>
                <select
                    value={discount}
                    onChange={e => setDiscount(Number(e.target.value))}
                >
                    <option value={0}>0%</option>
                    <option value={10}>10%</option>
                    <option value={20}>20%</option>
                </select>

                <p>Discount Amount: ₹{discountAmount.toLocaleString("en-IN")}</p>
                <h2>Grand Total: ₹{grandTotal.toLocaleString("en-IN")}</h2>
            </div>
        </div>
    );
}

export default Cart;