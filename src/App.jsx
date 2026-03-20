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
    <div>
      <nav style={{
        display: "flex",
        gap: 8,
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
              fontFamily: "sans-serif",
              fontWeight: 600,
              fontSize: 13,
              transition: "0.18s",
              background: tab === t.id ? "#7c6af7" : "transparent",
              color:      tab === t.id ? "#fff"    : "#666",
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "shop"      && <ShopPage />}
      {tab === "cart"      && <CartPage onGoCheckout={() => setTab("checkout")} />}
      {tab === "checkout"  && <CheckoutPage />}
      {tab === "inventory" && <InventoryPage />}
    </div>
  );
}