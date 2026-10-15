# BTCS303T Full Stack Development &mdash; Coding Assessment (Lab Sheet 12)

**Course:** Full Stack Development (BTCS303T)  
**Academic Level:** B.Tech. 3rd Year  
**Student Name:** Rahul Raj  
**Roll / Student ID:** cu24250116  
**Section:** Sec-A  
**Submission Tag:** LABSHEET 12  

---

## 📌 Executive Summary

This repository contains the complete, rigorous solutions for all four problems in the **BTCS303T Full Stack Development Coding Assessment**:

1. **Problem 1 (Node.js + Express REST API):** High-security Task Manager API implementing in-memory storage, salted bcrypt password hashing, 15-minute JWT expiration, sliding 1-minute window login rate-limiting (`429 Too Many Requests` with `Retry-After` header), reusable authentication middleware, and strict cross-user data isolation with admin overrides.
2. **Problem 2 (SQL Analytics & Concurrency):** Analytical window function queries using `DENSE_RANK()` for category revenue ranking with ties, customer grouping over continuous monthly horizons (Jan&ndash;Mar 2025), and atomic inventory deduction transactions preventing overselling race conditions (TOCTOU mitigation).
3. **Problem 3 (React Product Search with Cart):** Single Page Application featuring 300ms debounced live search, `AbortController` cancellation to eliminate stale asynchronous response races, pagination with auto-reset, cart state management using `useReducer` and React Context (zero prop drilling), `localStorage` persistence, and 100% adherence to required automated `data-testid` test hooks.
4. **Problem 4 (Git & CI/CD Pipeline):** Multi-matrix GitHub Actions workflow (`.github/workflows/ci.yml`) supporting Node.js 18 & 20 with npm caching, sequential lint-and-test stages, conditional push-only deployment, and forensic Git disaster recovery instructions (`git reflog` branch recovery) paired with branch protection policies.

---

## 🏗 System Architecture & Technology Stack

| Component | Technology | Purpose |
|---|---|---|
| **API Server** | Node.js v24 + Express 4 | High-throughput REST API server with structured routing and error handling |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) + `bcrypt` | 15-minute expiring signed tokens and salted password hashing (10 salt rounds) |
| **Protection** | In-Memory Sliding Window Rate Limiter | Blocks brute-force after 5 failed attempts/min per email; returns `Retry-After` |
| **Frontend SPA** | React 18 + Vite | Modern single-page client with debouncing, AbortController, and responsive layout |
| **Client State** | `useReducer` + React Context | Predictable state container with actions (`ADD`, `INC`, `DEC`, `REMOVE`, `CLEAR`) |
| **Client Storage** | Browser `localStorage` API | Transparent cart persistence across page reloads using lazy state initialization |
| **Database** | Relational SQL (`node:sqlite` verified) | Window functions (`DENSE_RANK`), aggregate monthly grouping, and atomic updates |
| **DevOps / CI** | GitHub Actions | Automated lint, matrix testing on Node 18 & 20, and conditional deployment |

---

## 🚀 Problem 1: Secure Task Manager API

### Endpoint Specification & Status Codes

| Endpoint | Method | Request Payload | Success | Error Codes | Description |
|---|---|---|---|---|---|
| `/auth/register` | `POST` | `{ email, password, role? }` | `201 Created` | `400`, `409` | Hashes password with bcrypt. Default role is `"user"`, optional `"admin"`. Rejects duplicates with 409. |
| `/auth/login` | `POST` | `{ email, password }` | `200 OK` | `401`, `429` | Validates credentials; returns `{ token }` valid for 15 minutes. Rate limits at 5 failed attempts/min per email. |
| `/tasks` | `POST` | `{ title, status }` | `201 Created` | `400`, `401` | Creates new task assigned to authenticated user. Status must be `"todo"`, `"doing"`, or `"done"`. |
| `/tasks` | `GET` | Query: `status`, `page`, `limit` | `200 OK` | `401` | Returns caller's tasks as `{ data, page, total }`. Enforces strict isolation between users. |
| `/tasks/:id` | `PATCH` | `{ title?, status? }` | `200 OK` | `400`, `401`, `403`, `404` | Partial update of task. Restricted to task owner or users with `"admin"` role. |
| `/tasks/:id` | `DELETE` | None | `204 No Content` | `401`, `403`, `404` | Deletes task. Restricted to task owner or users with `"admin"` role. |

### Hard Requirements Implemented
1. **Login Rate Limiting:** Failed attempts are tracked per normalized email with precise millisecond timestamps. When &ge; 5 failed attempts occur within 60 seconds, subsequent requests immediately return `429 Too Many Requests` alongside a calculated `Retry-After` header without evaluating the password. The sliding counter resets automatically after 60 seconds.
2. **Safe Token Handling:** All bearer tokens are parsed inside a resilient try-catch wrapper in `authenticateToken`. Missing, malformed, or expired tokens cleanly return `401 Unauthorized` and never cause unhandled server crashes.
3. **Data Isolation:** User A can never query, read, update, or delete User B's tasks (`403 Forbidden`). Admin users possess authorized override capabilities across all tasks.
4. **Exported Express Instance:** `server.js` exports `app` directly for seamless test runner imports while automatically listening on port 3000 when executed directly.

---

## 📊 Problem 2: SQL Analytics and Concurrency

Complete SQL scripts are preserved in [`answers.sql`](./answers.sql) and validated via [`test_sql.js`](./test_sql.js).

### Part (a): Top 3 Products by Revenue per Category (with DENSE_RANK Ties)
```sql
WITH product_sales AS (
    SELECT 
        p.id AS product_id,
        p.name AS product_name,
        p.category,
        p.price,
        COALESCE(SUM(oi.qty), 0) AS total_quantity_sold,
        (p.price * COALESCE(SUM(oi.qty), 0)) AS revenue,
        DENSE_RANK() OVER (
            PARTITION BY p.category 
            ORDER BY (p.price * COALESCE(SUM(oi.qty), 0)) DESC
        ) AS category_revenue_rank
    FROM products p
    JOIN order_items oi ON p.id = oi.product_id
    GROUP BY p.id, p.name, p.category, p.price
)
SELECT 
    category,
    product_id,
    product_name,
    price,
    total_quantity_sold,
    revenue,
    category_revenue_rank
FROM product_sales
WHERE category_revenue_rank <= 3
ORDER BY category ASC, category_revenue_rank ASC, revenue DESC;
```

### Part (b): Customers with Orders Every Month (January &ndash; March 2025)
```sql
SELECT 
    c.id AS customer_id,
    c.name AS customer_name,
    c.city
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE o.order_date >= '2025-01-01' 
  AND o.order_date < '2025-04-01'
GROUP BY c.id, c.name, c.city
HAVING COUNT(DISTINCT strftime('%Y-%m', o.order_date)) = 3;
```

### Part (c): Concurrency-Safe Order Transaction & TOCTOU Hazard
```sql
BEGIN TRANSACTION;

-- Step 1: Atomic update with conditional stock guard
UPDATE products 
SET stock = stock - :qty
WHERE id = :product_id 
  AND stock >= :qty;

-- Application checks affected rows: if 0, ROLLBACK and throw insufficient stock error.
-- Step 2: Insert order and order line records
INSERT INTO orders (id, customer_id, order_date)
VALUES (:order_id, :customer_id, CURRENT_TIMESTAMP);

INSERT INTO order_items (order_id, product_id, qty)
VALUES (:order_id, :product_id, :qty);

COMMIT;
```

**Technical Explanation of Concurrency Vulnerability:**  
A plain `SELECT` followed by an `UPDATE` is unsafe because it introduces a **Time-of-Check to Time-of-Use (TOCTOU)** race condition. When multiple concurrent requests read available stock at the same time, both observe sufficient inventory before either can write changes. Both subsequently issue decrements, causing inventory to drop below zero (overselling) and leaving the database in an inconsistent state.

---

## 💻 Problem 3: React Product Search with Cart

The frontend client is implemented in `frontend/` with Vite and React 18.

### Architecture Highlights
- **Debounced Fetching:** User input triggers search requests only after a 300ms pause using `useEffect` and `setTimeout` cleanup.
- **Stale Response Cancellation (`AbortController`):** Every new fetch instantiates an `AbortController` and signals the previous in-flight request to abort. Asynchronous responses resolving out-of-order can never overwrite fresher data.
- **Zero Prop Drilling State Management:** All cart interactions are routed through `CartContext` backed by `useReducer`.
- **LocalStorage Persistence:** The cart state initializes lazily from `localStorage` and serializes state mutations automatically.
- **All Required `data-testid` Hooks Implemented:**
  - `data-testid="search-input"` &mdash; Search input box
  - `data-testid="product-item"` &mdash; Product cards in search results
  - `data-testid="add-btn"` &mdash; Add to cart button on cards
  - `data-testid="next-btn"` &mdash; Next pagination button
  - `data-testid="cart-total"` &mdash; Current shopping cart total display

---

## 🛠 Problem 4: Git and CI/CD Pipeline

Complete explanations and workflow configurations are provided in:
- [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)
- [`GIT_CICD_SOLUTIONS.md`](./GIT_CICD_SOLUTIONS.md)

### Key Recovery Commands
```bash
# 1. Locate lost commit SHA before the force push
git reflog show origin/main

# 2. Recreate recovery branch pointing to the lost commit
git branch recovery-branch <lost-commit-sha>

# 3. Safely integrate into local main and push to remote
git checkout main
git pull origin main
git merge recovery-branch -m "fix: restore missing commits after accidental force push"
git push origin main
```

**Prevention Mechanism:** Enable **GitHub Branch Protection Rules** on `main`, ensuring **"Do not allow force pushes"** is enforced and requiring status checks and Pull Request approvals before merging.

---

## 🧪 Verification & Automated Test Results

### 1. Backend REST API Tests (16/16 Passed)
```bash
cd backend
npm test
```
```text
▶ Problem 1: Secure Task Manager API Test Suite
  ▶ POST /auth/register (4 tests passed)
  ▶ POST /auth/login and Rate Limiting (4 tests passed)
  ▶ Token Handling Hard Requirements (3 tests passed)
  ▶ Tasks CRUD and Hard Requirement Isolation (5 tests passed)
✔ Problem 1: Secure Task Manager API Test Suite
ℹ tests 16 | suites 5 | pass 16 | fail 0
```

### 2. SQL Analytics Verification
```bash
node test_sql.js
```
```text
✓ Test dataset populated successfully.
✓ Part (a) DENSE_RANK() Top 3 per category verified.
✓ Part (b) Jan-Mar 2025 monthly continuity verified.
✓ Part (c) Atomic inventory decrement & rollback verified.
```

---
*Submitted for BTCS303T Full Stack Laboratory Evaluation by Rahul Raj (cu24250116).*
