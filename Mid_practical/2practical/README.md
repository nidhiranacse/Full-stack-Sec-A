# Practical B2: Shopping Cart with Discount (React)

**Marks:** 5  
**Aim:** To build a React shopping cart that manages item quantities, calculates the total, and applies a discount automatically.

---

## 🛠️ Tech Stack
- **React 19**
- **Vite** (Build tool & development server)
- **Vitest & React Testing Library** (Automated component testing)
- **Vanilla CSS** (Polished design system with responsive layout and glassmorphism)

---

## 📋 Required Elements & `data-testid` Checklist

| Requirement | `data-testid` | Example Content / Behavior |
| :--- | :--- | :--- |
| Product Add Button | `add-{id}` | `<button data-testid="add-1">Add to Cart</button>` |
| Cart Line Quantity | `qty-{id}` | `<span data-testid="qty-1">1</span>` |
| Cart Line Increase | `inc-{id}` | `<button data-testid="inc-1">+</button>` |
| Cart Line Decrease | `dec-{id}` | `<button data-testid="dec-1">-</button>` (removes if quantity reaches 0) |
| Cart Line Remove | `remove-{id}` | `<button data-testid="remove-1">Remove</button>` |
| Empty Cart State | `cart-empty` | Text must be exactly `Cart is empty` |
| Subtotal / Total | `total` | Exact format: `Total: 170.00` (two decimal places) |
| Discount Amount | `discount` | Displayed only when total ≥ 1000: `Discount: 100.00` |
| Grand Total | `grand-total` | Displayed only when total ≥ 1000: `Grand Total: 900.00` |

---

## 🚀 How to Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open the provided local URL (typically `http://localhost:5173`) in your browser to view and interact with the shopping cart.

### 3. Run Automated Tests
```bash
npm test
```
Executes all 9 unit and integration tests verifying all `data-testid` hooks, user interactions, and calculation formulas.
