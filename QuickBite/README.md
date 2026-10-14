# QuickBite — Mini Food Delivery App

A full-stack food delivery application built for the B.Tech Full Stack Development Lab.

## Features

### Customer
- Browse the food menu.
- Search items and filter by category.
- Add items to a cart and change quantities.
- Checkout with name, phone number and delivery address.
- View order history and cancel eligible orders.

### Restaurant Admin
- Add, edit and delete menu items.
- Manage food availability.
- View orders and advance their status.

### Backend
- REST APIs built with Express.
- SQLite database for persistent menu and order records.
- Server-side price calculation.
- Input validation and order-status rules.

## Technology Stack

- React and Vite
- Node.js and Express
- SQLite and better-sqlite3
- Fetch API
- CSS

## Project Structure

```text
QuickBite/
├── backend/
│   ├── routes/
│   │   ├── items.js
│   │   └── orders.js
│   ├── database.js
│   ├── server.js
│   ├── package.json
│   └── quickbite.db
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   └── package.json
└── README.md
```

## Installation and Setup

Requirements: Node.js and npm.

### 1. Start the backend

```bash
cd backend
npm install
npm run dev
```

The backend runs at `http://localhost:5000`.

The SQLite database file is created automatically when the backend starts.

### 2. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/items` | List menu items |
| GET | `/api/items?search=pizza` | Search menu items |
| GET | `/api/items?category=Drinks` | Filter by category |
| POST | `/api/items` | Create a menu item |
| PUT | `/api/items/:id` | Update a menu item |
| DELETE | `/api/items/:id` | Delete a menu item |
| POST | `/api/orders` | Place an order |
| GET | `/api/orders` | List orders, newest first |
| PATCH | `/api/orders/:id/status` | Advance or cancel an order |

## Order Status Rules

Valid forward progression:

`Placed → Preparing → Out for Delivery → Delivered`

An order can be cancelled only while its status is `Placed`.

The server calculates order totals from the current menu prices and rejects nonexistent or unavailable items.

## Database

SQLite stores menu items and orders in `backend/quickbite.db`. Menu items and orders persist across browser refreshes and server restarts.

## Testing

Test the REST APIs using curl or Postman. Verify successful requests, invalid prices, unavailable items, server-calculated totals, status progression and cancellation rules.

## Limitations

This is a lab project. Admin APIs do not currently have authentication or authorization, so the application should not be exposed publicly without additional security controls.

## Author

Srashti Chauhan

B.Tech — Computer Science and Engineering
