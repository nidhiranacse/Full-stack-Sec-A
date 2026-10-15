# Lab Sheet 12: Full Stack Comprehensive Assessment (4 Engineering Problems)

**Student Name:** Pulkit Goyal  
**CUID:** CU24250263  
**Roll Number:** 40  
**Section:** A  
**Course:** Full Stack Web Development (B.Tech CSE)  

---

## 1. Overview & Problem Statements

### Problem 1: REST API with JWT Authentication (`problem1-jwt-task-api`)
- Secure token-based task management backend in Express.js.
- Endpoints:
  - `POST /auth/register` (user registration & password hashing)
  - `POST /auth/login` (issue signed JSON Web Token)
  - `GET /tasks` (fetch authenticated user's tasks with status filter)
  - `POST /tasks` (create task attached to `req.user.id`)
  - `PUT /tasks/:id` & `DELETE /tasks/:id` (strictly scoped to task owner).
- Middleware: `auth.js` verifying `Authorization: Bearer <token>`.

### Problem 2: Relational SQL Mastery & Optimization (`problem2-database-sql`)
- Comprehensive SQL queries including:
  1. Multi-table inner/outer joins for customer order reporting.
  2. Aggregate grouping (`GROUP BY`, `HAVING`) for department analytics.
  3. Window functions (`ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`) for top performers.
  4. B-Tree index optimization scripts for sub-millisecond query execution.

### Problem 3: React Search Debouncing & Cart Reducer (`problem3-react-debounced-cart`)
- Custom React hook `useDebounce` reducing API request thrashing during fast keystrokes.
- State management utilizing `useReducer` for complex transactional shopping cart actions (`ADD_ITEM`, `REMOVE_ITEM`, `UPDATE_QTY`, `APPLY_DISCOUNT`).

### Problem 4: Git Disaster Recovery & GitHub Actions CI (`problem4-git-devops`)
- Step-by-step resolution walkthrough for corrupted merge conflicts, detached HEAD states, and recovering accidentally deleted commits using `git reflog`.
- Complete continuous integration YAML pipeline (`ci.yml`) validating node test suites, linter checks, and automated build verification.

---

## 2. Directory Structure
```
09-Lab-12-FullStack-Assessment/
├── README.md                          # Master assessment guide & viva answers
├── problem1-jwt-task-api/             # Express JWT API
│   ├── package.json
│   ├── server.js
│   └── src/
│       ├── app.js
│       ├── store.js
│       ├── middleware/auth.js
│       └── routes/
│           ├── auth.js
│           └── tasks.js
├── problem2-database-sql/             # Relational SQL solutions
│   ├── schema.sql
│   └── answers.sql
├── problem3-react-debounced-cart/     # Optimized React search & cart
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── components/Cart.jsx
│       ├── context/CartContext.jsx
│       ├── hooks/useDebounce.js
│       └── api/fetchProducts.js
└── problem4-git-devops/               # DevOps & Git recovery
    ├── git-recovery.md
    └── .github/workflows/ci.yml
```

---

## 3. Key Concepts & Viva Answers (For Self-Demonstration)

### Q1: How does JWT Authentication work without server session storage?
- JWT tokens are cryptographically signed. The token payload contains the user's ID and expiry timestamp. Because the signature can be verified mathematically using the secret key on any server instance, the backend does not need to query a session database on every request, making it stateless and horizontally scalable.

### Q2: What is debouncing in frontend search inputs?
- Debouncing delays the execution of a function until after a specific duration has elapsed since the user last pressed a key. Without debouncing, typing "laptop" (6 letters) triggers 6 simultaneous network requests. With a 300ms debounce, only 1 request is fired after typing pauses.

### Q3: What is the purpose of `git reflog`?
- Unlike `git log`, which only records the history of the current branch, `git reflog` records every update to references in the local repository (including commits from deleted branches, hard resets, and rebases). It acts as an emergency safety net to recover lost commits.
