# 🍔 QuickBite - Mini Food Delivery App

Customers browse the menu, add dishes to a cart and place an order.
The restaurant admin manages menu items and moves each order through its status until it is delivered.

**Stack:** HTML / CSS / vanilla JavaScript (frontend) · Node.js + Express (REST API) · SQLite via `better-sqlite3` (database, saved in `backend/quickbite.db`, so data survives refreshes and restarts).

---

## 1. Project structure

```
quickbite/
├── backend/
│   ├── server.js                  # starts the server
│   ├── app.js                     # Express app (JSON, routes, static frontend, error handler)
│   ├── routes.js                  # URL -> controller mapping
│   ├── db.js                      # SQLite connection, tables, seed data
│   ├── validators.js              # input validation helpers
│   ├── controllers/
│   │   ├── itemController.js      # menu item CRUD
│   │   └── orderController.js     # place order, list, status/cancel rules
│   ├── test/api.test.js           # automated API tests (npm test)
│   └── package.json
├── frontend/
│   ├── index.html                 # single page: Menu / My Orders / Admin
│   ├── css/style.css
│   └── js/
│       ├── api.js                 # ALL fetch() calls live here
│       └── app.js                 # UI logic (menu, cart, checkout, orders, admin)
├── docs/QuickBite.postman_collection.json   # import into Postman
└── README.md
```

## 2. Setup

Requirements: **Node.js 18 or newer** (https://nodejs.org).

```bash
cd backend
npm install
npm start
```

Open **http://localhost:3000** - the Express server also serves the frontend, so there is
nothing else to start. On the first run 13 sample dishes are added automatically
(two of them are "Unavailable" so you can see that behaviour).

Optional: `PORT=4000 npm start` (Linux/macOS) or `set PORT=4000 && npm start` (Windows CMD) to change the port.
To reset all data, stop the server and delete `backend/quickbite.db`.

Run the automated tests (in-memory DB, does not touch your data):

```bash
npm test
```

## 3. API reference

Base URL: `http://localhost:3000`. All bodies are JSON.
Errors always look like `{ "error": "message", "details": ["..."] }` (`details` only for validation).

| Method | Endpoint | Purpose | Success | Errors |
|---|---|---|---|---|
| GET | `/api/items` | List menu items. Optional `?search=name` (partial, case-insensitive) and `?category=` (case-insensitive) | 200 | - |
| POST | `/api/items` | Add item (admin) | 201 | 400 |
| PUT | `/api/items/:id` | Update item (admin). Fields you omit keep their old value | 200 | 400, 404 |
| DELETE | `/api/items/:id` | Delete item (admin) | 200 | 404 |
| POST | `/api/orders` | Place an order | 201 | 400 |
| GET | `/api/orders` | List all orders, latest first | 200 | - |
| PATCH | `/api/orders/:id/status` | Move the order forward **or** cancel it | 200 | 400, 404 |

Unknown `/api/...` URLs return 404, invalid JSON returns 400, and unexpected failures return 500.

### Examples

**POST /api/items**
```json
{ "name": "Paneer Tikka", "price": 180, "category": "Starters", "isAvailable": true }
```
→ `201` `{ "id": 14, "name": "Paneer Tikka", "price": 180, "category": "Starters", "isAvailable": true }`

**POST /api/orders** (only `itemId` and `qty` are needed; any price sent by the client is ignored)
```json
{
  "customerName": "Asha Verma",
  "phone": "9876543210",
  "address": "12 MG Road, Jaipur",
  "items": [ { "itemId": 1, "qty": 2 }, { "itemId": 4, "qty": 1 } ]
}
```
→ `201`
```json
{
  "id": 1, "customerName": "Asha Verma", "phone": "9876543210", "address": "12 MG Road, Jaipur",
  "items": [ { "itemId": 1, "name": "Paneer Tikka", "price": 180, "qty": 2 },
             { "itemId": 4, "name": "Butter Chicken", "price": 320, "qty": 1 } ],
  "totalAmount": 680, "status": "Placed", "createdAt": "2026-10-15T10:30:00.000Z"
}
```

**PATCH /api/orders/1/status**
```json
{ "status": "Preparing" }
```

## 4. Database schema

**MenuItem** (`menu_items`)

| Field | Type | Notes |
|---|---|---|
| id | integer | auto-increment primary key |
| name | text | required |
| price | number | required, must be > 0 |
| category | text | defaults to "Main Course" |
| isAvailable | boolean | default true; unavailable items cannot be ordered |

**Order** (`orders`)

| Field | Type | Notes |
|---|---|---|
| id | integer | auto-increment primary key |
| customerName | text | required |
| phone | text | required, exactly 10 digits |
| address | text | required |
| items | array | each entry `{ itemId, name, price, qty }` - a snapshot of name/price at order time (stored as JSON) |
| totalAmount | number | calculated on the server from current DB prices |
| status | text | Placed, Preparing, Out for Delivery, Delivered, Cancelled |
| createdAt | date | set automatically (ISO string) |

## 5. Business rules implemented

- Item `name` and `price` are mandatory; price must be a positive number.
- An order needs at least one item and every `qty` must be a whole number ≥ 1 (duplicate lines for the same item are merged).
- If any item in the order is unavailable or does not exist, the **whole order is rejected** with `400` and a message such as
  `Cannot place order: "Mango Lassi" is currently unavailable`.
- `totalAmount` is **always recalculated by the server**; client-sent prices/totals are ignored.
- Status moves **one step forward at a time**: Placed → Preparing → Out for Delivery → Delivered.
  Skipping a step, going backwards or repeating the same status returns `400`.
- An order can be cancelled **only while it is `Placed`**. Delivered and Cancelled orders are locked.
- Status codes used: 200, 201, 400, 404, 500.

## 6. Frontend features

- **Menu:** cards with name, price, category; "Add to Cart" is disabled for unavailable items; search box and category filter (both call the API).
- **Cart:** + / − quantity, remove, running total (saved in the browser so it survives a refresh).
- **Checkout:** name, 10-digit phone and address with client-side validation and inline error messages.
- **My Orders:** colour-coded status badges (Placed = blue, Preparing = orange, Out for Delivery = purple, Delivered = green, Cancelled = red) and a Cancel button that appears only while the order is *Placed*.
- **Admin:** add / edit / delete menu items, and "Mark as …" buttons to advance each order's status.
- Success and error messages appear as toast notifications. All dynamic text is HTML-escaped.

## 7. Testing with Postman

1. Start the server, then in Postman choose **Import** → `docs/QuickBite.postman_collection.json`.
2. Run the requests from top to bottom (each has a small test script that checks the status code).
3. Take screenshots of at least 3 requests, e.g. `POST /api/orders` (201), `GET /api/items?search=paneer` (200) and `PATCH /api/orders/:id/status` (200 and the 400 cancel-after-preparing case).

Quick check without Postman:
```bash
curl "http://localhost:3000/api/items?category=Drinks"
curl -X POST http://localhost:3000/api/orders -H "Content-Type: application/json" \
  -d '{"customerName":"Asha","phone":"9876543210","address":"Jaipur","items":[{"itemId":1,"qty":2}]}'
```

## 8. Submission checklist

- [ ] `backend/` and `frontend/` folders (do **not** include `node_modules`)
- [ ] This README
- [ ] Screenshots: menu, cart, orders page (and admin page)
- [ ] Postman screenshots (≥ 3 endpoints)

## 9. Notes / limitations

- The admin section has no login (not required by the lab). In a real app the `/api/items` write routes and status updates would need authentication.
- "My Orders" lists every order because the lab asks for `GET /api/orders` to return all orders.
