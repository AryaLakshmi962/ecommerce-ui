import { useState } from "react";
import ShopPage from "./pages/ShopPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import InventoryPage from "./pages/InventoryPage.jsx";

const TABS = [
  { id: "shop",      label: "Shop"      },
  { id: "cart",      label: "Cart"      },
  { id: "checkout",  label: "Checkout"  },
  { id: "inventory", label: "Inventory" },
];

export default function App() {
  const [tab, setTab] = useState("shop");

  return (
    <div style={{ fontFamily: "sans-serif", background: "#0a0a0f", minHeight: "100vh" }}>
      
      {/* 🔹 Navbar */}
      <nav style={{
        display: "flex",
        gap: 10,
        padding: "12px 32px",
        background: "#0e0e12",
        borderBottom: "1px solid #1e1e2c",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "8px 20px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
              transition: "0.2s",
              background: tab === t.id ? "#7c6af7" : "transparent",
              color: tab === t.id ? "#fff" : "#aaa",
            }}
            onMouseEnter={(e) => {
              if (tab !== t.id) e.target.style.background = "#1e1e2c";
            }}
            onMouseLeave={(e) => {
              if (tab !== t.id) e.target.style.background = "transparent";
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* 🔹 Header */}
      <h1 style={{
        textAlign: "center",
        margin: "20px 0",
        color: "#7c6af7"
      }}>
        🛒 My E-Commerce App
      </h1>

      {/* 🔹 Pages */}
      <div style={{ padding: "0 20px" }}>
        {tab === "shop"      && <ShopPage />}
        {tab === "cart"      && <CartPage onGoCheckout={() => setTab("checkout")} />}
        {tab === "checkout"  && <CheckoutPage />}
        {tab === "inventory" && <InventoryPage />}
      </div>

      {/* 🔹 Footer */}
      <footer style={{
        textAlign: "center",
        padding: 20,
        color: "#666",
        fontSize: 12,
        marginTop: 30
      }}>
        © 2026 My E-Commerce App
      </footer>
    </div>
  );
}