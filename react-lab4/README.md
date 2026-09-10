# React Lab 4 — React Routing and State Management

## Aim

To build a multi-page Single Page Application (SPA) using React.js, React Router, and Context API for routing and global state management.

## Features

- 🏠 Home page
- 🛍️ Products page
- 📦 Product Details page
- 🔗 Dynamic routing using `react-router-dom`
- 🛒 Global cart state using Context API
- 📤 Props and route parameter communication
- ⏳ Loading state for product details
- ❌ 404 Not Found page
- 📱 Responsive design
- 🚀 Deployable using Vercel

## Technologies Used

- React.js
- Vite
- JavaScript
- React Router DOM
- Context API
- CSS
- Vercel

## Project Structure

```text
react-lab4/
│
├── src/
│   ├── components/
│   │   └── Navbar.jsx
│   │
│   ├── context/
│   │   └── CartContext.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Products.jsx
│   │   ├── ProductDetails.jsx
│   │   └── NotFound.jsx
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── public/
├── index.html
├── package.json
├── vite.config.js
└── vercel.json