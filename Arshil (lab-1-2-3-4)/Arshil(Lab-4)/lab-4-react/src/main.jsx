import{StrictMode}from"react";
import{createRoot}from"react-dom/client";
import{BrowserRouter}from"react-router-dom";
import{CartProvider}from"./CartContext";
import App from"./App";
import"./App.css";

createRoot(document.getElementById("root")).render(<StrictMode><BrowserRouter><CartProvider><App/></CartProvider></BrowserRouter></StrictMode>);