import { useEffect, useState } from "react";

const API_CART = "http://localhost:5002";

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const EMOJI = (name = "") =>
  name.includes("Laptop") ? "💻" : name.includes("Smart") || name.includes("Phone") ? "📱" :
  name.includes("Head") ? "🎧" : name.includes("Watch") ? "⌚" : name.includes("Tablet") ? "📲" :
  name.includes("Speaker") ? "🔊" : name.includes("Key") ? "⌨️" : name.includes("USB") ? "🔌" : "📦";

/* Hardcoded demo cart — replace with real API data when backend is live */
const DEMO_CART = [
  { id: 1, product_id: 1, product_name: "Laptop",            quantity: 1, price: 50000 },
  { id: 2, product_id: 2, product_name: "Smartphone",        quantity: 2, price: 15000 },
  { id: 3, product_id: 3, product_name: "Headphones",        quantity: 1, price:  2000 },
];

const DISCOUNT_CODES = { NEWYEAR: 10, SAVE20: 20, FLAT50: 50 };

export default function CartPage({ onGoCheckout }) {
  const [items,     setItems]     = useState(DEMO_CART);
  const [fetching,  setFetching]  = useState(false);
  const [coupon,    setCoupon]    = useState("");
  const [couponMsg, setCouponMsg] = useState(null);  // { pct, valid }
  const [removed,   setRemoved]   = useState({});

  /* Try to load real cart from backend */
  useEffect(() => {
    (async () => {
      setFetching(true);
      try {
        const r = await fetch(`${API_CART}/cart`);
        const d = await r.json();
        if (d.cart_items?.length) setItems(d.cart_items);
      } catch (_) { /* backend offline — keep demo data */ }
      setFetching(false);
    })();
  }, []);

  const subtotal   = items.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);
  const discount   = couponMsg?.valid ? (subtotal * couponMsg.pct) / 100 : 0;
  const total      = subtotal - discount;

  const applyCode  = () => {
    const pct = DISCOUNT_CODES[coupon.toUpperCase()];
    if (pct) setCouponMsg({ pct, valid: true,  msg: `${pct}% off applied ✓` });
    else      setCouponMsg({ pct: 0, valid: false, msg: "Invalid code" });
  };

  const removeItem = (id) => {
    setRemoved((p) => ({ ...p, [id]: true }));
    setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 320);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0e0e12", color:"#f0ede8", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&family=Syne:wght@700;800&display=swap');
        * { box-sizing:border-box; margin:0; }
        @keyframes slideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeOut { to{opacity:0;transform:translateX(30px)} }
        .card { background:#18181f; border:1px solid #2a2a38; border-radius:16px; }
        .btn  { cursor:pointer; border:none; font-family:'DM Sans',sans-serif; font-weight:600; transition:.18s; border-radius:10px; }
        .btn:hover  { filter:brightness(1.12); }
        .btn:active { transform:scale(.97); }
        .row { display:flex; align-items:center; justify-content:space-between; padding:5px 0; font-size:13px; color:#888; }
        input { background:#0e0e12; border:1px solid #2a2a38; color:#f0ede8; border-radius:8px; padding:9px 14px; font-family:'DM Sans',sans-serif; font-size:13px; outline:none; }
        input:focus { border-color:#7c6af7; }
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#2a2a38;border-radius:4px;}
      `}</style>

      {/* Navbar */}
      <header style={{ position:"sticky", top:0, zIndex:50, background:"rgba(14,14,18,.92)", backdropFilter:"blur(14px)", borderBottom:"1px solid #1e1e2c", padding:"14px 32px", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#7c6af7,#e76fff)", display:"grid", placeItems:"center", fontSize:16 }}>⚡</div>
        <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18 }}>ShopFlow</span>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#555", background:"#18181f", border:"1px solid #2a2a38", borderRadius:4, padding:"2px 7px" }}>cart-service · :5002</span>
        {fetching && <span style={{ marginLeft:"auto", fontFamily:"'DM Mono',monospace", fontSize:11, color:"#555" }}>loading…</span>}
      </header>

      <div style={{ padding:"32px", maxWidth:900, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 340px", gap:28, alignItems:"start" }}>

        {/* ── Left: Cart Items ── */}
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
            <div>
              <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, marginBottom:3 }}>Your Cart</h1>
              <p style={{ fontSize:12, color:"#555", fontFamily:"'DM Mono',monospace" }}>
                {items.length} item{items.length!==1?"s":""} · GET /cart
              </p>
            </div>
          </div>

          {items.length === 0 ? (
            <div style={{ textAlign:"center", padding:"80px 0", color:"#444" }}>
              <div style={{ fontSize:48, marginBottom:14 }}>🛒</div>
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {items.map((item, i) => (
                <div key={item.id} className="card" style={{
                  padding:"18px 20px", display:"flex", alignItems:"center", gap:16,
                  animation:`slideIn .3s ease ${i*0.06}s both`,
                  ...(removed[item.id] ? { animation:"fadeOut .3s ease forwards" } : {}),
                }}>
                  {/* Icon */}
                  <div style={{ width:52, height:52, borderRadius:13, background:"linear-gradient(135deg,#1a1a28,#252540)", display:"grid", placeItems:"center", fontSize:24, flexShrink:0 }}>
                    {EMOJI(item.product_name)}
                  </div>

                  {/* Info */}
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:600, fontSize:15, marginBottom:4 }}>{item.product_name}</p>
                    <p style={{ fontSize:12, color:"#555", fontFamily:"'DM Mono',monospace" }}>
                      qty: {item.quantity} × {formatINR(item.price)}
                    </p>
                  </div>

                  {/* Line total */}
                  <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:"#a89af7", marginRight:12 }}>
                    {formatINR(item.price * item.quantity)}
                  </p>

                  {/* Remove */}
                  <button className="btn" onClick={()=>removeItem(item.id)}
                    style={{ background:"#2a2a38", color:"#888", padding:"7px 12px", fontSize:12 }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Summary ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Coupon */}
          <div className="card" style={{ padding:20 }}>
            <p style={{ fontSize:12, color:"#888", textTransform:"uppercase", letterSpacing:1, fontFamily:"'DM Mono',monospace", marginBottom:12 }}>
              🎟️ Discount Code
            </p>
            <div style={{ display:"flex", gap:8, marginBottom:10 }}>
              <input placeholder="NEWYEAR / SAVE20 / FLAT50" value={coupon} onChange={(e)=>setCoupon(e.target.value.toUpperCase())}
                style={{ flex:1, fontFamily:"'DM Mono',monospace", letterSpacing:1, textTransform:"uppercase" }} />
              <button className="btn" onClick={applyCode}
                style={{ padding:"9px 16px", background:"#7c6af720", color:"#a89af7", border:"1px solid #7c6af740", fontSize:13 }}>
                Apply
              </button>
            </div>
            {couponMsg && (
              <p style={{ fontSize:12, fontFamily:"'DM Mono',monospace", color: couponMsg.valid ? "#0d9e6e" : "#e04040" }}>
                {couponMsg.msg}
              </p>
            )}
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10 }}>
              {Object.entries(DISCOUNT_CODES).map(([code, pct]) => (
                <span key={code} onClick={()=>setCoupon(code)}
                  style={{ padding:"3px 10px", borderRadius:6, background:"#1e1e2c", border:"1px solid #2a2a38", fontSize:11, fontFamily:"'DM Mono',monospace", color:"#666", cursor:"pointer" }}>
                  {code} ({pct}%)
                </span>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="card" style={{ padding:20 }}>
            <p style={{ fontSize:12, color:"#888", textTransform:"uppercase", letterSpacing:1, fontFamily:"'DM Mono',monospace", marginBottom:16 }}>
              Order Summary
            </p>
            <div className="row"><span>Subtotal</span><span style={{ fontFamily:"'DM Mono',monospace", color:"#f0ede8" }}>{formatINR(subtotal)}</span></div>
            {discount > 0 && (
              <div className="row"><span>Discount ({couponMsg.pct}%)</span><span style={{ fontFamily:"'DM Mono',monospace", color:"#0d9e6e" }}>− {formatINR(discount)}</span></div>
            )}
            <div className="row"><span>Shipping</span><span style={{ color:"#0d9e6e", fontFamily:"'DM Mono',monospace" }}>FREE</span></div>
            <div style={{ borderTop:"1px solid #2a2a38", marginTop:12, paddingTop:12, display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontWeight:600, fontSize:15 }}>Total</span>
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, color:"#a89af7" }}>{formatINR(total)}</span>
            </div>
          </div>

          {/* Checkout CTA */}
          <button className="btn" onClick={onGoCheckout} disabled={items.length === 0}
            style={{ width:"100%", padding:"14px 0", fontSize:15, background: items.length ? "linear-gradient(135deg,#7c6af7,#a06af7)" : "#1e1e28", color: items.length ? "#fff" : "#444", borderRadius:12 }}>
            Proceed to Checkout →
          </button>

          {items.length > 0 && (
            <p style={{ textAlign:"center", fontSize:11, color:"#444", fontFamily:"'DM Mono',monospace" }}>
              Connects to payment-service · :5004
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
