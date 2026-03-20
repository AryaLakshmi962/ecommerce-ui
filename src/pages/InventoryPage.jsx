import { useState, useEffect } from "react";

const API_INVENTORY = "http://localhost:5001";

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const EMOJI = (name = "") =>
  name.toLowerCase().includes("laptop")   ? "💻" :
  name.toLowerCase().includes("phone") || name.toLowerCase().includes("smart") ? "📱" :
  name.toLowerCase().includes("head")     ? "🎧" :
  name.toLowerCase().includes("watch")    ? "⌚" :
  name.toLowerCase().includes("tablet")   ? "📲" :
  name.toLowerCase().includes("speaker")  ? "🔊" :
  name.toLowerCase().includes("key")      ? "⌨️" :
  name.toLowerCase().includes("usb")      ? "🔌" : "📦";

/* Seed data shown when backend is offline */
const SEED = [
  { id:1, name:"Laptop",              price:50000, quantity:10 },
  { id:2, name:"Smartphone",          price:15000, quantity:25 },
  { id:3, name:"Headphones",          price: 2000, quantity:50 },
  { id:4, name:"Smartwatch",          price: 8000, quantity:15 },
  { id:5, name:"Tablet",              price:25000, quantity: 8 },
  { id:6, name:"Bluetooth Speaker",   price: 3500, quantity:30 },
  { id:7, name:"Mechanical Keyboard", price: 5500, quantity:20 },
  { id:8, name:"USB-C Hub",           price: 1800, quantity:40 },
];

const BLANK = { name:"", price:"", quantity:"" };

export default function InventoryPage() {
  const [items,    setItems]    = useState(SEED);
  const [form,     setForm]     = useState(BLANK);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [search,   setSearch]   = useState("");
  const [sort,     setSort]     = useState("id");   // id | price | quantity
  const [editing,  setEditing]  = useState(null);   // item id or null

  /* Try to load real inventory */
  useEffect(()=>{
    (async()=>{
      try {
        const r = await fetch(`${API_INVENTORY}/inventory`);
        const d = await r.json();
        if (Array.isArray(d) && d.length) setItems(d);
      } catch(_){}
    })();
  },[]);

  const filtered = [...items]
    .filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>
      sort==="price"    ? b.price    - a.price    :
      sort==="quantity" ? b.quantity - a.quantity :
      a.id - b.id
    );

  const totalValue = items.reduce((s,i)=>s + i.price * i.quantity, 0);
  const totalStock = items.reduce((s,i)=>s + i.quantity, 0);
  const lowStock   = items.filter((i)=>i.quantity > 0 && i.quantity <= 10).length;

  const handleSave = async () => {
    if(!form.name || !form.price || !form.quantity){ return; }
    setSaving(true);
    const payload = { name: form.name, price: parseFloat(form.price), quantity: parseInt(form.quantity) };

    try {
      if(editing){
        await fetch(`${API_INVENTORY}/inventory/${editing}`, {
          method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ quantity: payload.quantity }),
        });
        setItems((p)=>p.map((i)=>i.id===editing ? {...i, ...payload} : i));
      } else {
        const r  = await fetch(`${API_INVENTORY}/inventory`, {
          method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload),
        });
        const d  = await r.json();
        setItems((p)=>[...p, { ...payload, id: d.id ?? Date.now() }]);
      }
    } catch(_){
      /* Offline — update local state only */
      if(editing) setItems((p)=>p.map((i)=>i.id===editing ? {...i,...payload}:i));
      else setItems((p)=>[...p,{...payload, id: Date.now()}]);
    }

    setForm(BLANK); setShowForm(false); setEditing(null); setSaving(false);
  };

  const startEdit = (item) => {
    setForm({ name: item.name, price: String(item.price), quantity: String(item.quantity) });
    setEditing(item.id);
    setShowForm(true);
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  const deleteItem = (id) => setItems((p)=>p.filter((i)=>i.id!==id));

  return (
    <div style={{ minHeight:"100vh", background:"#0e0e12", color:"#f0ede8", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&family=Syne:wght@700;800&display=swap');
        * { box-sizing:border-box; margin:0; }
        @keyframes slideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .card  { background:#18181f; border:1px solid #2a2a38; border-radius:16px; }
        .btn   { cursor:pointer; border:none; font-family:'DM Sans',sans-serif; font-weight:600; transition:.18s; border-radius:9px; }
        .btn:hover  { filter:brightness(1.12); }
        .btn:active { transform:scale(.97); }
        input,select { background:#0e0e12; border:1px solid #2a2a38; color:#f0ede8; border-radius:9px; padding:9px 14px; font-family:'DM Sans',sans-serif; font-size:13px; outline:none; }
        input:focus,select:focus { border-color:#7c6af7; }
        th { font-size:11px; color:#555; text-transform:uppercase; letter-spacing:1px; font-family:'DM Mono',monospace; padding:8px 16px; text-align:left; font-weight:400; }
        td { padding:14px 16px; }
        tr:not(:last-child) td { border-bottom:1px solid #1a1a24; }
        .badge { display:inline-block; padding:3px 10px; border-radius:999px; font-size:11px; font-weight:600; font-family:'DM Mono',monospace; }
        .search { background:#18181f; border:1px solid #2a2a38; color:#f0ede8; border-radius:10px; padding:9px 16px; font-size:13px; outline:none; width:220px; }
        .search:focus { border-color:#7c6af7; }
        .search::placeholder { color:#444; }
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#2a2a38;border-radius:4px;}
      `}</style>

      {/* Header */}
      <header style={{ position:"sticky", top:0, zIndex:50, background:"rgba(14,14,18,.92)", backdropFilter:"blur(14px)", borderBottom:"1px solid #1e1e2c", padding:"14px 32px", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#7c6af7,#e76fff)", display:"grid", placeItems:"center", fontSize:16 }}>⚡</div>
        <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18 }}>ShopFlow</span>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#555", background:"#18181f", border:"1px solid #2a2a38", borderRadius:4, padding:"2px 7px" }}>inventory-service · :5001</span>
      </header>

      <div style={{ padding:"32px 32px 60px", maxWidth:1100, margin:"0 auto" }}>

        {/* ── Stats cards ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:32 }}>
          {[
            { label:"Total Products", value:items.length,          icon:"📦", color:"#7c6af7" },
            { label:"Total Stock",    value:`${totalStock} units`,  icon:"📊", color:"#0d9e6e" },
            { label:"Portfolio Value",value:formatINR(totalValue),  icon:"💰", color:"#a89af7" },
            { label:"Low Stock",      value:`${lowStock} items`,    icon:"⚠️", color:"#f09000" },
          ].map((s)=>(
            <div key={s.label} className="card" style={{ padding:"18px 20px" }}>
              <p style={{ fontSize:11, color:"#555", textTransform:"uppercase", letterSpacing:1, marginBottom:8, fontFamily:"'DM Mono',monospace" }}>
                {s.icon} {s.label}
              </p>
              <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Add / Edit form ── */}
        {showForm && (
          <div className="card" style={{ padding:24, marginBottom:24, animation:"slideIn .3s ease" }}>
            <p style={{ fontSize:12, color:"#888", textTransform:"uppercase", letterSpacing:1, fontFamily:"'DM Mono',monospace", marginBottom:16 }}>
              {editing ? "✏️ Edit Product" : "➕ New Product"} · POST /inventory
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:12, marginBottom:16 }}>
              {[["name","Product Name","text","Wireless Earbuds"],["price","Price (₹)","number","2999"],["quantity","Stock Qty","number","30"]].map(([k,label,type,ph])=>(
                <div key={k}>
                  <label style={{ fontSize:11, color:"#666", display:"block", marginBottom:5 }}>{label}</label>
                  <input type={type} placeholder={ph} value={form[k]} onChange={(e)=>setForm((p)=>({...p,[k]:e.target.value}))} style={{ width:"100%" }} />
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button className="btn" onClick={()=>{ setShowForm(false); setEditing(null); setForm(BLANK); }}
                style={{ padding:"9px 18px", background:"#1e1e28", color:"#888", fontSize:13 }}>Cancel</button>
              <button className="btn" onClick={handleSave} disabled={saving}
                style={{ padding:"9px 24px", background:"linear-gradient(135deg,#7c6af7,#a06af7)", color:"#fff", fontSize:13 }}>
                {saving?"Saving…": editing?"Save Changes":"Add Product"}
              </button>
            </div>
          </div>
        )}

        {/* ── Table header ── */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, marginBottom:3 }}>Inventory</h1>
            <p style={{ fontSize:12, color:"#555", fontFamily:"'DM Mono',monospace" }}>{filtered.length} products · GET /inventory</p>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <input className="search" placeholder="🔍 Search…" value={search} onChange={(e)=>setSearch(e.target.value)} />
            <select value={sort} onChange={(e)=>setSort(e.target.value)} style={{ width:130 }}>
              <option value="id">Sort: Default</option>
              <option value="price">Sort: Price</option>
              <option value="quantity">Sort: Stock</option>
            </select>
            {!showForm && (
              <button className="btn" onClick={()=>{ setShowForm(true); setEditing(null); setForm(BLANK); }}
                style={{ padding:"9px 18px", background:"linear-gradient(135deg,#7c6af7,#a06af7)", color:"#fff", fontSize:13 }}>
                + Add Product
              </button>
            )}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="card" style={{ overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead style={{ borderBottom:"1px solid #2a2a38" }}>
              <tr>
                <th>ID</th><th>Product</th><th>Price</th><th>Stock</th><th>Status</th><th>Value</th><th style={{ textAlign:"right", paddingRight:20 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i)=>(
                <tr key={item.id} style={{ animation:`slideIn .3s ease ${i*0.04}s both`, transition:"background .15s" }}
                  onMouseEnter={(e)=>{ e.currentTarget.style.background="#1a1a24"; }}
                  onMouseLeave={(e)=>{ e.currentTarget.style.background="transparent"; }}>
                  <td><span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"#444" }}>#{item.id}</span></td>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ width:38, height:38, borderRadius:10, background:"linear-gradient(135deg,#1a1a28,#252540)", display:"grid", placeItems:"center", fontSize:18 }}>
                        {EMOJI(item.name)}
                      </div>
                      <span style={{ fontWeight:500, fontSize:14 }}>{item.name}</span>
                    </div>
                  </td>
                  <td><span style={{ fontFamily:"'DM Mono',monospace", color:"#a89af7", fontWeight:600 }}>{formatINR(item.price)}</span></td>
                  <td>
                    <div>
                      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:14 }}>{item.quantity}</span>
                      <div style={{ width:60, height:3, background:"#1e1e2c", borderRadius:99, marginTop:5 }}>
                        <div style={{ height:"100%", borderRadius:99, width:`${Math.min(100,(item.quantity/50)*100)}%`, background: item.quantity>10?"#0d9e6e":item.quantity>0?"#f09000":"#e04040" }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{
                      background: item.quantity>10?"#0d9e6e18": item.quantity>0?"#f0900018":"#e0404018",
                      color:      item.quantity>10?"#0d9e6e": item.quantity>0?"#f09000":"#e04040",
                    }}>
                      {item.quantity>10?"✓ In Stock": item.quantity>0?"⚠ Low Stock":"✗ Out of Stock"}
                    </span>
                  </td>
                  <td><span style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:"#666" }}>{formatINR(item.price*item.quantity)}</span></td>
                  <td style={{ textAlign:"right", paddingRight:16 }}>
                    <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
                      <button className="btn" onClick={()=>startEdit(item)}
                        style={{ padding:"5px 12px", background:"#2a2a38", color:"#888", fontSize:12 }}>Edit</button>
                      <button className="btn" onClick={()=>deleteItem(item.id)}
                        style={{ padding:"5px 12px", background:"#e0404015", color:"#e04040", fontSize:12, border:"1px solid #e0404030" }}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length===0 && (
            <div style={{ textAlign:"center", padding:"60px 0", color:"#444" }}>
              <div style={{ fontSize:36, marginBottom:12 }}>📦</div>
              <p>{search ? `No products match "${search}"` : "No products yet. Add one above!"}</p>
            </div>
          )}
        </div>

        {/* Endpoint reference */}
        <div style={{ marginTop:24, padding:"14px 20px", background:"#18181f", border:"1px solid #2a2a38", borderRadius:12, fontFamily:"'DM Mono',monospace", fontSize:11, color:"#555", display:"flex", gap:24 }}>
          {[["GET /inventory","Fetch all"],["GET /inventory/:id","Get one"],["POST /inventory","Add item"],["PUT /inventory/:id","Update qty"]].map(([ep,desc])=>(
            <span key={ep}><span style={{ color:"#7c6af7" }}>{ep}</span> — {desc}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
