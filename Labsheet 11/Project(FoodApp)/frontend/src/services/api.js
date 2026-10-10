
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getMenu = (params = {}) =>
  api.get("/items", { params });

export const addMenuItem = (item) =>
  api.post("/items", item);

export const updateMenuItem = (id, item) =>
  api.put(`/items/${id}`, item);

export const deleteMenuItem = (id) =>
  api.delete(`/items/${id}`);

export const placeOrder = (order) =>
  api.post("/orders", order);

export const getOrders = () =>
  api.get("/orders");

export const updateOrderStatus = (id, status) =>
  api.patch(`/orders/${id}/status`, { status });

export default api;
