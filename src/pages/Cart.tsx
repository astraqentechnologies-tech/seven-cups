// import { useState, useEffect, useRef } from 'react';
// import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, Tag, Sparkles } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { useCart } from '../context/CartContext';
// import { useAuth } from '../context/AuthContext';

// const AF = "'Arial Black','Arial Bold',Gadget,sans-serif";

// export default function Cart() {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const { items, localItems, itemCount, total, updateQuantity, removeFromCart, updateLocalQuantity, removeFromLocalCart } = useCart();
//   const [mounted, setMounted] = useState(false);
//   const [removingIds, setRemovingIds] = useState<Set<string | number>>(new Set());
//   const [ripples, setRipples] = useState<{ id: number; x: number; y: number; btn: string }[]>([]);
//   const [qtyBump, setQtyBump] = useState<{ [key: string | number]: 'up' | 'down' | null }>({});
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const animRef = useRef<number>(0);

//   useEffect(() => { setMounted(true); }, []);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext('2d')!;
//     const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
//     resize();
//     const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = [];
//     for (let i = 0; i < 30; i++) {
//       particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: Math.random() * 1.8 + 0.8, alpha: Math.random() * 0.2 + 0.04 });
//     }
//     const draw = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       particles.forEach(p => {
//         p.x += p.vx; p.y += p.vy;
//         if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
//         if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
//         ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
//         ctx.fillStyle = `rgba(180,140,60,${p.alpha})`; ctx.fill();
//       });
//       particles.forEach((a, i) => particles.slice(i + 1).forEach(b => {
//         const dx = a.x - b.x, dy = a.y - b.y, dist = Math.sqrt(dx * dx + dy * dy);
//         if (dist < 80) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.strokeStyle = `rgba(180,140,60,${0.1 * (1 - dist / 80)})`; ctx.lineWidth = 0.5; ctx.stroke(); }
//       }));
//       animRef.current = requestAnimationFrame(draw);
//     };
//     draw();
//     return () => cancelAnimationFrame(animRef.current);
//   }, []);

//   const displayItems = user
//     ? items.map(item => ({
//         id: item.id, name: item.products?.name || '', image: item.products?.cover_image_url || '',
//         price: item.products?.price || 0, comparePrice: item.products?.compare_price || 0,
//         quantity: item.quantity,
//         onQty: (q: number) => updateQuantity(item.id, q),
//         onRemove: () => handleRemove(item.id),
//       }))
//     : localItems.map(item => ({
//         id: item.product.id, name: item.product.name, image: item.product.cover_image_url,
//         price: item.product.price, comparePrice: item.product.compare_price,
//         quantity: item.quantity,
//         onQty: (q: number) => updateLocalQuantity(item.product.id, q),
//         onRemove: () => handleRemove(item.product.id),
//       }));

//   const shipping = total >= 50 ? 0 : 5.99;

//   const handleRemove = (id: string | number) => {
//     setRemovingIds(prev => new Set([...prev, id]));
//     setTimeout(() => {
//       if (user) removeFromCart(id as string);
//       else removeFromLocalCart(id as string | number);
//       setRemovingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
//     }, 450);
//   };

//   const addRipple = (e: React.MouseEvent<HTMLButtonElement>, btn: string) => {
//     const rect = e.currentTarget.getBoundingClientRect();
//     const id = Date.now() + Math.random();
//     setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top, btn }]);
//     setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 700);
//   };

//   const bumpQty = (id: string | number, dir: 'up' | 'down') => {
//     setQtyBump(q => ({ ...q, [id]: dir }));
//     setTimeout(() => setQtyBump(q => ({ ...q, [id]: null })), 300);
//   };

//   return (
//     <>
//       <style>{`
//         * { box-sizing: border-box; }
//         .af { font-family: ${AF}; }

//         .cart-page {
//           min-height: 100vh;
//           background: #fafaf8;
//           padding-top: 80px;
//           position: relative;
//           overflow: hidden;
//         }

//         .bg-canvas {
//           position: absolute; inset: 0;
//           width: 100%; height: 100%;
//           pointer-events: none; z-index: 0;
//         }

//         .orb {
//           position: absolute; border-radius: 50%; pointer-events: none;
//           animation: orbFloat 9s ease-in-out infinite;
//         }
//         .orb1 { width:320px;height:320px; background:radial-gradient(circle,rgba(251,191,36,0.07) 0%,transparent 70%); top:-80px;left:-100px; }
//         .orb2 { width:240px;height:240px; background:radial-gradient(circle,rgba(120,100,60,0.06) 0%,transparent 70%); bottom:60px;right:-60px; animation-delay:-4s; }
//         .orb3 { width:180px;height:180px; background:radial-gradient(circle,rgba(251,191,36,0.04) 0%,transparent 70%); top:40%;left:55%; animation-delay:-7s; }
//         @keyframes orbFloat {
//           0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-18px) scale(1.04)}
//         }

//         .inner { max-width:1280px; margin:0 auto; padding:48px 24px; position:relative;z-index:1; }

//         .page-header {
//           display:flex; align-items:center; gap:12px; margin-bottom:40px;
//           animation: headerSlide 0.6s cubic-bezier(0.16,1,0.3,1) both;
//         }
//         @keyframes headerSlide {
//           from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)}
//         }
//         .header-icon-wrap {
//           width:48px;height:48px;border-radius:14px;background:#1c1917;
//           display:flex;align-items:center;justify-content:center;
//           animation:iconPop 0.6s cubic-bezier(0.34,1.56,0.64,1) both 0.1s;
//           position:relative;overflow:hidden;
//         }
//         @keyframes iconPop {
//           from{opacity:0;transform:scale(0.5) rotate(-15deg)} to{opacity:1;transform:scale(1) rotate(0)}
//         }
//         .header-icon-ring {
//           position:absolute;inset:-3px;border-radius:17px;
//           border:2px solid rgba(251,191,36,0.35);
//           animation:ringPulse 2.5s ease-in-out infinite;
//         }
//         @keyframes ringPulse {
//           0%,100%{transform:scale(1);opacity:0.4} 50%{transform:scale(1.14);opacity:0}
//         }
//         .cart-icon-anim { animation:cartWiggle 3s ease-in-out infinite; }
//         @keyframes cartWiggle {
//           0%,100%{transform:rotate(0)} 20%{transform:rotate(-8deg)} 40%{transform:rotate(8deg)} 60%{transform:rotate(-4deg)} 80%{transform:rotate(4deg)}
//         }
//         .page-title {
//           font-family:${AF}; font-size:36px; font-weight:900;
//           color:#1c1917; margin:0; letter-spacing:-0.5px;
//         }
//         .item-badge {
//           background:#fbbf24; color:#1c1917;
//           font-family:${AF}; font-size:12px; font-weight:900;
//           padding:4px 12px; border-radius:20px; letter-spacing:0.04em;
//           animation:badgePop 0.5s cubic-bezier(0.34,1.56,0.64,1) both 0.3s;
//         }
//         @keyframes badgePop {
//           from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)}
//         }

//         .grid-layout { display:grid; grid-template-columns:1fr; gap:36px; }
//         @media(min-width:1024px){ .grid-layout{grid-template-columns:2fr 1fr;} }

//         .items-col { display:flex; flex-direction:column; gap:14px; }

//         .cart-item {
//           background:#fff; border-radius:22px;
//           border:1px solid rgba(231,229,228,0.9);
//           padding:20px; display:flex; gap:18px; align-items:flex-start;
//           transition: all 0.45s cubic-bezier(0.16,1,0.3,1);
//           position:relative; overflow:hidden;
//         }
//         .cart-item.entering { animation:itemSlideIn 0.5s cubic-bezier(0.16,1,0.3,1) both; }
//         @keyframes itemSlideIn {
//           from{opacity:0;transform:translateX(-24px) scale(0.97)} to{opacity:1;transform:translateX(0) scale(1)}
//         }
//         .cart-item.removing {
//           opacity:0; transform:translateX(40px) scale(0.93);
//           border-color:transparent;
//         }
//         .cart-item::before {
//           content:''; position:absolute; left:0; top:0; bottom:0;
//           width:3px; background:#fbbf24; border-radius:3px 0 0 3px;
//           transform:scaleY(0); transform-origin:center;
//           transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
//         }
//         .cart-item:hover::before { transform:scaleY(1); }
//         .cart-item:hover {
//           border-color:rgba(251,191,36,0.25);
//           box-shadow:0 8px 32px rgba(0,0,0,0.07);
//           transform:translateY(-2px);
//         }

//         .item-img-wrap {
//           width:84px; height:84px; border-radius:16px;
//           overflow:hidden; flex-shrink:0; background:#f5f4f0;
//           position:relative;
//         }
//         .item-img-wrap img {
//           width:100%; height:100%; object-fit:cover;
//           transition:transform 0.4s ease;
//         }
//         .cart-item:hover .item-img-wrap img { transform:scale(1.08); }
//         .img-shine {
//           position:absolute; inset:0;
//           background:linear-gradient(135deg,rgba(255,255,255,0.2) 0%,transparent 60%);
//           pointer-events:none;
//         }

//         .item-name {
//           font-family:${AF}; font-size:15px; font-weight:900;
//           color:#1c1917; margin:0 0 4px; line-height:1.3;
//         }
//         .item-price { color:#d97706; font-family:${AF}; font-weight:900; font-size:15px; }
//         .item-compare { color:#a8a29e; font-size:12px; text-decoration:line-through; font-family:${AF}; margin-left:6px; }

//         .qty-wrap {
//           display:flex; align-items:center; gap:0;
//           background:#f5f4f0; border-radius:40px;
//           padding:4px; border:1px solid #e7e5e0;
//           overflow:hidden;
//         }
//         .qty-btn {
//           width:28px; height:28px; border-radius:50%;
//           border:none; background:transparent; cursor:pointer;
//           display:flex; align-items:center; justify-content:center;
//           transition:all 0.2s ease; position:relative; overflow:hidden;
//           color:#57534e;
//         }
//         .qty-btn:hover { background:#1c1917; color:#fbbf24; transform:scale(1.1); }
//         .qty-btn:active { transform:scale(0.92); }

//         .qty-num {
//           min-width:32px; text-align:center;
//           font-family:${AF}; font-size:13px; font-weight:900; color:#1c1917;
//           transition:all 0.2s cubic-bezier(0.34,1.56,0.64,1);
//         }
//         .qty-num.bump-up { animation:qtyUp 0.25s cubic-bezier(0.34,1.56,0.64,1); }
//         .qty-num.bump-down { animation:qtyDown 0.25s cubic-bezier(0.34,1.56,0.64,1); }
//         @keyframes qtyUp {
//           0%{transform:translateY(6px);opacity:0.3} 100%{transform:translateY(0);opacity:1}
//         }
//         @keyframes qtyDown {
//           0%{transform:translateY(-6px);opacity:0.3} 100%{transform:translateY(0);opacity:1}
//         }

//         .remove-btn {
//           display:flex; align-items:center; gap:4px;
//           background:none; border:none; cursor:pointer;
//           color:#fca5a5; font-family:${AF}; font-size:11px;
//           padding:4px 8px; border-radius:8px;
//           transition:all 0.2s ease;
//         }
//         .remove-btn:hover { background:#fef2f2; color:#ef4444; transform:scale(1.05); }
//         .remove-btn:active { transform:scale(0.95); }

//         .ripple {
//           position:absolute; border-radius:50%;
//           background:rgba(255,255,255,0.3);
//           width:50px; height:50px;
//           margin-top:-25px; margin-left:-25px;
//           transform:scale(0); animation:rippleGo 0.65s linear;
//           pointer-events:none;
//         }
//         @keyframes rippleGo { to{transform:scale(7);opacity:0} }

//         .free-ship-banner {
//           display:flex; align-items:center; gap:12px;
//           background:#fffbeb; border:1px solid #fde68a;
//           border-radius:18px; padding:14px 18px;
//           animation:bannerSlide 0.5s cubic-bezier(0.16,1,0.3,1) both;
//         }
//         @keyframes bannerSlide {
//           from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)}
//         }
//         .tag-icon-anim { animation:tagBounce 2s ease-in-out infinite; }
//         @keyframes tagBounce {
//           0%,100%{transform:rotate(0) scale(1)} 50%{transform:rotate(-12deg) scale(1.1)}
//         }

//         .summary-card {
//           background:#fff; border-radius:24px;
//           border:1px solid rgba(231,229,228,0.9);
//           padding:28px;
//           position:sticky; top:96px;
//           animation:summaryIn 0.6s cubic-bezier(0.16,1,0.3,1) both 0.2s;
//           transition:box-shadow 0.3s ease, transform 0.3s ease;
//         }
//         @keyframes summaryIn {
//           from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)}
//         }
//         .summary-card:hover {
//           box-shadow:0 16px 48px rgba(0,0,0,0.07);
//           transform:translateY(-2px);
//         }
//         .summary-title {
//           font-family:${AF}; font-size:20px; font-weight:900;
//           color:#1c1917; margin:0 0 22px;
//         }
//         .summary-row {
//           display:flex; justify-content:space-between; align-items:center;
//           font-size:13px; padding:6px 0;
//         }
//         .summary-label { color:#78716c; font-family:${AF}; }
//         .summary-val { color:#1c1917; font-family:${AF}; font-weight:900; }
//         .free-badge {
//           color:#059669; font-family:${AF}; font-weight:900;
//           animation:freePop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
//         }
//         @keyframes freePop { from{opacity:0;transform:scale(0.6)} to{opacity:1;transform:scale(1)} }
//         .free-applied {
//           background:#ecfdf5; border-radius:10px; padding:7px 12px;
//           display:flex; align-items:center; gap:6px;
//           animation:appliedSlide 0.4s ease both;
//         }
//         @keyframes appliedSlide { from{opacity:0;height:0;padding:0} to{opacity:1} }
//         .divider-line { height:1px; background:#f0ede8; margin:14px 0; }
//         .total-row {
//           display:flex; justify-content:space-between; align-items:baseline;
//           margin-bottom:22px;
//         }
//         .total-label { font-family:${AF}; font-weight:900; color:#1c1917; font-size:15px; }
//         .total-amt {
//           font-family:${AF}; font-weight:900; color:#1c1917; font-size:24px;
//           animation:totalPop 0.4s cubic-bezier(0.34,1.56,0.64,1);
//         }
//         @keyframes totalPop {
//           0%{transform:scale(0.85);opacity:0.5} 100%{transform:scale(1);opacity:1}
//         }

//         .checkout-btn {
//           width:100%; display:flex; align-items:center; justify-content:center;
//           gap:8px; padding:16px;
//           background:#1c1917; color:#fff; border:none; border-radius:16px;
//           font-family:${AF}; font-size:13px; font-weight:900;
//           letter-spacing:0.08em; cursor:pointer;
//           position:relative; overflow:hidden;
//           transition:all 0.3s ease;
//         }
//         .checkout-btn::before {
//           content:''; position:absolute; inset:0;
//           background:linear-gradient(135deg,#92400e,#78350f);
//           opacity:0; transition:opacity 0.3s ease;
//         }
//         .checkout-btn:hover::before { opacity:1; }
//         .checkout-btn:hover { transform:translateY(-2px); box-shadow:0 12px 32px rgba(0,0,0,0.2); }
//         .checkout-btn:active { transform:scale(0.98); }
//         .checkout-btn span,.checkout-btn svg { position:relative;z-index:1; }
//         .arrow-anim { transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
//         .checkout-btn:hover .arrow-anim { transform:translateX(5px); }

//         .continue-btn {
//           width:100%; background:none; border:none; cursor:pointer;
//           color:#a8a29e; font-family:${AF}; font-size:12px;
//           margin-top:12px; padding:8px; border-radius:10px;
//           transition:all 0.2s ease; letter-spacing:0.04em;
//         }
//         .continue-btn:hover { color:#d97706; background:#fffbeb; }

//         .empty-wrap {
//           text-align:center; padding:80px 24px;
//           background:#fff; border-radius:28px;
//           border:1px solid rgba(231,229,228,0.9);
//           animation:emptyIn 0.6s cubic-bezier(0.16,1,0.3,1) both;
//         }
//         @keyframes emptyIn {
//           from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)}
//         }
//         .empty-icon-wrap {
//           width:90px;height:90px;border-radius:50%;background:#f5f4f0;
//           display:flex;align-items:center;justify-content:center;
//           margin:0 auto 22px;
//           animation:emptyIconSpin 0.7s cubic-bezier(0.34,1.56,0.64,1) both 0.2s;
//           position:relative;
//         }
//         @keyframes emptyIconSpin {
//           from{opacity:0;transform:scale(0.4) rotate(-30deg)} to{opacity:1;transform:scale(1) rotate(0)}
//         }
//         .empty-ring {
//           position:absolute;inset:-5px;border-radius:50%;
//           border:2px dashed #e7e5e0;
//           animation:spinRing 12s linear infinite;
//         }
//         @keyframes spinRing { to{transform:rotate(360deg)} }
//         .empty-title { font-family:${AF};font-size:26px;font-weight:900;color:#1c1917;margin:0 0 10px; }
//         .empty-sub { color:#a8a29e;font-family:${AF};font-size:13px;margin:0 0 32px;letter-spacing:0.03em; }
//         .browse-btn {
//           padding:14px 36px; background:#1c1917; color:#fff;
//           border:none; border-radius:40px; cursor:pointer;
//           font-family:${AF}; font-size:13px; font-weight:900;
//           letter-spacing:0.08em; position:relative; overflow:hidden;
//           transition:all 0.3s ease;
//         }
//         .browse-btn::before {
//           content:'';position:absolute;inset:0;
//           background:linear-gradient(135deg,#92400e,#78350f);
//           opacity:0;transition:opacity 0.3s ease;
//         }
//         .browse-btn:hover::before{opacity:1;}
//         .browse-btn:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,0,0,0.18);}
//         .browse-btn span{position:relative;z-index:1;}
//       `}</style>

//       <div className='cart-page'>
//         <canvas ref={canvasRef} className='bg-canvas' />
//         <div className='orb orb1' /><div className='orb orb2' /><div className='orb orb3' />

//         <div className='inner'>
//           {/* Header */}
//           <div className='page-header'>
//             <div className='header-icon-wrap'>
//               <div className='header-icon-ring' />
//               <ShoppingCart className='cart-icon-anim' style={{ width: 22, height: 22, color: '#fbbf24', position: 'relative', zIndex: 1 }} />
//             </div>
//             <h1 className='page-title'>Shopping Cart</h1>
//             {itemCount > 0 && <span className='item-badge'>{itemCount} ITEMS</span>}
//           </div>

//           {displayItems.length === 0 ? (
//             <div className='empty-wrap'>
//               <div className='empty-icon-wrap'>
//                 <div className='empty-ring' />
//                 <ShoppingCart style={{ width: 38, height: 38, color: '#d6d3ce', position: 'relative', zIndex: 1 }} />
//               </div>
//               <h2 className='empty-title'>Your cart is empty</h2>
//               <p className='empty-sub'>Discover our exceptional teas and add your favorites.</p>
//               <button className='browse-btn' onClick={() => navigate('/products')}>
//                 <span>BROWSE ALL TEAS</span>
//               </button>
//             </div>
//           ) : (
//             <div className='grid-layout'>
//               {/* Items Column */}
//               <div className='items-col'>
//                 {displayItems.map((item, idx) => (
//                   <div
//                     key={item.id}
//                     className={`cart-item entering ${removingIds.has(item.id) ? 'removing' : ''}`}
//                     style={{ animationDelay: `${idx * 0.07}s` }}
//                   >
//                     <div className='item-img-wrap'>
//                       <img src={item.image || 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg'} alt={item.name} />
//                       <div className='img-shine' />
//                     </div>
//                     <div style={{ flex: 1, minWidth: 0 }}>
//                       <h3 className='item-name'>{item.name}</h3>
//                       <div style={{ marginBottom: 12 }}>
//                         <span className='item-price'>₹{(item.price * item.quantity).toFixed(2)}</span>
//                         {item.comparePrice > 0 && (
//                           <span className='item-compare'>₹{(item.comparePrice * item.quantity).toFixed(2)}</span>
//                         )}
//                       </div>
//                       <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//                         <div className='qty-wrap'>
//                           <button
//                             className='qty-btn'
//                             onClick={e => {
//                               addRipple(e, String(item.id) + 'down');
//                               bumpQty(item.id, 'down');
//                               item.onQty(item.quantity - 1);
//                             }}
//                           >
//                             {ripples.filter(r => r.btn === String(item.id) + 'down').map(r => (
//                               <span key={r.id} className='ripple' style={{ left: r.x, top: r.y }} />
//                             ))}
//                             <Minus style={{ width: 12, height: 12 }} />
//                           </button>
//                           <span className={`qty-num ${qtyBump[item.id] === 'up' ? 'bump-up' : qtyBump[item.id] === 'down' ? 'bump-down' : ''}`}>
//                             {item.quantity}
//                           </span>
//                           <button
//                             className='qty-btn'
//                             onClick={e => {
//                               addRipple(e, String(item.id) + 'up');
//                               bumpQty(item.id, 'up');
//                               item.onQty(item.quantity + 1);
//                             }}
//                           >
//                             {ripples.filter(r => r.btn === String(item.id) + 'up').map(r => (
//                               <span key={r.id} className='ripple' style={{ left: r.x, top: r.y }} />
//                             ))}
//                             <Plus style={{ width: 12, height: 12 }} />
//                           </button>
//                         </div>
//                         <button className='remove-btn' onClick={item.onRemove}>
//                           <Trash2 style={{ width: 13, height: 13 }} /> REMOVE
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}

//                 {shipping > 0 && (
//                   <div className='free-ship-banner'>
//                     <Tag className='tag-icon-anim' style={{ width: 20, height: 20, color: '#d97706', flexShrink: 0 }} />
//                     <p style={{ margin: 0, color: '#92400e', fontSize: 13, fontFamily: AF }}>
//                       Add <strong>₹{(50 - total).toFixed(2)}</strong> more to unlock <strong>FREE SHIPPING!</strong>
//                     </p>
//                   </div>
//                 )}
//               </div>

//               {/* Summary Column */}
//               <div>
//                 <div className='summary-card'>
//                   <h2 className='summary-title'>ORDER SUMMARY</h2>
//                   <div style={{ marginBottom: 16 }}>
//                     <div className='summary-row'>
//                       <span className='summary-label'>Subtotal ({itemCount} items)</span>
//                       <span className='summary-val'>₹{total.toFixed(2)}</span>
//                     </div>
//                     <div className='summary-row'>
//                       <span className='summary-label'>Shipping</span>
//                       {shipping === 0
//                         ? <span className='free-badge'>FREE</span>
//                         : <span className='summary-val'>₹{shipping.toFixed(2)}</span>
//                       }
//                     </div>
//                     {shipping === 0 && (
//                       <div className='free-applied'>
//                         <Sparkles style={{ width: 14, height: 14, color: '#059669' }} />
//                         <span style={{ color: '#059669', fontSize: 12, fontFamily: AF, fontWeight: 900 }}>FREE SHIPPING APPLIED!</span>
//                       </div>
//                     )}
//                   </div>
//                   <div className='divider-line' />
//                   <div className='total-row'>
//                     <span className='total-label'>TOTAL</span>
//                     <span className='total-amt'>₹{(total + shipping).toFixed(2)}</span>
//                   </div>
//                   <button className='checkout-btn' onClick={() => navigate('/checkout')}>
//                     <span>PROCEED TO CHECKOUT</span>
//                     <ArrowRight className='arrow-anim' style={{ width: 16, height: 16 }} />
//                   </button>
//                   <button className='continue-btn' onClick={() => navigate('/products')}>
//                     ← CONTINUE SHOPPING
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }



import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, Tag, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const AF = "'Arial Black','Arial Bold',Gadget,sans-serif";

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, localItems, itemCount, total, updateQuantity, removeFromCart, updateLocalQuantity, removeFromLocalCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const [removingIds, setRemovingIds] = useState<Set<string | number>>(new Set());
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; btn: string }[]>([]);
  const [qtyBump, setQtyBump] = useState<{ [key: string | number]: 'up' | 'down' | null }>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = [];
    for (let i = 0; i < 30; i++) {
      particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: Math.random() * 1.8 + 0.8, alpha: Math.random() * 0.2 + 0.04 });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,140,60,${p.alpha})`; ctx.fill();
      });
      particles.forEach((a, i) => particles.slice(i + 1).forEach(b => {
        const dx = a.x - b.x, dy = a.y - b.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.strokeStyle = `rgba(180,140,60,${0.1 * (1 - dist / 80)})`; ctx.lineWidth = 0.5; ctx.stroke(); }
      }));
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // ✅ handleRemove pehle define karo (displayItems se pehle)
  const handleRemove = (id: string | number) => {
    setRemovingIds(prev => new Set([...prev, id]));
    setTimeout(() => {
      if (user) removeFromCart(id as string);
      else removeFromLocalCart(id as string | number);
      setRemovingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    }, 450);
  };

  // ✅ image_url sahi, price aur comparePrice Number() mein wrap
  const displayItems = user
    ? items.map(item => ({
        id: item.id,
        name: item.products?.name || '',
        image: item.products?.image_url || '',
        price: Number(item.products?.price || 0),
        comparePrice: Number(item.products?.compare_price || 0),
        quantity: item.quantity,
        onQty: (q: number) => updateQuantity(item.id, q),
        onRemove: () => handleRemove(item.id),
      }))
    : localItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        image: item.product.image_url || '',
        price: Number(item.product.price || 0),
        comparePrice: Number(item.product.compare_price || 0),
        quantity: item.quantity,
        onQty: (q: number) => updateLocalQuantity(item.product.id, q),
        onRemove: () => handleRemove(item.product.id),
      }));

  const shipping = total >= 500 ? 0 : 59;

  const addRipple = (e: React.MouseEvent<HTMLButtonElement>, btn: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top, btn }]);
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 700);
  };

  const bumpQty = (id: string | number, dir: 'up' | 'down') => {
    setQtyBump(q => ({ ...q, [id]: dir }));
    setTimeout(() => setQtyBump(q => ({ ...q, [id]: null })), 300);
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .af { font-family: ${AF}; }

        .cart-page {
          min-height: 100vh;
          background: #fafaf8;
          padding-top: 80px;
          position: relative;
          overflow: hidden;
        }

        .bg-canvas {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          pointer-events: none; z-index: 0;
        }

        .orb {
          position: absolute; border-radius: 50%; pointer-events: none;
          animation: orbFloat 9s ease-in-out infinite;
        }
        .orb1 { width:320px;height:320px; background:radial-gradient(circle,rgba(251,191,36,0.07) 0%,transparent 70%); top:-80px;left:-100px; }
        .orb2 { width:240px;height:240px; background:radial-gradient(circle,rgba(120,100,60,0.06) 0%,transparent 70%); bottom:60px;right:-60px; animation-delay:-4s; }
        .orb3 { width:180px;height:180px; background:radial-gradient(circle,rgba(251,191,36,0.04) 0%,transparent 70%); top:40%;left:55%; animation-delay:-7s; }
        @keyframes orbFloat {
          0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-18px) scale(1.04)}
        }

        .inner { max-width:1280px; margin:0 auto; padding:48px 24px; position:relative;z-index:1; }

        .page-header {
          display:flex; align-items:center; gap:12px; margin-bottom:40px;
          animation: headerSlide 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes headerSlide {
          from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)}
        }
        .header-icon-wrap {
          width:48px;height:48px;border-radius:14px;background:#1c1917;
          display:flex;align-items:center;justify-content:center;
          animation:iconPop 0.6s cubic-bezier(0.34,1.56,0.64,1) both 0.1s;
          position:relative;overflow:hidden;
        }
        @keyframes iconPop {
          from{opacity:0;transform:scale(0.5) rotate(-15deg)} to{opacity:1;transform:scale(1) rotate(0)}
        }
        .header-icon-ring {
          position:absolute;inset:-3px;border-radius:17px;
          border:2px solid rgba(251,191,36,0.35);
          animation:ringPulse 2.5s ease-in-out infinite;
        }
        @keyframes ringPulse {
          0%,100%{transform:scale(1);opacity:0.4} 50%{transform:scale(1.14);opacity:0}
        }
        .cart-icon-anim { animation:cartWiggle 3s ease-in-out infinite; }
        @keyframes cartWiggle {
          0%,100%{transform:rotate(0)} 20%{transform:rotate(-8deg)} 40%{transform:rotate(8deg)} 60%{transform:rotate(-4deg)} 80%{transform:rotate(4deg)}
        }
        .page-title {
          font-family:${AF}; font-size:36px; font-weight:900;
          color:#1c1917; margin:0; letter-spacing:-0.5px;
        }
        .item-badge {
          background:#fbbf24; color:#1c1917;
          font-family:${AF}; font-size:12px; font-weight:900;
          padding:4px 12px; border-radius:20px; letter-spacing:0.04em;
          animation:badgePop 0.5s cubic-bezier(0.34,1.56,0.64,1) both 0.3s;
        }
        @keyframes badgePop {
          from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)}
        }

        .grid-layout { display:grid; grid-template-columns:1fr; gap:36px; }
        @media(min-width:1024px){ .grid-layout{grid-template-columns:2fr 1fr;} }

        .items-col { display:flex; flex-direction:column; gap:14px; }

        .cart-item {
          background:#fff; border-radius:22px;
          border:1px solid rgba(231,229,228,0.9);
          padding:20px; display:flex; gap:18px; align-items:flex-start;
          transition: all 0.45s cubic-bezier(0.16,1,0.3,1);
          position:relative; overflow:hidden;
        }
        .cart-item.entering { animation:itemSlideIn 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes itemSlideIn {
          from{opacity:0;transform:translateX(-24px) scale(0.97)} to{opacity:1;transform:translateX(0) scale(1)}
        }
        .cart-item.removing {
          opacity:0; transform:translateX(40px) scale(0.93);
          border-color:transparent;
        }
        .cart-item::before {
          content:''; position:absolute; left:0; top:0; bottom:0;
          width:3px; background:#fbbf24; border-radius:3px 0 0 3px;
          transform:scaleY(0); transform-origin:center;
          transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .cart-item:hover::before { transform:scaleY(1); }
        .cart-item:hover {
          border-color:rgba(251,191,36,0.25);
          box-shadow:0 8px 32px rgba(0,0,0,0.07);
          transform:translateY(-2px);
        }

        .item-img-wrap {
          width:84px; height:84px; border-radius:16px;
          overflow:hidden; flex-shrink:0; background:#f5f4f0;
          position:relative;
        }
        .item-img-wrap img {
          width:100%; height:100%; object-fit:cover;
          transition:transform 0.4s ease;
        }
        .cart-item:hover .item-img-wrap img { transform:scale(1.08); }
        .img-shine {
          position:absolute; inset:0;
          background:linear-gradient(135deg,rgba(255,255,255,0.2) 0%,transparent 60%);
          pointer-events:none;
        }

        .item-name {
          font-family:${AF}; font-size:15px; font-weight:900;
          color:#1c1917; margin:0 0 4px; line-height:1.3;
        }
        .item-price { color:#d97706; font-family:${AF}; font-weight:900; font-size:15px; }
        .item-compare { color:#a8a29e; font-size:12px; text-decoration:line-through; font-family:${AF}; margin-left:6px; }

        .qty-wrap {
          display:flex; align-items:center; gap:0;
          background:#f5f4f0; border-radius:40px;
          padding:4px; border:1px solid #e7e5e0;
          overflow:hidden;
        }
        .qty-btn {
          width:28px; height:28px; border-radius:50%;
          border:none; background:transparent; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          transition:all 0.2s ease; position:relative; overflow:hidden;
          color:#57534e;
        }
        .qty-btn:hover { background:#1c1917; color:#fbbf24; transform:scale(1.1); }
        .qty-btn:active { transform:scale(0.92); }

        .qty-num {
          min-width:32px; text-align:center;
          font-family:${AF}; font-size:13px; font-weight:900; color:#1c1917;
          transition:all 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        .qty-num.bump-up { animation:qtyUp 0.25s cubic-bezier(0.34,1.56,0.64,1); }
        .qty-num.bump-down { animation:qtyDown 0.25s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes qtyUp {
          0%{transform:translateY(6px);opacity:0.3} 100%{transform:translateY(0);opacity:1}
        }
        @keyframes qtyDown {
          0%{transform:translateY(-6px);opacity:0.3} 100%{transform:translateY(0);opacity:1}
        }

        .remove-btn {
          display:flex; align-items:center; gap:4px;
          background:none; border:none; cursor:pointer;
          color:#fca5a5; font-family:${AF}; font-size:11px;
          padding:4px 8px; border-radius:8px;
          transition:all 0.2s ease;
        }
        .remove-btn:hover { background:#fef2f2; color:#ef4444; transform:scale(1.05); }
        .remove-btn:active { transform:scale(0.95); }

        .ripple {
          position:absolute; border-radius:50%;
          background:rgba(255,255,255,0.3);
          width:50px; height:50px;
          margin-top:-25px; margin-left:-25px;
          transform:scale(0); animation:rippleGo 0.65s linear;
          pointer-events:none;
        }
        @keyframes rippleGo { to{transform:scale(7);opacity:0} }

        .free-ship-banner {
          display:flex; align-items:center; gap:12px;
          background:#fffbeb; border:1px solid #fde68a;
          border-radius:18px; padding:14px 18px;
          animation:bannerSlide 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes bannerSlide {
          from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)}
        }
        .tag-icon-anim { animation:tagBounce 2s ease-in-out infinite; }
        @keyframes tagBounce {
          0%,100%{transform:rotate(0) scale(1)} 50%{transform:rotate(-12deg) scale(1.1)}
        }

        .summary-card {
          background:#fff; border-radius:24px;
          border:1px solid rgba(231,229,228,0.9);
          padding:28px;
          position:sticky; top:96px;
          animation:summaryIn 0.6s cubic-bezier(0.16,1,0.3,1) both 0.2s;
          transition:box-shadow 0.3s ease, transform 0.3s ease;
        }
        @keyframes summaryIn {
          from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)}
        }
        .summary-card:hover {
          box-shadow:0 16px 48px rgba(0,0,0,0.07);
          transform:translateY(-2px);
        }
        .summary-title {
          font-family:${AF}; font-size:20px; font-weight:900;
          color:#1c1917; margin:0 0 22px;
        }
        .summary-row {
          display:flex; justify-content:space-between; align-items:center;
          font-size:13px; padding:6px 0;
        }
        .summary-label { color:#78716c; font-family:${AF}; }
        .summary-val { color:#1c1917; font-family:${AF}; font-weight:900; }
        .free-badge {
          color:#059669; font-family:${AF}; font-weight:900;
          animation:freePop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes freePop { from{opacity:0;transform:scale(0.6)} to{opacity:1;transform:scale(1)} }
        .free-applied {
          background:#ecfdf5; border-radius:10px; padding:7px 12px;
          display:flex; align-items:center; gap:6px;
          animation:appliedSlide 0.4s ease both;
        }
        @keyframes appliedSlide { from{opacity:0;height:0;padding:0} to{opacity:1} }
        .divider-line { height:1px; background:#f0ede8; margin:14px 0; }
        .total-row {
          display:flex; justify-content:space-between; align-items:baseline;
          margin-bottom:22px;
        }
        .total-label { font-family:${AF}; font-weight:900; color:#1c1917; font-size:15px; }
        .total-amt {
          font-family:${AF}; font-weight:900; color:#1c1917; font-size:24px;
          animation:totalPop 0.4s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes totalPop {
          0%{transform:scale(0.85);opacity:0.5} 100%{transform:scale(1);opacity:1}
        }

        .checkout-btn {
          width:100%; display:flex; align-items:center; justify-content:center;
          gap:8px; padding:16px;
          background:#1c1917; color:#fff; border:none; border-radius:16px;
          font-family:${AF}; font-size:13px; font-weight:900;
          letter-spacing:0.08em; cursor:pointer;
          position:relative; overflow:hidden;
          transition:all 0.3s ease;
        }
        .checkout-btn::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(135deg,#92400e,#78350f);
          opacity:0; transition:opacity 0.3s ease;
        }
        .checkout-btn:hover::before { opacity:1; }
        .checkout-btn:hover { transform:translateY(-2px); box-shadow:0 12px 32px rgba(0,0,0,0.2); }
        .checkout-btn:active { transform:scale(0.98); }
        .checkout-btn span,.checkout-btn svg { position:relative;z-index:1; }
        .arrow-anim { transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .checkout-btn:hover .arrow-anim { transform:translateX(5px); }

        .continue-btn {
          width:100%; background:none; border:none; cursor:pointer;
          color:#a8a29e; font-family:${AF}; font-size:12px;
          margin-top:12px; padding:8px; border-radius:10px;
          transition:all 0.2s ease; letter-spacing:0.04em;
        }
        .continue-btn:hover { color:#d97706; background:#fffbeb; }

        .empty-wrap {
          text-align:center; padding:80px 24px;
          background:#fff; border-radius:28px;
          border:1px solid rgba(231,229,228,0.9);
          animation:emptyIn 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes emptyIn {
          from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)}
        }
        .empty-icon-wrap {
          width:90px;height:90px;border-radius:50%;background:#f5f4f0;
          display:flex;align-items:center;justify-content:center;
          margin:0 auto 22px;
          animation:emptyIconSpin 0.7s cubic-bezier(0.34,1.56,0.64,1) both 0.2s;
          position:relative;
        }
        @keyframes emptyIconSpin {
          from{opacity:0;transform:scale(0.4) rotate(-30deg)} to{opacity:1;transform:scale(1) rotate(0)}
        }
        .empty-ring {
          position:absolute;inset:-5px;border-radius:50%;
          border:2px dashed #e7e5e0;
          animation:spinRing 12s linear infinite;
        }
        @keyframes spinRing { to{transform:rotate(360deg)} }
        .empty-title { font-family:${AF};font-size:26px;font-weight:900;color:#1c1917;margin:0 0 10px; }
        .empty-sub { color:#a8a29e;font-family:${AF};font-size:13px;margin:0 0 32px;letter-spacing:0.03em; }
        .browse-btn {
          padding:14px 36px; background:#1c1917; color:#fff;
          border:none; border-radius:40px; cursor:pointer;
          font-family:${AF}; font-size:13px; font-weight:900;
          letter-spacing:0.08em; position:relative; overflow:hidden;
          transition:all 0.3s ease;
        }
        .browse-btn::before {
          content:'';position:absolute;inset:0;
          background:linear-gradient(135deg,#92400e,#78350f);
          opacity:0;transition:opacity 0.3s ease;
        }
        .browse-btn:hover::before{opacity:1;}
        .browse-btn:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,0,0,0.18);}
        .browse-btn span{position:relative;z-index:1;}
      `}</style>

      <div className='cart-page'>
        <canvas ref={canvasRef} className='bg-canvas' />
        <div className='orb orb1' /><div className='orb orb2' /><div className='orb orb3' />

        <div className='inner'>
          {/* Header */}
          <div className='page-header'>
            <div className='header-icon-wrap'>
              <div className='header-icon-ring' />
              <ShoppingCart className='cart-icon-anim' style={{ width: 22, height: 22, color: '#fbbf24', position: 'relative', zIndex: 1 }} />
            </div>
            <h1 className='page-title'>Shopping Cart</h1>
            {itemCount > 0 && <span className='item-badge'>{itemCount} ITEMS</span>}
          </div>

          {displayItems.length === 0 ? (
            <div className='empty-wrap'>
              <div className='empty-icon-wrap'>
                <div className='empty-ring' />
                <ShoppingCart style={{ width: 38, height: 38, color: '#d6d3ce', position: 'relative', zIndex: 1 }} />
              </div>
              <h2 className='empty-title'>Your cart is empty</h2>
              <p className='empty-sub'>Discover our exceptional teas and add your favorites.</p>
              <button className='browse-btn' onClick={() => navigate('/products')}>
                <span>BROWSE ALL TEAS</span>
              </button>
            </div>
          ) : (
            <div className='grid-layout'>
              {/* Items Column */}
              <div className='items-col'>
                {displayItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`cart-item entering ${removingIds.has(item.id) ? 'removing' : ''}`}
                    style={{ animationDelay: `${idx * 0.07}s` }}
                  >
                    <div className='item-img-wrap'>
                      <img
                        src={item.image || 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg'}
                        alt={item.name}
                      />
                      <div className='img-shine' />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 className='item-name'>{item.name}</h3>
                      <div style={{ marginBottom: 12 }}>
                        <span className='item-price'>₹{(item.price * item.quantity).toFixed(2)}</span>
                        {item.comparePrice > 0 && (
                          <span className='item-compare'>₹{(item.comparePrice * item.quantity).toFixed(2)}</span>
                        )}
                        {item.comparePrice > 0 && (
                          <span style={{
                            marginLeft: 8,
                            fontSize: 11,
                            fontFamily: AF,
                            fontWeight: 900,
                            color: '#ef4444',
                            background: '#fef2f2',
                            padding: '2px 7px',
                            borderRadius: 20,
                          }}>
                            SAVE ₹{((item.comparePrice - item.price) * item.quantity).toFixed(2)}
                          </span>
                        )}
                        <p style={{ margin: '3px 0 0', fontSize: 11, color: '#a8a29e', fontFamily: AF }}>
                          ₹{item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className='qty-wrap'>
                          <button
                            className='qty-btn'
                            onClick={e => {
                              addRipple(e, String(item.id) + 'down');
                              bumpQty(item.id, 'down');
                              item.onQty(item.quantity - 1);
                            }}
                          >
                            {ripples.filter(r => r.btn === String(item.id) + 'down').map(r => (
                              <span key={r.id} className='ripple' style={{ left: r.x, top: r.y }} />
                            ))}
                            <Minus style={{ width: 12, height: 12 }} />
                          </button>
                          <span className={`qty-num ${qtyBump[item.id] === 'up' ? 'bump-up' : qtyBump[item.id] === 'down' ? 'bump-down' : ''}`}>
                            {item.quantity}
                          </span>
                          <button
                            className='qty-btn'
                            onClick={e => {
                              addRipple(e, String(item.id) + 'up');
                              bumpQty(item.id, 'up');
                              item.onQty(item.quantity + 1);
                            }}
                          >
                            {ripples.filter(r => r.btn === String(item.id) + 'up').map(r => (
                              <span key={r.id} className='ripple' style={{ left: r.x, top: r.y }} />
                            ))}
                            <Plus style={{ width: 12, height: 12 }} />
                          </button>
                        </div>
                        <button className='remove-btn' onClick={item.onRemove}>
                          <Trash2 style={{ width: 13, height: 13 }} /> REMOVE
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {shipping > 0 && (
                  <div className='free-ship-banner'>
                    <Tag className='tag-icon-anim' style={{ width: 20, height: 20, color: '#d97706', flexShrink: 0 }} />
                    <p style={{ margin: 0, color: '#92400e', fontSize: 13, fontFamily: AF }}>
                      Add <strong>₹{(500 - total).toFixed(2)}</strong> more to unlock <strong>FREE SHIPPING!</strong>
                    </p>
                  </div>
                )}
              </div>

              {/* Summary Column */}
              <div>
                <div className='summary-card'>
                  <h2 className='summary-title'>ORDER SUMMARY</h2>
                  <div style={{ marginBottom: 16 }}>
                    <div className='summary-row'>
                      <span className='summary-label'>Subtotal ({itemCount} items)</span>
                      <span className='summary-val'>₹{total.toFixed(2)}</span>
                    </div>
                    <div className='summary-row'>
                      <span className='summary-label'>Shipping</span>
                      {shipping === 0
                        ? <span className='free-badge'>FREE</span>
                        : <span className='summary-val'>₹{shipping.toFixed(2)}</span>
                      }
                    </div>
                    {shipping === 0 && (
                      <div className='free-applied'>
                        <Sparkles style={{ width: 14, height: 14, color: '#059669' }} />
                        <span style={{ color: '#059669', fontSize: 12, fontFamily: AF, fontWeight: 900 }}>FREE SHIPPING APPLIED!</span>
                      </div>
                    )}
                  </div>
                  <div className='divider-line' />
                  <div className='total-row'>
                    <span className='total-label'>TOTAL</span>
                    <span className='total-amt'>₹{(total + shipping).toFixed(2)}</span>
                  </div>
                  <button className='checkout-btn' onClick={() => navigate('/checkout')}>
                    <span>PROCEED TO CHECKOUT</span>
                    <ArrowRight className='arrow-anim' style={{ width: 16, height: 16 }} />
                  </button>
                  <button className='continue-btn' onClick={() => navigate('/products')}>
                    ← CONTINUE SHOPPING
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}