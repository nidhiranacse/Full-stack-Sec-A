import { Utensils, ShoppingBag, ClipboardList, Settings } from "lucide-react";

export default function Header({ activeTab, setActiveTab, cartCount }) {
  const tabs = [
    { id: "menu", label: "Explore Menu", icon: Utensils },
    { id: "orders", label: "My Orders", icon: ClipboardList },
    { id: "admin", label: "Admin", icon: Settings },
  ];

  return (
    <header className="site-header">
      <button className="brand" onClick={() => setActiveTab("menu")}>
        <span className="brand-icon"><Utensils size={22} /></span>
        <span>quick<span className="brand-accent">bite</span>
          <small>GOOD FOOD, GOOD MOOD</small>
        </span>
      </button>

      <nav className="main-nav">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-link ${activeTab === id ? "active" : ""}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </nav>

      <button className="cart-shortcut" onClick={() => setActiveTab("menu")}>
        <ShoppingBag size={19} />
        <span>My Cart</span>
        <b>{cartCount}</b>
      </button>
    </header>
  );
}