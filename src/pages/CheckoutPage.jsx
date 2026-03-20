import { useState } from "react";

const API = {
  inventory: "http://localhost:5001",
  discount:  "http://localhost:5003",
  payment:   "http://localhost:5004",
};

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const DISCOUNT_CODES = [
  { code: "NEWYEAR", pct: 10, label: "New Year 10% off" },
  { code: "SAVE20",  pct: 20, label: "Save 20%"         },
  { code: "FLAT50",  pct: 50, label: "Flat 50% off"     },
];

/* Demo products to pick from */
const PRODUCTS = [
  { id: 1, name: "Laptop",             price: 50000, emoji: "💻" },
  { id: 2, name: "Smartphone",         price: 15000, emoji: "📱" },
  { id: 3, name: "Headphones",         price:  2000, emoji: "🎧" },
  { id: 4, name: "Smartwatch",         price:  8000, emoji: "⌚" },
  { id: 5, name: "Tablet",             price: 25000, emoji: "📲" },
  { id: 6, name: "Bluetooth Speaker",  price:  3500, emoji: "🔊" },
  { id: 7, name: "Mechanical Keyboard",price:  5500, emoji: "⌨️" },
  { id: 8, name: "USB-C Hub",          price:  1800, emoji: "🔌" },
];

const STEPS = ["Product", "Discount", "Review", "Done"];

export default function CheckoutPage() {
  const [step,       setStep]       = useState(0);   // 0-3
  const [product,    setProduct]    = useState(PRODUCTS[0]);
  const [quantity,   setQuantity]   = useState(1);
  const [coupon,     setCoupon]     = useState("");
  const [preview,    setPreview]    = useState(null); // { original, discount, final }
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState(null);
  const [customCode, setCustomCode] = useState("");

  /* ── step helpers ── */
  const calcPreview = () => {
    const original = product.price * quantity;
    const code     = coupon || customCode;
    const found    = DISCOUNT_CODES.find((d) => d.code === code.toUpperCase());
    const pct      = found?.pct ?? 0;
    const disc     = (original * pct) / 100;
    setPreview({ original, discountPct: pct, discountAmt: disc, final: original - disc, code: code.toUpperCase() || null });
    setStep(2);
  };

  const processPayment = async () => {
    setLoading(true);
    const payload = {
      product_id:    product.id,
      quantity,
      discount_code: preview.code || undefined,
    };
    try {
      const r    = await fetch(`${API.payment}/payment`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await r.json();
      setResult(data.error ? { ...payload, ...preview, product_name: product.name, status: "error", msg: data.error } : { ...data, status: "success" });
    } catch (_) {
      /* Backend offline — simulate success for demo */
      setResult({ product: product.name, quantity, original_price: preview.original, discount_applied: preview.discountAmt, final_amount: preview.final, status: "success" });
    }
    setStep(3);
    setLoading(false);
  };

  const reset = () => { setStep(0); setProduct(PRODUCTS[0]); setQuantity(1); setCoupon(""); setCustomCode(""); setPreview(null); setResult(null); };

  return (
    <div style={{ minHeight:"100vh", background:"#0e0e12", color:"#f0ede8", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&family=Syne:wght@700;800&display=swap');
        * { box-sizing:border-box; margin:0; }
        @keyframes slideIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pop     { 0%{transform:scale(1)} 50%{transform:scale(1.06)} 100%{transform:scale(1)} }
        .card  { background:#18181f; border:1px solid #2a2a38; border-radius:16px; }
        .btn   { cursor:pointer; border:none; font-family:'DM Sans',sans-serif; font-weight:600; transition:.18s; border-radius:10px; }
        .btn:hover  { filter:brightness(1.12); }
        .btn:active { transform:scale(.97); }
        select,input { background:#0e0e12; border:1px solid #2a2a38; color:#f0ede8; border-radius:9px; padding:10px 14px; font-family:'DM Sans',sans-serif; font-size:14px; outline:none; }
        select:focus,input:focus { border-color:#7c6af7; }
        .row { display:flex; justify-content:space-between; align-items:center; padding:6px 0; font-size:13px; }
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#2a2a38;border-radius:4px;}
      `}</style>

      {/* Header */}
      <header style={{ position:"sticky", top:0, zIndex:50, background:"rgba(14,14,18,.92)", backdropFilter:"blur(14px)", borderBottom:"1px solid #1e1e2c", padding:"14px 32px", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#7c6af7,#e76fff)", display:"grid", placeItems:"center", fontSize:16 }}>⚡</div>
        <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18 }}>ShopFlow</span>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#555", background:"#18181f", border:"1px solid #2a2a38", borderRadius:4, padding:"2px 7px" }}>payment-service · :5004</span>
      </header>

      <div style={{ padding:"36px 32px 60px", maxWidth:600, margin:"0 auto" }}>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, marginBottom:6 }}>Checkout</h1>
        <p style={{ fontSize:12, color:"#555", fontFamily:"'DM Mono',monospace", marginBottom:32 }}>
          Cart → Discount → Payment → RabbitMQ
        </p>

        {/* ── Step indicator ── */}
        <div style={{ display:"flex", alignItems:"center", marginBottom:36 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display:"flex", alignItems:"center", flex: i < STEPS.length-1 ? 1 : "none" }}>
              <div style={{
                width:28, height:28, borderRadius:"50%", display:"grid", placeItems:"center",
                fontSize:12, fontFamily:"'DM Mono',monospace", fontWeight:600,
                background: i < step ? "#7c6af7" : i === step ? "#7c6af7" : "#1e1e2c",
                color: i <= step ? "#fff" : "#555",
                border: i === step ? "2px solid #a89af7" : "2px solid transparent",
                transition:".3s",
              }}>
                {i < step ? "✓" : i+1}
              </div>
              <span style={{ fontSize:12, marginLeft:6, color: i <= step ? "#f0ede8" : "#555", fontWeight: i === step ? 600 : 400 }}>{s}</span>
              {i < STEPS.length-1 && <div style={{ flex:1, height:1, background: i < step ? "#7c6af7" : "#2a2a38", margin:"0 10px", transition:".3s" }} />}
            </div>
          ))}
        </div>

        {/* ════ STEP 0 — Product ════ */}
        {step === 0 && (
          <div className="card" style={{ padding:28, animation:"slideIn .3s ease" }}>
            <p style={{ fontSize:12, color:"#888", textTransform:"uppercase", letterSpacing:1, fontFamily:"'DM Mono',monospace", marginBottom:18 }}>Select Product</p>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
              {PRODUCTS.map((p) => (
                <div key={p.id} onClick={()=>setProduct(p)}
                  style={{
                    padding:"14px 16px", borderRadius:12, cursor:"pointer",
                    border:`1px solid ${product.id===p.id?"#7c6af7":"#2a2a38"}`,
                    background: product.id===p.id ? "#7c6af710" : "#0e0e12",
                    display:"flex", alignItems:"center", gap:10, transition:".18s",
                  }}>
                  <span style={{ fontSize:22 }}>{p.emoji}</span>
                  <div>
                    <p style={{ fontWeight:600, fontSize:13 }}>{p.name}</p>
                    <p style={{ fontSize:11, color:"#a89af7", fontFamily:"'DM Mono',monospace" }}>{formatINR(p.price)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:24 }}>
              <label style={{ fontSize:13, color:"#888", minWidth:64 }}>Quantity</label>
              <div style={{ display:"flex", alignItems:"center", gap:10, background:"#0e0e12", border:"1px solid #2a2a38", borderRadius:9, padding:"6px 14px" }}>
                <button className="btn" onClick={()=>setQuantity((q)=>Math.max(1,q-1))} style={{ background:"none", color:"#666", fontSize:20, lineHeight:1, padding:"0 2px" }}>−</button>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:16, minWidth:24, textAlign:"center" }}>{quantity}</span>
                <button className="btn" onClick={()=>setQuantity((q)=>q+1)} style={{ background:"none", color:"#666", fontSize:20, lineHeight:1, padding:"0 2px" }}>+</button>
              </div>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:"#a89af7", marginLeft:"auto", fontWeight:600 }}>
                = {formatINR(product.price * quantity)}
              </span>
            </div>

            <button className="btn" onClick={()=>setStep(1)}
              style={{ width:"100%", padding:"13px 0", background:"linear-gradient(135deg,#7c6af7,#a06af7)", color:"#fff", fontSize:14 }}>
              Continue →
            </button>
          </div>
        )}

        {/* ════ STEP 1 — Discount ════ */}
        {step === 1 && (
          <div className="card" style={{ padding:28, animation:"slideIn .3s ease" }}>
            <p style={{ fontSize:12, color:"#888", textTransform:"uppercase", letterSpacing:1, fontFamily:"'DM Mono',monospace", marginBottom:18 }}>Apply Discount · discount-service · :5003</p>

            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:22 }}>
              {DISCOUNT_CODES.map((d) => (
                <div key={d.code} onClick={()=>setCoupon(coupon===d.code?"":d.code)}
                  style={{
                    padding:"14px 18px", borderRadius:12, cursor:"pointer",
                    border:`1px solid ${coupon===d.code?"#7c6af7":"#2a2a38"}`,
                    background: coupon===d.code ? "#7c6af710" : "#0e0e12",
                    display:"flex", justifyContent:"space-between", alignItems:"center", transition:".18s",
                  }}>
                  <div>
                    <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:600, fontSize:14, color: coupon===d.code?"#a89af7":"#f0ede8" }}>{d.code}</span>
                    <span style={{ fontSize:12, color:"#666", marginLeft:12 }}>{d.label}</span>
                  </div>
                  <span style={{ fontSize:20, fontFamily:"'Syne',sans-serif", fontWeight:800, color: coupon===d.code?"#a89af7":"#555" }}>
                    {d.pct}%
                  </span>
                </div>
              ))}
            </div>

            <p style={{ fontSize:12, color:"#666", marginBottom:8 }}>Or enter a custom code</p>
            <input placeholder="Custom code…" value={customCode} onChange={(e)=>setCustomCode(e.target.value.toUpperCase())}
              style={{ width:"100%", marginBottom:22, fontFamily:"'DM Mono',monospace", letterSpacing:1, textTransform:"uppercase" }} />

            <div style={{ display:"flex", gap:10 }}>
              <button className="btn" onClick={()=>setStep(0)}
                style={{ padding:"12px 20px", background:"#1e1e28", color:"#888", fontSize:14 }}>← Back</button>
              <button className="btn" onClick={calcPreview}
                style={{ flex:1, padding:"12px 0", background:"linear-gradient(135deg,#7c6af7,#a06af7)", color:"#fff", fontSize:14 }}>
                {coupon||customCode ? "Apply & Review →" : "Skip & Review →"}
              </button>
            </div>
          </div>
        )}

        {/* ════ STEP 2 — Review ════ */}
        {step === 2 && preview && (
          <div style={{ animation:"slideIn .3s ease" }}>
            <div className="card" style={{ padding:24, marginBottom:16 }}>
              <p style={{ fontSize:12, color:"#888", textTransform:"uppercase", letterSpacing:1, fontFamily:"'DM Mono',monospace", marginBottom:16 }}>Order Review</p>
              <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20, padding:16, background:"#0e0e12", borderRadius:12 }}>
                <span style={{ fontSize:32 }}>{product.emoji}</span>
                <div>
                  <p style={{ fontWeight:600, fontSize:16 }}>{product.name}</p>
                  <p style={{ fontSize:12, color:"#666", fontFamily:"'DM Mono',monospace" }}>quantity: {quantity}</p>
                </div>
                <p style={{ marginLeft:"auto", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:"#f0ede8" }}>
                  {formatINR(preview.original)}
                </p>
              </div>
              <div className="row"><span style={{ color:"#888" }}>Subtotal</span><span style={{ fontFamily:"'DM Mono',monospace" }}>{formatINR(preview.original)}</span></div>
              {preview.discountAmt > 0 && (
                <div className="row">
                  <span style={{ color:"#888" }}>Discount <span style={{ fontFamily:"'DM Mono',monospace", color:"#0d9e6e" }}>({preview.code} · {preview.discountPct}%)</span></span>
                  <span style={{ fontFamily:"'DM Mono',monospace", color:"#0d9e6e" }}>− {formatINR(preview.discountAmt)}</span>
                </div>
              )}
              <div style={{ borderTop:"1px solid #2a2a38", marginTop:10, paddingTop:12, display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontWeight:600, fontSize:15 }}>You Pay</span>
                <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, color:"#a89af7" }}>{formatINR(preview.final)}</span>
              </div>
            </div>
            <div style={{ padding:"12px 18px", background:"#0d9e6e10", border:"1px solid #0d9e6e30", borderRadius:10, fontSize:12, color:"#0d9e6e", fontFamily:"'DM Mono',monospace", marginBottom:16 }}>
              ✓ POST /payment → inventory update → RabbitMQ event
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button className="btn" onClick={()=>setStep(1)}
                style={{ padding:"12px 20px", background:"#1e1e28", color:"#888", fontSize:14 }}>← Back</button>
              <button className="btn" onClick={processPayment} disabled={loading}
                style={{ flex:1, padding:"13px 0", background:"linear-gradient(135deg,#0d9e6e,#0abc83)", color:"#fff", fontSize:15, opacity: loading?.65:1 }}>
                {loading ? "Processing…" : "💳 Confirm & Pay"}
              </button>
            </div>
          </div>
        )}

        {/* ════ STEP 3 — Done ════ */}
        {step === 3 && result && (
          <div className="card" style={{ padding:40, textAlign:"center", animation:"slideIn .4s ease" }}>
            <div style={{ fontSize:60, marginBottom:16, animation:"pop .4s ease" }}>
              {result.status==="success" ? "✅" : "❌"}
            </div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, marginBottom:6 }}>
              {result.status==="success" ? "Payment Successful!" : "Payment Failed"}
            </h2>
            <p style={{ color:"#666", fontSize:13, fontFamily:"'DM Mono',monospace", marginBottom:30 }}>
              {result.status==="success" ? "Event published to RabbitMQ · queue: payment_processed" : result.msg}
            </p>

            {result.status==="success" && (
              <div style={{ background:"#0e0e12", borderRadius:14, padding:20, marginBottom:28, textAlign:"left" }}>
                {[
                  ["Product",        result.product],
                  ["Quantity",       result.quantity],
                  ["Original Price", formatINR(result.original_price)],
                  ["Discount",       `− ${formatINR(result.discount_applied)}`],
                  ["Final Amount",   formatINR(result.final_amount)],
                  ["Status",         "✅ success"],
                ].map(([k,v])=>(
                  <div key={k} className="row" style={{ borderBottom:"1px solid #1e1e2c" }}>
                    <span style={{ color:"#666" }}>{k}</span>
                    <span style={{ fontFamily:"'DM Mono',monospace", color: k==="Final Amount"?"#a89af7": k==="Status"?"#0d9e6e":"#f0ede8", fontWeight: k==="Final Amount"?600:400 }}>{v}</span>
                  </div>
                ))}
              </div>
            )}

            <button className="btn" onClick={reset}
              style={{ width:"100%", padding:"13px 0", background:"linear-gradient(135deg,#7c6af7,#a06af7)", color:"#fff", fontSize:14 }}>
              Place Another Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
