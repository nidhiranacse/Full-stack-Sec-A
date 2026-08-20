import{useEffect,useState}from"react";
import{Routes,Route,Link,useParams}from"react-router-dom";
import{useCart}from"./CartContext";

const products=[
 {id:1,name:"Laptop",price:55000,desc:"Powerful laptop for coding and daily work."},
 {id:2,name:"Smartphone",price:25000,desc:"Modern smartphone with excellent performance."},
 {id:3,name:"Headphones",price:3000,desc:"Wireless headphones with clear sound."},
 {id:4,name:"Keyboard",price:1800,desc:"Mechanical keyboard for comfortable typing."}
];

function Nav(){
 const{cart}=useCart();
 return <nav><Link to="/">Shop</Link><Link to="/products">Products</Link><b>Cart: {cart.length}</b></nav>;
}

function Home(){
 return <><Nav/><main><h1>Welcome to TechStore</h1><p>Explore our products and add your favorites to the cart.</p><Link className="btn" to="/products">View Products</Link></main></>;
}

function Products(){
 const[loading,setLoading]=useState(true);
 useEffect(()=>{setTimeout(()=>setLoading(false),800)},[]);
 if(loading)return <><Nav/><main><h2>Loading products...</h2></main></>;
 return <><Nav/><main><h1>Products</h1><div className="grid">{products.map(p=><article key={p.id}><h2>{p.name}</h2><p>₹{p.price}</p><Link className="btn" to={`/products/${p.id}`}>View Details</Link></article>)}</div></main></>;
}

function ProductDetails(){
 const{id}=useParams();
 const{addToCart}=useCart();
 const p=products.find(x=>x.id===Number(id));
 if(!p)return <><Nav/><main><h1>Product Not Found</h1><Link to="/products">Back to Products</Link></main></>;
 return <><Nav/><main><h1>{p.name}</h1><h2>₹{p.price}</h2><p>{p.desc}</p><button className="btn" onClick={()=>addToCart(p)}>Add to Cart</button><br/><br/><Link to="/products">← Back</Link></main></>;
}

function NotFound(){
 return <><Nav/><main><h1>404 - Page Not Found</h1><p>The requested page does not exist.</p><Link to="/">Go Home</Link></main></>;
}

export default function App(){
 return <Routes>
  <Route path="/" element={<Home/>}/>
  <Route path="/products" element={<Products/>}/>
  <Route path="/products/:id" element={<ProductDetails/>}/>
  <Route path="*" element={<NotFound/>}/>
 </Routes>;
}