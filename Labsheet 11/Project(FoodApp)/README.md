# QuickBite — Mini Food Delivery App

## 1. Project Overview
QuickBite is a mini food delivery web application developed using React, Node.js, Express.js and MongoDB. Customers can browse menu items, search dishes, add items to a cart, place orders and view order status. The admin interface supports menu management and order-status updates.

## 2. Technologies Used
- Frontend: React, Vite, Axios, CSS
- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- Middleware: CORS, Helmet, dotenv
- API testing: Thunder Client

## 3. Project Structure
```text
Project(FoodApp)/
├── backend/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   ├── package.json
│   └── index.html
├── .gitignore
└── README.md
```

## 4. Backend Setup
Open a terminal in the backend directory:

```bash
npm install
```

Create a `.env` file in `backend/` containing:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/quickbite
```

Ensure MongoDB is running, then start the backend:

```bash
npm run dev
```

Backend URL: `http://localhost:5000`

## 5. Frontend Setup
Open another terminal in the frontend directory:

```bash
npm install
npm run dev
```

Open the local URL displayed by Vite, usually `http://localhost:5173`.

## 6. API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/items` | Get menu items |
| POST | `/api/items` | Add menu item |
| PUT | `/api/items/:id` | Update menu item |
| DELETE | `/api/items/:id` | Delete menu item |
| POST | `/api/orders` | Place an order |
| GET | `/api/orders` | View orders, newest first |
| PATCH | `/api/orders/:id/status` | Update order status |

Menu filtering supports `?search=name` and `?category=category`.

## 7. Main Features
- Menu display, search and category filtering
- Availability checking
- Shopping cart with quantity controls
- Customer checkout and input validation
- Server-side order total calculation
- Order history and status badges
- Menu item creation, editing and deletion
- Order status progression and cancellation
- MongoDB persistence

## 8. Order Status Flow
Placed → Preparing → Out for Delivery → Delivered

An order can be cancelled only while its status is Placed.

## 9. Testing
The application can be tested using Thunder Client and the browser. Test menu retrieval, menu creation, order placement, order history, invalid input, and status updates. Attach actual test responses and screenshots to the lab report.

## 10. Result
The QuickBite mini food delivery application was developed to demonstrate frontend and backend integration, REST API development, database operations, validation, and order management.

## 11. Limitation
The current admin interface does not include authentication. It is intended as an academic demonstration, not a production-secure deployment.
