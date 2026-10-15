# Practical B2: Shopping Cart with Discount (React)

## Features
- Product list supplied through the `products` prop to `src/Cart.jsx`.
- Add products, increase/decrease quantity, and remove cart lines.
- Two-decimal subtotal display.
- Automatic flat discount of 100.00 when subtotal is 1000.00 or more.
- Required `data-testid` values are included.
- Vitest + React Testing Library tests.

> The practical prompt does not define the discount threshold or formula. This project uses a flat 100.00 discount at a subtotal of 1000.00 or more, matching the example `Total: 1000.00`, `Discount: 100.00`, `Grand Total: 900.00`. Change `DISCOUNT_THRESHOLD` and `DISCOUNT_AMOUNT` in `src/Cart.jsx` if your instructor specifies a different rule.

## Run locally
Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open the local URL shown by Vite (usually `http://localhost:5173`).

## Run tests

```bash
npm test
```

## Production build

```bash
npm run build
```

## Component usage

```jsx
import Cart from "./Cart.jsx";

const products = [
  { id: 1, name: "Notebook", price: 120 },
  { id: 2, name: "Backpack", price: 650 }
];

<Cart products={products} />
```

## Required test IDs
- Product add buttons: `add-{id}`
- Cart line quantity: `qty-{id}`
- Increase/decrease/remove buttons: `inc-{id}`, `dec-{id}`, `remove-{id}`
- Empty cart: `cart-empty` with text `Cart is empty`
- Subtotal: `total` with text `Total: 170.00`
- Discount when applicable: `discount` and `grand-total`
