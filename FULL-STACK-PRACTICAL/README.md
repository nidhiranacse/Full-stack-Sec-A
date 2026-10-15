# Full Stack Development Lab - Practical Test (SET B Solutions)

This repository contains the complete, verified, and test-covered solutions for **SET B** from the Full Stack Development Lab Practical Test.

---

## Table of Contents
1. [Practical B1: JWT Authentication API (Node.js and Express)](#practical-b1-jwt-authentication-api-nodejs-and-express)
   - [Aim & Problem Statement](#b1-aim--problem-statement)
   - [API Endpoint Specification](#b1-api-endpoint-specification)
   - [Implementation Details (`server.js`)](#b1-implementation-details)
   - [How to Run and Test](#b1-how-to-run-and-test)
   - [Manual Testing with cURL](#b1-manual-testing-with-curl)
2. [Practical B2: Shopping Cart with Discount (React)](#practical-b2-shopping-cart-with-discount-react)
   - [Aim & Problem Statement](#b2-aim--problem-statement)
   - [Component Specification (`src/Cart.jsx`)](#b2-component-specification)
   - [Required `data-testid` Elements Reference Table](#b2-required-data-testid-elements-reference-table)
   - [Discount & Quantity Logic](#b2-discount--quantity-logic)
   - [How to Run and Test](#b2-how-to-run-and-test)
3. [Viva Voce Questions & Answers (Set B)](#viva-voce-questions--answers-set-b)

---

## Practical B1: JWT Authentication API (Node.js and Express)

### B1: Aim & Problem Statement
- **Aim:** To implement user registration, login and a protected route using JSON Web Tokens in an Express application.
- **Problem Statement:** Implement a service where users register with a username and password, log in to receive a token, and then use the token to access a protected profile route.

### B1: API Endpoint Specification

| Method | Endpoint | Headers | Request Body | Status Code & Response |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/register` | `Content-Type: application/json` | `{ "username": "alice", "password": "password123" }` | **201 Created**:<br>`{ "message": "User registered" }`<br><br>**400 Bad Request** (missing/empty username, or password < 6 chars):<br>`{ "error": "Invalid input" }`<br><br>**409 Conflict** (duplicate username):<br>`{ "error": "Username already exists" }` |
| **POST** | `/login` | `Content-Type: application/json` | `{ "username": "alice", "password": "password123" }` | **200 OK**:<br>`{ "token": "<jwt>" }`<br>*(Payload contains `username`, expires in 1 hour)*<br><br>**401 Unauthorized** (unknown user or wrong password):<br>`{ "error": "Invalid credentials" }` |
| **GET** | `/profile` | `Authorization: Bearer <token>` | *None* | **200 OK**:<br>`{ "username": "alice" }`<br><br>**401 Unauthorized** (header missing, malformed token, invalid signature, or expired token):<br>`{ "error": "Unauthorized" }` |

### B1: Implementation Details
The server is implemented in [`server.js`](server.js):
- In-memory array `users = []` stores user credentials.
- `jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' })` issues tokens with 1-hour validity.
- Bearer token parsing and `jwt.verify(token, JWT_SECRET)` guard the `/profile` route.

### B1: How to Run and Test
1. **Start the Server:**
   ```bash
   node server.js
   ```
2. **Run Automated Test Suite (12/12 Tests):**
   ```bash
   node test-b1.js
   ```

### B1: Manual Testing with cURL

#### 1. Register a valid user
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"alice\", \"password\": \"password123\"}"
# Response: 201 {"message":"User registered"}
```

#### 2. Register with invalid input (password < 6 characters)
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"alice\", \"password\": \"123\"}"
# Response: 400 {"error":"Invalid input"}
```

#### 3. Register duplicate user
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"alice\", \"password\": \"password123\"}"
# Response: 409 {"error":"Username already exists"}
```

#### 4. Login with invalid credentials
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"alice\", \"password\": \"wrongpass\"}"
# Response: 401 {"error":"Invalid credentials"}
```

#### 5. Login successfully
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"alice\", \"password\": \"password123\"}"
# Response: 200 {"token":"eyJhbGciOiJIUzI1NiIsIn..."}
```

#### 6. Access protected profile route
```bash
curl -X GET http://localhost:3000/profile \
  -H "Authorization: Bearer <PASTE_TOKEN_HERE>"
# Response: 200 {"username":"alice"}
```

#### 7. Access profile route without header or invalid token
```bash
curl -X GET http://localhost:3000/profile
# Response: 401 {"error":"Unauthorized"}
```

---

## Practical B2: Shopping Cart with Discount (React)

### B2: Aim & Problem Statement
- **Aim:** To build a React shopping cart that manages item quantities, calculates the total and applies a discount automatically.
- **Problem Statement:** Build a React Cart component (default export from `src/Cart.jsx`) that receives a prop `products`, an array of `{ id, name, price }`. The user can add products to the cart, change quantities, remove lines and see the total with an automatic discount.

### B2: Required `data-testid` Elements Reference Table

| Requirement / Description | Required `data-testid` | Example Value / Format | Condition |
| :--- | :--- | :--- | :--- |
| Add button for each product | `add-{id}` | `<button data-testid="add-1">` | Rendered for each item in `products` prop |
| Empty cart indicator | `cart-empty` | `<div data-testid="cart-empty">Cart is empty</div>` | Rendered when `cart.length === 0` |
| Quantity text for each cart line | `qty-{id}` | `<span data-testid="qty-1">2</span>` | Rendered for each item currently in cart |
| Increase quantity button | `inc-{id}` | `<button data-testid="inc-1">+</button>` | Increments quantity by 1 |
| Decrease quantity button | `dec-{id}` | `<button data-testid="dec-1">-</button>` | Decrements quantity by 1 (removes if reaches 0) |
| Remove line button | `remove-{id}` | `<button data-testid="remove-1">Remove</button>` | Removes line completely from cart |
| Total price | `total` | `Total: 170.00` | Format: `Total: ${total.toFixed(2)}` |
| Discount amount | `discount` | `Discount: 100.00` | Rendered **only when applicable** (Total $\ge$ 1000.00) |
| Grand total | `grand-total` | `Grand Total: 900.00` | Rendered **only when applicable** (Total $\ge$ 1000.00) |

### B2: Discount & Quantity Logic
1. **Total calculation:**
   $$\text{Total} = \sum (\text{item.price} \times \text{item.quantity})$$
2. **Automatic Discount:**
   - When Total is below threshold (e.g., `Total: 170.00`), no discount is applied and the elements `discount` and `grand-total` are **not rendered**.
   - When Total reaches or exceeds the threshold (e.g., Total $\ge$ 1000.00):
     $$\text{Discount} = \text{Total} \times 0.10$$
     $$\text{Grand Total} = \text{Total} - \text{Discount}$$
     - Example: If Total is `1000.00`, Discount is `100.00`, and Grand Total is `900.00`.
3. **Quantity controls:**
   - Clicking `inc-{id}` increases quantity by 1.
   - Clicking `dec-{id}` decreases quantity by 1. If quantity reaches 0, the item is removed from the cart.
   - Clicking `remove-{id}` immediately deletes the cart line regardless of quantity.

### B2: How to Run and Test
1. **Start the Vite Development Server:**
   ```bash
   npm run dev:b2
   ```
   Open `http://localhost:5173` in your browser to interact with the shopping cart demo.
2. **Build for Production:**
   ```bash
   npm run build:b2
   ```

---

## Viva Voce Questions & Answers (Set B)

### Q1: What is a JSON Web Token (JWT) and what are its 3 parts?
**Answer:** A JWT is a compact, URL-safe means of representing claims to be transferred between two parties. Its 3 parts separated by dots (`.`) are:
1. **Header:** Contains the token type (`JWT`) and signing algorithm (e.g. `HS256`).
2. **Payload:** Contains claims such as user identity (`username`) and expiration (`exp`).
3. **Signature:** Generated by signing base64Url(Header) + base64Url(Payload) with a server secret key.

### Q2: Why are HTTP status codes 400, 401, and 409 used in Practical B1?
**Answer:**
- **400 Bad Request:** Returned when user input fails validation (missing username or password < 6 chars).
- **401 Unauthorized:** Returned when authentication fails (wrong password, unknown user, invalid/missing/expired token).
- **409 Conflict:** Returned when a resource conflict occurs (username already taken).

### Q3: How is state managed in the React Cart component?
**Answer:** Using the `useState` hook (`const [cart, setCart] = useState([])`). Derived values like `total`, `discount`, and `grandTotal` are computed dynamically on each render from the cart state without storing redundant state.

### Q4: Why is conditional rendering used for the discount element?
**Answer:** As specified in the requirements, discount elements must only appear when a discount is applicable (`discount > 0`). In React, this is achieved using conditional rendering: `{isDiscountApplicable && <div data-testid="discount">...</div>}`.
