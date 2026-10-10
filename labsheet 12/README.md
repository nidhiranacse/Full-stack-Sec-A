# Labsheet 12 — Full Stack Web Development Solutions

This directory contains solutions for **Labsheet 12**, covering backend security, SQL analytics & concurrency control, advanced React patterns, and Git / CI/CD pipeline automation.

---

## Directory Structure

```text
labsheet 12/
├── problem1/              # Problem 1: Secure Task Manager API
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js    # JWT verification & header bearer token parser
│   │   ├── routes/
│   │   │   ├── auth.js    # User registration & login with bcrypt + JWT
│   │   │   └── tasks.js   # Authenticated CRUD task routes with user scoping
│   │   ├── app.js         # Express application configuration
│   │   ├── server.js      # Server startup entry point
│   │   └── store.js       # In-memory data store with atomic operations
│   ├── package.json
│   └── package-lock.json
│
├── problem2/              # Problem 2: SQL Analytics and Concurrency
│   └── answers.sql        # Window functions, aggregation, and atomic transaction
│
├── problem3/              # Problem 3: React Product Search & Cart
│   ├── src/
│   │   ├── api/
│   │   │   └── fetchProducts.js  # DummyJSON product API caller
│   │   ├── components/
│   │   │   └── Cart.jsx          # Shopping cart slide-out & badge
│   │   ├── context/
│   │   │   └── CartContext.jsx   # Global cart state using React Context API
│   │   ├── hooks/
│   │   │   └── useDebounce.js    # Custom debounce hook for live search
│   │   ├── App.jsx               # Product list, search bar, and cart layout
│   │   ├── index.css             # Styling & responsive design
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── package-lock.json
│
└── problem4/              # Problem 4: Git Disaster Recovery & CI/CD Pipeline
    ├── .github/
    │   └── workflows/
    │       └── ci.yml     # Multi-version matrix test + conditional deploy CI/CD
    └── git-recovery.md    # Step-by-step reflog recovery & branch protection guide
```

---

## Problem Summaries

### Problem 1: Secure Task Manager API
- **Framework**: Express.js with Node.js
- **Authentication**: JWT (`jsonwebtoken`) token signing and verification with Bearer token authentication middleware.
- **Security**: Password hashing with `bcrypt` (salt rounds = 10). Tasks are strictly scoped to the authenticated user ID.
- **Routes**:
  - `POST /auth/register` — Registers new user with hashed password.
  - `POST /auth/login` — Verifies password and returns JWT token.
  - `GET /tasks` — Lists only the logged-in user's tasks.
  - `POST /tasks` — Creates task associated with the logged-in user.
  - `PUT /tasks/:id` — Updates task with ownership validation.
  - `DELETE /tasks/:id` — Deletes task with ownership validation.

### Problem 2: SQL Analytics & Concurrency
- **(a) Top 3 Products by Revenue**: Uses `DENSE_RANK() OVER (PARTITION BY category ORDER BY SUM(price * qty) DESC)` to handle ties cleanly.
- **(b) Consistent Monthly Buyers**: Identifies customers ordering in every month from Jan–Mar 2025 using `COUNT(DISTINCT EXTRACT(MONTH FROM order_date)) = 3`.
- **(c) Race Condition Prevention**: Atomic `UPDATE products SET stock = stock - :qty WHERE id = :product_id AND stock >= :qty` transaction preventing overselling under high concurrency.

### Problem 3: React Product Search & Cart
- **Debounced Search**: Custom `useDebounce` hook (350ms delay) preventing excessive network requests.
- **State Management**: React `CartContext` providing persistent cart state, item increment/decrement, and total price calculation.
- **Data Fetching**: Live search and pagination using DummyJSON API with loading and error boundaries.

### Problem 4: Git Disaster Recovery & CI/CD Pipeline
- **Git Recovery**: Detailed procedure using `git reflog show origin/main` to identify lost commits after an upstream force-push, restoring to a recovery branch, and establishing GitHub Branch Protection rules.
- **CI/CD Pipeline**: GitHub Actions workflow testing across Node versions 18 and 20, executing linting and automated unit tests, and conditionally deploying only on pushes to `main`.
