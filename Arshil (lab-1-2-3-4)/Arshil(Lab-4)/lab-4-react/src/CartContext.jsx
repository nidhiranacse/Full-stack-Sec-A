import{createContext,useContext,useState}from"react";

const CartContext=createContext();

export function CartProvider({children}){
 const[cart,setCart]=useState([]);
 const addToCart=p=>setCart(c=>[...c,p]);
 const removeFromCart=id=>setCart(c=>c.filter(p=>p.id!==id));
 return <CartContext.Provider value={{cart,addToCart,removeFromCart}}>{children}</CartContext.Provider>;
}

export const useCart=()=>useContext(CartContext);