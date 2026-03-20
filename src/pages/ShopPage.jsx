import { useState } from "react";

const API_CART = "http://localhost:5002";

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const SAMPLE_PRODUCTS = [
  { id: 1, name: "Laptop",               price: 50000, quantity: 10, emoji: "💻", tag: "Best Seller",  tagColor: "#7c6af7" },
  { id: 2, name: "Smartphone",           price: 15000, quantity: 25, emoji: "📱", tag: "Popular",      tagColor: "#0d9e6e" },
  { id: 3, name: "Headphones",           price:  2000, quantity: 50, emoji: "🎧", tag: "New",          tagColor: "#e76fff" },
  { id: 4, name: "Smartwatch",           price:  8000, quantity: 15, emoji: "⌚", tag: "Trending",     tagColor: "#f09000" },
  { id: 5, name: "Tablet",               price: 25000, quantity:  8, emoji: "📲", tag: "Limited",      tagColor: "#e04040" },
  { id: 6, name: "Bluetooth Speaker",    price:  3500, quantity: 30, emoji: "🔊", tag: "Deal",         tagColor: "#0d9e6e" },
  { id: 7, name: "Mechanical Keyboard",  price:  5500, quantity: 20, emoji: "⌨️", tag: "Top Rated",    tagColor: "#7c6af7" },
  { id: 8, name: "USB-C Hub",            price:  1800, quantity: 40, emoji: "🔌", tag: "Essential",    tagColor: "#888"    },
];

export default function ShopPage() {
  const [qtys,    setQtys]    = useState({});
  const [cart,    setCart]    = useState([]);
  const [loading, setLoading] = useState(null);
  const [added,   setAdded]   = useState({});
  const [search,  setSearch]  = useState("");

  const getQty = (id)       => qtys[id] ?? 1;
  const setQty = (id, val)  => setQtys((p) => ({ ...p, [id]: val }));

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const filtered = SAMPLE_PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = async (product, qty) => {
    setLoading(product.id);
    try {
      await fetch(`${API_CART}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id, quantity: qty }),
      });
    } catch (_) { /* backend may not be running — still update local state */ }

    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { ...product, qty }];
    });
    setAdded((p) => ({ ...p, [product.id]: true }));
    setTimeout(() => setAdded((p) => ({ ...p, [product.id]: false })), 1600);
    setLoading(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0e0e12", color: "#f0ede8", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; }
        @keyframes slideIn  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pop      { 0%{transform:scale(1)} 50%{transform:scale(1.07)} 100%{transform:scale(1)} }

        .p-card {
          background: #18181f; border: 1px solid #2a2a38; border-radius: 18px;
          padding: 22px; position: relative; overflow: hidden;
          animation: slideIn .35s ease both;
          transition: transform .22s, box-shadow .22s, border-color .22s;
        }
        .p-card::before {
          content:''; position:absolute; inset:0;
          background: radial-gradient(circle at 75% 15%, rgba(124,106,247,.07), transparent 60%);
          pointer-events:none;
        }
        .p-card:hover { transform:translateY(-5px); box-shadow:0 20px 50px rgba(0,0,0,.55); border-color:#3a3a55; }

        .btn { cursor:pointer; border:none; font-family:'DM Sans',sans-serif; font-weight:600; transition:.18s; }
        .btn:hover  { filter:brightness(1.13); }
        .btn:active { transform:scale(.96); }

        .add-btn { width:100%; padding:11px 0; border-radius:11px; font-size:13px; }
        .add-btn.idle  { background:linear-gradient(135deg,#7c6af7,#a06af7); color:#fff; }
        .add-btn.done  { background:linear-gradient(135deg,#0d9e6e,#0abc83); color:#fff; animation:pop .3s ease; }
        .add-btn.busy  { background:#2a2a38; color:#555; cursor:not-allowed; }
        .add-btn.empty { background:#1e1e28; color:#444; cursor:not-allowed; }

        .qty-wrap { display:flex; align-items:center; gap:8px; background:#0e0e12; border:1px solid #2a2a38; border-radius:9px; padding:5px 12px; }
        .qty-btn  { background:none; color:#666; padding:0 3px; font-size:18px; line-height:1; border-radius:4px; transition:color .15s; }
        .qty-btn:hover { color:#a89af7; }

        .tag { display:inline-block; padding:3px 9px; border-radius:999px; font-size:10px; font-weight:700; font-family:'DM Mono',monospace; letter-spacing:.5px; text-transform:uppercase; }
        .search { background:#18181f; border:1px solid #2a2a38; color:#f0ede8; border-radius:11px; padding:9px 16px; font-family:'DM Sans',sans-serif; font-size:14px; outline:none; width:240px; transition:border-color .2s; }
        .search:focus { border-color:#7c6af7; }
        .search::placeholder { color:#444; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#2a2a38; border-radius:4px; }
      `}</style>

      {/* ── Navbar ── */}
      <header style={{
        position:"sticky", top:0, zIndex:50,
        background:"rgba(14,14,18,.92)", backdropFilter:"blur(14px)",
        borderBottom:"1px solid #1e1e2c",
        padding:"14px 32px", display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#7c6af7,#e76fff)", display:"grid", placeItems:"center", fontSize:16 }}>⚡</div>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, letterSpacing:"-0.5px" }}>ShopFlow</span>
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#555", background:"#18181f", border:"1px solid #2a2a38", borderRadius:4, padding:"2px 7px" }}>
            inventory-service · :5001
          </span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <input className="search" placeholder="🔍  Search products…" value={search} onChange={(e)=>setSearch(e.target.value)} />
          {cartCount > 0 && (
            <div style={{ background:"#18181f", border:"1px solid #2a2a38", borderRadius:999, padding:"7px 16px", display:"flex", alignItems:"center", gap:8, fontFamily:"'DM Mono',monospace", fontSize:13 }}>
              <span>🛒</span>
              <span style={{ color:"#a89af7" }}>{cartCount} item{cartCount!==1?"s":""}</span>
              <span style={{ color:"#555" }}>·</span>
              <span style={{ fontWeight:600 }}>{formatINR(cartTotal)}</span>
            </div>
          )}
        </div>
      </header>

      {/* ── Content ── */}
      <div style={{ padding:"32px 32px 60px", maxWidth:1200, margin:"0 auto" }}>

        {/* Heading row */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:28 }}>
          <div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:30, marginBottom:4 }}>All Products</h1>
            <p style={{ color:"#555", fontSize:12, fontFamily:"'DM Mono',monospace" }}>
              {filtered.length} product{filtered.length!==1?"s":""} · GET /inventory
            </p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {["All","Electronics","Audio","Accessories"].map((c)=>(
              <span key={c} style={{ padding:"5px 12px", borderRadius:6, background: c==="All"?"#7c6af720":"transparent", color: c==="All"?"#a89af7":"#555", border:`1px solid ${c==="All"?"#7c6af740":"#2a2a38"}`, fontSize:11, fontFamily:"'DM Mono',monospace", cursor:"pointer" }}>
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px 0", color:"#444" }}>
            <div style={{ fontSize:48, marginBottom:14 }}>🔍</div>
            <p>No products match "{search}"</p>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(255px,1fr))", gap:20 }}>
            {filtered.map((item, i) => {
              const isLoading = loading === item.id;
              const isDone    = added[item.id];
              const isOut     = item.quantity === 0;
              const inCart    = cart.find((c) => c.id === item.id);

              return (
                <div key={item.id} className="p-card" style={{ animationDelay:`${i*0.05}s` }}>

                  {/* Tag row */}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                    <span className="tag" style={{ background:item.tagColor+"1a", color:item.tagColor }}>
                      {item.tag}
                    </span>
                    {inCart && (
                      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#666" }}>
                        {inCart.qty} in cart
                      </span>
                    )}
                  </div>

                  {/* Emoji */}
                  <div style={{ width:62, height:62, borderRadius:15, background:"linear-gradient(135deg,#1a1a28,#252540)", display:"grid", placeItems:"center", fontSize:28, marginBottom:16, boxShadow:"0 4px 16px rgba(0,0,0,.4)" }}>
                    {item.emoji}
                  </div>

                  {/* Name */}
                  <h2 style={{ fontWeight:600, fontSize:16, marginBottom:6, color:"#f0ede8" }}>{item.name}</h2>

                  {/* Stock bar */}
                  <div style={{ marginBottom:14 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                      <span style={{ fontSize:11, color:"#555", fontFamily:"'DM Mono',monospace" }}>stock</span>
                      <span style={{ fontSize:11, fontFamily:"'DM Mono',monospace", color: item.quantity>10?"#0d9e6e":item.quantity>0?"#f09000":"#e04040" }}>
                        {item.quantity} units
                      </span>
                    </div>
                    <div style={{ height:3, background:"#1e1e2c", borderRadius:99 }}>
                      <div style={{ height:"100%", borderRadius:99, width:`${Math.min(100,(item.quantity/50)*100)}%`, background: item.quantity>10?"#0d9e6e":item.quantity>0?"#f09000":"#e04040", transition:"width .5s ease" }} />
                    </div>
                  </div>

                  {/* Price */}
                  <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, color:"#a89af7", marginBottom:18 }}>
                    {formatINR(item.price)}
                  </p>

                  {/* Qty stepper + Add button */}
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    <div className="qty-wrap">
                      <button className="btn qty-btn" onClick={()=>setQty(item.id, Math.max(1,getQty(item.id)-1))}>−</button>
                      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:14, minWidth:18, textAlign:"center" }}>{getQty(item.id)}</span>
                      <button className="btn qty-btn" onClick={()=>setQty(item.id, Math.min(item.quantity,getQty(item.id)+1))}>+</button>
                    </div>
                    <button
                      className={`btn add-btn ${isOut?"empty":isLoading?"busy":isDone?"done":"idle"}`}
                      disabled={isOut||isLoading}
                      onClick={()=>addToCart(item, getQty(item.id))}>
                      {isLoading?"Adding…":isDone?"✓ Added!":isOut?"Out of Stock":"Add to Cart"}
                    </button>
                  </div>

                  <p style={{ marginTop:12, fontFamily:"'DM Mono',monospace", fontSize:10, color:"#252535" }}>
                    id:{item.id} · POST /cart · :5002
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Discount banner */}
        {cartCount > 0 && (
          <div style={{ marginTop:40, padding:"18px 24px", background:"#7c6af710", border:"1px solid #7c6af730", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", gap:14, alignItems:"center" }}>
              <span style={{ fontSize:24 }}>🎟️</span>
              <div>
                <p style={{ fontWeight:600, fontSize:14, marginBottom:3 }}>Discount codes available at checkout</p>
                <p style={{ fontSize:12, color:"#666", fontFamily:"'DM Mono',monospace" }}>NEWYEAR (10%) · SAVE20 (20%) · FLAT50 (50%)</p>
              </div>
            </div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:"#a89af7" }}>
              {formatINR(cartTotal)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
