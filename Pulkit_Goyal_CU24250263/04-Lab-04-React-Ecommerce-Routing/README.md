# Lab Sheet 4: React Router DOM & Global State with Context API (E-Commerce Store)

**Student Name:** Pulkit Goyal  
**CUID:** CU24250263  
**Roll Number:** 40  
**Section:** A  
**Course:** Full Stack Web Development (B.Tech CSE)  

---

## 1. Objective & Lab Questions
1. Implement client-side routing in React using **`react-router-dom`** (`createBrowserRouter` / `<BrowserRouter>`, `<Routes>`, `<Route>`, `<Link>`, `NavLink`, `useParams`, `useNavigate`).
2. Build an e-commerce catalog featuring:
   - **Home Page:** Hero banner with featured products and student information.
   - **Products Catalog:** Filterable list with category selection and search.
   - **Dynamic Product Details (`/products/:id`):** Route params extraction via `useParams()`, stock status, and quantity selection.
   - **Cart Page (`/cart`):** Full itemized cart, quantity increment/decrement, tax/total calculation, and checkout simulation.
   - **404 Not Found Page (`*`):** Friendly catch-all route with a return button.
3. Manage global cart state without prop drilling using **React Context API** (`createContext`, `useContext`, custom `useCart` hook).

---

## 2. Component & Routing Architecture
```
App (wrapped by BrowserRouter & CartProvider)
├── Navbar (sticky header, brand, NavLinks, live cart item badge)
└── Routes
    ├── Route path="/"                --> Home (featured highlights)
    ├── Route path="/products"        --> Products (catalog & search)
    ├── Route path="/products/:id"    --> ProductDetails (dynamic route params)
    ├── Route path="/cart"            --> CartPage (checkout & totals)
    └── Route path="*"                --> NotFound (404 fallback)
```

---

## 3. How to Run Locally
```bash
# 1. Navigate to directory
cd 04-Lab-04-React-Ecommerce-Routing

# 2. Install dependencies (including react-router-dom)
npm install

# 3. Start development server
npm run dev
```
Open `http://localhost:5173`.

---

## 4. Key Concepts & Viva Answers (For Self-Demonstration)

### Q1: What is the difference between client-side routing and traditional server-side routing?
- Traditional server routing requests a brand new HTML document from the server on every link click, causing full page reloads and white flashes.
- Client-side routing with `react-router-dom` intercepts URL changes via the browser's HTML5 History API (`pushState`), swaps component trees dynamically, and preserves existing client state with instantaneous page transitions.

### Q2: What problem does React Context solve over Props Drilling?
- Prop drilling requires passing props through multiple intermediary components that do not need the data themselves, merely to reach deeply nested children.
- React Context creates a broadcast channel accessible anywhere in the component tree via `useContext(CartContext)`.

### Q3: How do dynamic route parameters work in React Router?
- Defined in the route pattern using a colon: `<Route path="/products/:id" element={<ProductDetails />} />`.
- Inside the component, calling `const { id } = useParams()` extracts the parameter from the current URL path.
