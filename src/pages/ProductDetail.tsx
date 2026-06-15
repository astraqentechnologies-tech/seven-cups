// import { useState } from 'react'
// import {
//   ShoppingCart,
//   ChevronLeft,
//   Plus,
//   Minus,
//   Star,
//   Leaf,
//   Clock,
//   Thermometer,
//   Package,
//   CheckCircle,
//   Shield,
//   Truck
// } from 'lucide-react'
// import { useNavigate } from 'react-router-dom'
// import { useProduct } from '../hooks/useProducts'
// import { useCart } from '../context/CartContext'
// import { useAuth } from '../context/AuthContext'

// interface ProductReview {
//   id: number
//   reviewer_name: string
//   rating: number
//   title?: string
//   body: string
// }

// type Props = {
//   slug: string
// }

// const TABS = ['description', 'ingredients', 'brewing', 'reviews'] as const
// type Tab = typeof TABS[number]

// const arialBlack: React.CSSProperties = {
//   fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif',
//   fontWeight: 900,
// }

// export default function ProductDetail({ slug }: Props) {
//   const navigate = useNavigate()
//   const productHookData = useProduct(slug)
//   const { addToCart } = useCart()
//   const { user, profile } = useAuth()

//   const [qty, setQty] = useState(1)
//   const [adding, setAdding] = useState(false)
//   const [added, setAdded] = useState(false)
//   const [activeImage, setActiveImage] = useState(0)
//   const [activeTab, setActiveTab] = useState<Tab>('description')
//   const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' })
//   const [submitting, setSubmitting] = useState(false)
//   const [reviewSubmitted, setReviewSubmitted] = useState(false)

//   const API_BASE_URL = import.meta.env.VITE_API_URL

//   const getUnwrappedProduct = () => {
//     if (!productHookData) return null
//     if (productHookData.product) {
//       const p = productHookData.product as any
//       if (p.data && typeof p.data === 'object' && !Array.isArray(p.data)) return p.data
//       if (p.product && typeof p.product === 'object') return p.product
//       return p
//     }
//     return null
//   }

//   const product = getUnwrappedProduct()
//   const loading = productHookData?.loading

//   const handleAddToCart = async () => {
//     if (!product) return
//     setAdding(true)
//     await addToCart(product as any, qty)
//     setTimeout(() => {
//       setAdding(false)
//       setAdded(true)
//       setTimeout(() => setAdded(false), 2000)
//     }, 600)
//   }

//   const handleReview = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!user || !product) return
//     setSubmitting(true)
//     try {
//       const res = await fetch(`${API_BASE_URL}/reviews`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
//         body: JSON.stringify({
//           product_id: product.id,
//           reviewer_name: profile?.full_name || 'Anonymous',
//           ...reviewForm
//         })
//       })
//       if (res.ok) setReviewSubmitted(true)
//     } catch (err) {
//       console.error('Failed to submit review:', err)
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   // ── Loading skeleton ──────────────────────────────────────────────────────────
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-stone-50 pt-20">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
//           <div className="h-4 w-32 bg-stone-200 rounded mb-8" />
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
//             <div className="aspect-square bg-stone-200 rounded-3xl" />
//             <div className="space-y-4 pt-4">
//               <div className="h-3 w-24 bg-stone-200 rounded" />
//               <div className="h-10 w-3/4 bg-stone-200 rounded" />
//               <div className="h-4 bg-stone-200 rounded" />
//               <div className="h-4 w-5/6 bg-stone-200 rounded" />
//               <div className="h-12 w-1/3 bg-stone-200 rounded mt-4" />
//               <div className="h-14 bg-stone-200 rounded-2xl mt-6" />
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // ── Not found ─────────────────────────────────────────────────────────────────
//   if (!product || !product.name) {
//     return (
//       <div className="min-h-screen bg-stone-50 pt-20 flex items-center justify-center px-4">
//         <div className="text-center">
//           <Package className="w-14 h-14 text-stone-200 mx-auto mb-4" />
//           <p className="text-stone-500 text-lg mb-2 font-medium">Product not found</p>
//           <p className="text-stone-400 text-sm mb-6">This tea may have been moved or removed.</p>
//           <button
//             onClick={() => navigate('/products')}
//             className="px-6 py-3 bg-stone-900 text-white text-sm font-semibold rounded-full hover:bg-amber-600 transition-colors"
//           >
//             Browse all teas
//           </button>
//         </div>
//       </div>
//     )
//   }

//   // ── Derived data ──────────────────────────────────────────────────────────────
//   const images: string[] =
//     product.product_images?.length > 0
//       ? [...product.product_images]
//           .sort((a: any, b: any) => a.sort_order - b.sort_order)
//           .map((i: any) => i.url)
//       : [product.image_url || 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg']

//   const comparePrice = Number(product.compare_price) || 0
//   const price = Number(product.price) || 0
//   const discount = comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0
//   const productReviews: ProductReview[] = product.reviews || []
//   const avgRating = productReviews.length
//     ? (productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length).toFixed(1)
//     : null

//   const badges = [
//     product.is_new_arrival && 'New Arrival',
//     product.is_best_seller && 'Best Seller',
//     product.is_featured && 'Featured',
//   ].filter(Boolean)

//   const brewingMeta = [
//     product.steep_time && { icon: Clock, label: 'Steep time', value: product.steep_time },
//     product.temperature && { icon: Thermometer, label: 'Temperature', value: product.temperature },
//     product.weight_grams && { icon: Leaf, label: 'Net weight', value: `${product.weight_grams}g` },
//   ].filter(Boolean) as { icon: any; label: string; value: string }[]

//   // ── Page ──────────────────────────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen bg-stone-50 pt-20">

//       {/* ── Breadcrumb ── */}
//       <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-2">
//         <button
//           onClick={() => navigate('/products')}
//           className="inline-flex items-center gap-1.5 text-stone-400 hover:text-amber-600 text-sm transition-colors"
//         >
//           <ChevronLeft className="w-4 h-4" />
//           All Teas
//         </button>
//       </div>

//       {/* ── Main product grid ── */}
//       <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">

//           {/* LEFT — Images */}
//           <div className="space-y-3">
//             <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-stone-100 shadow-sm">
//               <img
//                 src={images[activeImage]}
//                 alt={product.name}
//                 className="w-full h-full object-cover transition-opacity duration-300"
//               />
//               {discount > 0 && (
//                 <span className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
//                   -{discount}%
//                 </span>
//               )}
//               {badges[0] && (
//                 <span className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
//                   {badges[0]}
//                 </span>
//               )}
//             </div>

//             {images.length > 1 && (
//               <div className="flex gap-2 overflow-x-auto pb-1">
//                 {images.map((src, i) => (
//                   <button
//                     key={i}
//                     onClick={() => setActiveImage(i)}
//                     className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${
//                       activeImage === i ? 'border-amber-500 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
//                     }`}
//                   >
//                     <img src={src} alt="" className="w-full h-full object-cover" />
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* RIGHT — Info */}
//           <div className="flex flex-col">

//             {/* Category pill */}
//             {product.category?.name && (
//               <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full w-fit mb-3">
//                 <Leaf className="w-3 h-3" />
//                 {product.category.name}
//               </span>
//             )}

//             {/* Name — Arial Black */}
//             <h1
//               style={arialBlack}
//               className="text-3xl sm:text-4xl text-stone-900 leading-tight mb-3"
//             >
//               {product.name}
//             </h1>

//             {/* Rating row */}
//             {avgRating && (
//               <div className="flex items-center gap-2 mb-4">
//                 <div className="flex gap-0.5">
//                   {[1,2,3,4,5].map(n => (
//                     <Star
//                       key={n}
//                       className={`w-4 h-4 ${n <= Math.round(Number(avgRating)) ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-200'}`}
//                     />
//                   ))}
//                 </div>
//                 <span className="text-sm font-semibold text-stone-700">{avgRating}</span>
//                 <span className="text-sm text-stone-400">({productReviews.length} reviews)</span>
//               </div>
//             )}

//             {/* Description */}
//             <p className="text-stone-500 text-sm sm:text-base leading-relaxed mb-6">
//               {product.description || 'No description available.'}
//             </p>

//             {/* Brewing quick-meta */}
//             {brewingMeta.length > 0 && (
//               <div className="grid grid-cols-3 gap-3 mb-6">
//                 {brewingMeta.map(({ icon: Icon, label, value }) => (
//                   <div key={label} className="bg-white rounded-2xl border border-stone-100 p-3 text-center">
//                     <Icon className="w-4 h-4 text-amber-500 mx-auto mb-1" />
//                     <p className="text-[10px] text-stone-400 uppercase tracking-wide">{label}</p>
//                     <p className="text-xs font-semibold text-stone-700 mt-0.5">{value}</p>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Price — Arial Black */}
//             <div className="flex items-baseline gap-3 mb-6">
//               <span style={arialBlack} className="text-3xl sm:text-4xl text-stone-900">
//                 ₹{price.toFixed(2)}
//               </span>
//               {comparePrice > price && (
//                 <span className="text-lg text-stone-400 line-through">₹{comparePrice.toFixed(2)}</span>
//               )}
//               {discount > 0 && (
//                 <span className="text-sm font-bold text-red-500">Save {discount}%</span>
//               )}
//             </div>

//             {/* Qty + Add to Cart */}
//             <div className="flex items-center gap-3 mb-5">
//               <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-2xl px-3 py-2 shadow-sm">
//                 <button
//                   onClick={() => setQty(q => Math.max(1, q - 1))}
//                   className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-stone-100 transition-colors text-stone-600"
//                   aria-label="Decrease quantity"
//                 >
//                   <Minus className="w-3.5 h-3.5" />
//                 </button>
//                 <span className="w-8 text-center font-bold text-stone-800 text-sm">{qty}</span>
//                 <button
//                   onClick={() => setQty(q => q + 1)}
//                   className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-stone-100 transition-colors text-stone-600"
//                   aria-label="Increase quantity"
//                 >
//                   <Plus className="w-3.5 h-3.5" />
//                 </button>
//               </div>
//               <button
//                 onClick={handleAddToCart}
//                 disabled={adding}
//                 className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-sm ${
//                   added
//                     ? 'bg-emerald-500 text-white'
//                     : 'bg-stone-900 hover:bg-amber-600 text-white active:scale-95'
//                 }`}
//               >
//                 {added ? (
//                   <><CheckCircle className="w-4 h-4" /> Added to Cart!</>
//                 ) : adding ? (
//                   <><ShoppingCart className="w-4 h-4 animate-bounce" /> Adding...</>
//                 ) : (
//                   <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
//                 )}
//               </button>
//             </div>

//             {/* Trust badges */}
//             <div className="grid grid-cols-3 gap-2 pt-4 border-t border-stone-100">
//               {[
//                 { icon: Truck, text: 'Free shipping over ₹50' },
//                 { icon: Shield, text: '100% quality guarantee' },
//                 { icon: Leaf, text: 'Ethically sourced' },
//               ].map(({ icon: Icon, text }) => (
//                 <div key={text} className="flex flex-col items-center text-center gap-1.5 p-2">
//                   <Icon className="w-4 h-4 text-amber-500" />
//                   <span className="text-[10px] text-stone-500 leading-tight">{text}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* ── Tabs panel ── */}
//         <div className="mt-12 bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
//           {/* Tab bar */}
//           <div className="flex overflow-x-auto border-b border-stone-100 scrollbar-none">
//             {TABS.map(tab => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 style={activeTab === tab ? arialBlack : undefined}
//                 className={`shrink-0 px-6 py-4 text-sm capitalize transition-colors relative ${
//                   activeTab === tab
//                     ? 'text-amber-600'
//                     : 'text-stone-400 hover:text-stone-600 font-semibold'
//                 }`}
//               >
//                 {tab}
//                 {tab === 'reviews' && productReviews.length > 0 && (
//                   <span className="ml-1.5 text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-bold">
//                     {productReviews.length}
//                   </span>
//                 )}
//                 {activeTab === tab && (
//                   <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-t" />
//                 )}
//               </button>
//             ))}
//           </div>

//           {/* Tab content */}
//           <div className="p-6 sm:p-8">
//             {activeTab === 'description' && (
//               <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
//                 {product.description || 'No description available.'}
//               </p>
//             )}

//             {activeTab === 'ingredients' && (
//               <div>
//                 <p style={arialBlack} className="text-xs text-stone-400 uppercase tracking-wide mb-3">
//                   Ingredients
//                 </p>
//                 <p className="text-stone-700 leading-relaxed text-sm sm:text-base">
//                   {product.ingredients || 'Pure single-origin tea leaves.'}
//                 </p>
//                 {product.flavor_profile && (
//                   <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
//                     <p style={arialBlack} className="text-amber-700 text-xs uppercase tracking-wide mb-1">
//                       Flavor Profile
//                     </p>
//                     <p className="text-stone-700 text-sm">{product.flavor_profile}</p>
//                   </div>
//                 )}
//               </div>
//             )}

//             {activeTab === 'brewing' && (
//               <div>
//                 <p style={arialBlack} className="text-xs text-stone-400 uppercase tracking-wide mb-3">
//                   How to Brew
//                 </p>
//                 <p className="text-stone-700 leading-relaxed text-sm sm:text-base mb-6">
//                   {product.brewing_instructions || 'Steep in hot water for 3–5 minutes.'}
//                 </p>
//                 {brewingMeta.length > 0 && (
//                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                     {brewingMeta.map(({ icon: Icon, label, value }) => (
//                       <div key={label} className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100">
//                         <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
//                           <Icon className="w-4 h-4 text-amber-600" />
//                         </div>
//                         <div>
//                           <p className="text-[11px] text-stone-400 uppercase tracking-wide">{label}</p>
//                           <p style={arialBlack} className="text-sm text-stone-800">{value}</p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}

//             {activeTab === 'reviews' && (
//               <div>
//                 {productReviews.length > 0 ? (
//                   <div className="space-y-5 mb-8">
//                     {productReviews.map(r => (
//                       <div key={r.id} className="p-4 sm:p-5 bg-stone-50 rounded-2xl border border-stone-100">
//                         <div className="flex items-start justify-between gap-3 mb-2">
//                           <div>
//                             <p style={arialBlack} className="text-stone-800 text-sm">{r.reviewer_name}</p>
//                             {r.title && <p className="text-stone-600 text-sm font-medium mt-0.5">{r.title}</p>}
//                           </div>
//                           <div className="flex gap-0.5 shrink-0">
//                             {[1,2,3,4,5].map(n => (
//                               <Star
//                                 key={n}
//                                 className={`w-3.5 h-3.5 ${n <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-200'}`}
//                               />
//                             ))}
//                           </div>
//                         </div>
//                         <p className="text-stone-500 text-sm leading-relaxed">{r.body}</p>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="text-center py-10 mb-8">
//                     <Star className="w-10 h-10 text-stone-200 fill-stone-200 mx-auto mb-3" />
//                     <p className="text-stone-500 font-medium text-sm">No reviews yet</p>
//                     <p className="text-stone-400 text-xs mt-1">Be the first to share your thoughts.</p>
//                   </div>
//                 )}

//                 {/* Review form */}
//                 {user ? (
//                   reviewSubmitted ? (
//                     <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
//                       <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
//                       <p className="text-emerald-700 text-sm font-medium">Thank you! Your review has been submitted.</p>
//                     </div>
//                   ) : (
//                     <div className="border-t border-stone-100 pt-6">
//                       <p style={arialBlack} className="text-stone-800 text-sm mb-4">Write a Review</p>
//                       <form onSubmit={handleReview} className="space-y-4">
//                         <div>
//                           <label className="text-xs text-stone-400 uppercase tracking-wide block mb-2">Your Rating</label>
//                           <div className="flex gap-1">
//                             {[1,2,3,4,5].map(n => (
//                               <button
//                                 key={n}
//                                 type="button"
//                                 onClick={() => setReviewForm(f => ({ ...f, rating: n }))}
//                                 className="p-1"
//                               >
//                                 <Star
//                                   className={`w-6 h-6 transition-colors ${
//                                     n <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-200 hover:text-amber-300'
//                                   }`}
//                                 />
//                               </button>
//                             ))}
//                           </div>
//                         </div>
//                         <input
//                           type="text"
//                           placeholder="Review title (optional)"
//                           value={reviewForm.title}
//                           onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
//                           className="w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-800 text-sm placeholder-stone-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
//                         />
//                         <textarea
//                           required
//                           rows={4}
//                           placeholder="Share your experience with this tea..."
//                           value={reviewForm.body}
//                           onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))}
//                           className="w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-800 text-sm placeholder-stone-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all resize-none"
//                         />
//                         <button
//                           type="submit"
//                           disabled={submitting}
//                           style={arialBlack}
//                           className="px-6 py-3 bg-stone-900 hover:bg-amber-600 text-white text-sm rounded-full transition-colors disabled:opacity-50"
//                         >
//                           {submitting ? 'Submitting...' : 'Submit Review'}
//                         </button>
//                       </form>
//                     </div>
//                   )
//                 ) : (
//                   <div className="border-t border-stone-100 pt-6 text-center">
//                     <p className="text-stone-500 text-sm mb-3">Sign in to leave a review</p>
//                     <button
//                       onClick={() => navigate('/auth')}
//                       style={arialBlack}
//                       className="px-5 py-2.5 bg-stone-900 text-white text-sm rounded-full hover:bg-amber-600 transition-colors"
//                     >
//                       Sign In
//                     </button>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="h-10" />
//     </div>
//   )
// }


//////////////////////////////////////////////////


import { useState } from 'react'
import {
  ShoppingCart,
  ChevronLeft,
  Plus,
  Minus,
  Star,
  Leaf,
  Clock,
  Thermometer,
  Package,
  CheckCircle,
  Shield,
  Truck
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PRODUCTS } from '../data/productsData'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

interface ProductReview {
  id: number
  reviewer_name: string
  rating: number
  title?: string
  body: string
}

type Props = {
  slug: string
}

const TABS = ['description', 'ingredients', 'brewing', 'reviews'] as const
type Tab = typeof TABS[number]

const arialBlack: React.CSSProperties = {
  fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif',
  fontWeight: 900,
}

export default function ProductDetail({ slug }: Props) {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user, profile } = useAuth()

  // ✅ Static data se product fetch — no API, no hook
  const product = PRODUCTS.find(p => p.slug === slug) ?? null
  const loading = false

  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [activeTab, setActiveTab] = useState<Tab>('description')
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' })
  const [submitting, setSubmitting] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  const API_BASE_URL = import.meta.env.VITE_API_URL

  const handleAddToCart = async () => {
    if (!product) return
    setAdding(true)
    await addToCart(product as any, qty)
    setTimeout(() => {
      setAdding(false)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }, 600)
  }

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !product) return
    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          reviewer_name: profile?.name || 'Anonymous',
          ...reviewForm
        })
      })
      if (res.ok) setReviewSubmitted(true)
    } catch (err) {
      console.error('Failed to submit review:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Not found ─────────────────────────────────────────────────────────────────
  if (!product) {
    return (
      <div className="min-h-screen bg-stone-50 pt-20 flex items-center justify-center px-4">
        <div className="text-center">
          <Package className="w-14 h-14 text-stone-200 mx-auto mb-4" />
          <p className="text-stone-500 text-lg mb-2 font-medium">Product not found</p>
          <p className="text-stone-400 text-sm mb-6">This tea may have been moved or removed.</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-stone-900 text-white text-sm font-semibold rounded-full hover:bg-amber-600 transition-colors"
          >
            Browse all teas
          </button>
        </div>
      </div>
    )
  }

  // ── Derived data ──────────────────────────────────────────────────────────────
  const images: string[] =
    product.product_images?.length > 0
      ? [...product.product_images]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(i => i.url)
      : [product.image_url || 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg']

  const comparePrice = Number(product.compare_price) || 0
  const price = Number(product.price) || 0
  const discount = comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0
  const productReviews: ProductReview[] = product.reviews || []
  const avgRating = productReviews.length
    ? (productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length).toFixed(1)
    : null

  const badges = [
    product.is_new_arrival && 'New Arrival',
    product.is_best_seller && 'Best Seller',
    product.is_featured && 'Featured',
  ].filter(Boolean)

  const brewingMeta = [
    product.steep_time && { icon: Clock, label: 'Steep time', value: product.steep_time },
    product.temperature && { icon: Thermometer, label: 'Temperature', value: product.temperature },
    product.weight_grams && { icon: Leaf, label: 'Net weight', value: `${product.weight_grams}g` },
  ].filter(Boolean) as { icon: any; label: string; value: string }[]

  // ── Page ──────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-50 pt-20">

      {/* ── Breadcrumb ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-1.5 text-stone-400 hover:text-amber-600 text-sm transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          All Teas
        </button>
      </div>

      {/* ── Main product grid ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">

          {/* LEFT — Images */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-stone-100 shadow-sm">
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                  -{discount}%
                </span>
              )}
              {badges[0] && (
                <span className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                  {badges[0]}
                </span>
              )}
            </div>

            {/* ✅ Gallery thumbnails — product_images se */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === i
                        ? 'border-amber-500 shadow-md'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Info */}
          <div className="flex flex-col">

            {/* Category pill */}
            {product.category?.name && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full w-fit mb-3">
                <Leaf className="w-3 h-3" />
                {product.category.name}
              </span>
            )}

            {/* Name */}
            <h1
              style={arialBlack}
              className="text-3xl sm:text-4xl text-stone-900 leading-tight mb-3"
            >
              {product.name}
            </h1>

            {/* Rating row */}
            {avgRating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(n => (
                    <Star
                      key={n}
                      className={`w-4 h-4 ${n <= Math.round(Number(avgRating)) ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-200'}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-stone-700">{avgRating}</span>
                <span className="text-sm text-stone-400">({productReviews.length} reviews)</span>
              </div>
            )}

            {/* Description */}
            <p className="text-stone-500 text-sm sm:text-base leading-relaxed mb-6">
              {product.description || 'No description available.'}
            </p>

            {/* Brewing quick-meta */}
            {brewingMeta.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {brewingMeta.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-white rounded-2xl border border-stone-100 p-3 text-center">
                    <Icon className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                    <p className="text-[10px] text-stone-400 uppercase tracking-wide">{label}</p>
                    <p className="text-xs font-semibold text-stone-700 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span style={arialBlack} className="text-3xl sm:text-4xl text-stone-900">
                ₹{price.toFixed(2)}
              </span>
              {comparePrice > price && (
                <span className="text-lg text-stone-400 line-through">₹{comparePrice.toFixed(2)}</span>
              )}
              {discount > 0 && (
                <span className="text-sm font-bold text-red-500">Save {discount}%</span>
              )}
            </div>

            {/* Qty + Add to Cart */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-2xl px-3 py-2 shadow-sm">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-stone-100 transition-colors text-stone-600"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-bold text-stone-800 text-sm">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-stone-100 transition-colors text-stone-600"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-sm ${
                  added
                    ? 'bg-emerald-500 text-white'
                    : 'bg-stone-900 hover:bg-amber-600 text-white active:scale-95'
                }`}
              >
                {added ? (
                  <><CheckCircle className="w-4 h-4" /> Added to Cart!</>
                ) : adding ? (
                  <><ShoppingCart className="w-4 h-4 animate-bounce" /> Adding...</>
                ) : (
                  <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
                )}
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-stone-100">
              {[
                { icon: Truck, text: 'Free shipping over ₹500' },
                { icon: Shield, text: '100% quality guarantee' },
                { icon: Leaf, text: 'Ethically sourced' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center text-center gap-1.5 p-2">
                  <Icon className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] text-stone-500 leading-tight">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs panel ── */}
        <div className="mt-12 bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
          {/* Tab bar */}
          <div className="flex overflow-x-auto border-b border-stone-100 scrollbar-none">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={activeTab === tab ? arialBlack : undefined}
                className={`shrink-0 px-6 py-4 text-sm capitalize transition-colors relative ${
                  activeTab === tab
                    ? 'text-amber-600'
                    : 'text-stone-400 hover:text-stone-600 font-semibold'
                }`}
              >
                {tab}
                {tab === 'reviews' && productReviews.length > 0 && (
                  <span className="ml-1.5 text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-bold">
                    {productReviews.length}
                  </span>
                )}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-t" />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6 sm:p-8">
            {activeTab === 'description' && (
              <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
                {product.description || 'No description available.'}
              </p>
            )}

            {activeTab === 'ingredients' && (
              <div>
                <p style={arialBlack} className="text-xs text-stone-400 uppercase tracking-wide mb-3">
                  Ingredients
                </p>
                <p className="text-stone-700 leading-relaxed text-sm sm:text-base">
                  {product.ingredients || 'Pure single-origin tea leaves.'}
                </p>
                {product.flavor_profile && (
                  <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <p style={arialBlack} className="text-amber-700 text-xs uppercase tracking-wide mb-1">
                      Flavor Profile
                    </p>
                    <p className="text-stone-700 text-sm">{product.flavor_profile}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'brewing' && (
              <div>
                <p style={arialBlack} className="text-xs text-stone-400 uppercase tracking-wide mb-3">
                  How to Brew
                </p>
                <p className="text-stone-700 leading-relaxed text-sm sm:text-base mb-6">
                  {product.brewing_instructions || 'Steep in hot water for 3–5 minutes.'}
                </p>
                {brewingMeta.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {brewingMeta.map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                        <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-[11px] text-stone-400 uppercase tracking-wide">{label}</p>
                          <p style={arialBlack} className="text-sm text-stone-800">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {productReviews.length > 0 ? (
                  <div className="space-y-5 mb-8">
                    {productReviews.map(r => (
                      <div key={r.id} className="p-4 sm:p-5 bg-stone-50 rounded-2xl border border-stone-100">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <p style={arialBlack} className="text-stone-800 text-sm">{r.reviewer_name}</p>
                            {r.title && <p className="text-stone-600 text-sm font-medium mt-0.5">{r.title}</p>}
                          </div>
                          <div className="flex gap-0.5 shrink-0">
                            {[1,2,3,4,5].map(n => (
                              <Star
                                key={n}
                                className={`w-3.5 h-3.5 ${n <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-200'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-stone-500 text-sm leading-relaxed">{r.body}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 mb-8">
                    <Star className="w-10 h-10 text-stone-200 fill-stone-200 mx-auto mb-3" />
                    <p className="text-stone-500 font-medium text-sm">No reviews yet</p>
                    <p className="text-stone-400 text-xs mt-1">Be the first to share your thoughts.</p>
                  </div>
                )}

                {/* Review form */}
                {user ? (
                  reviewSubmitted ? (
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                      <p className="text-emerald-700 text-sm font-medium">Thank you! Your review has been submitted.</p>
                    </div>
                  ) : (
                    <div className="border-t border-stone-100 pt-6">
                      <p style={arialBlack} className="text-stone-800 text-sm mb-4">Write a Review</p>
                      <form onSubmit={handleReview} className="space-y-4">
                        <div>
                          <label className="text-xs text-stone-400 uppercase tracking-wide block mb-2">Your Rating</label>
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map(n => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setReviewForm(f => ({ ...f, rating: n }))}
                                className="p-1"
                              >
                                <Star
                                  className={`w-6 h-6 transition-colors ${
                                    n <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-200 hover:text-amber-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <input
                          type="text"
                          placeholder="Review title (optional)"
                          value={reviewForm.title}
                          onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-800 text-sm placeholder-stone-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                        />
                        <textarea
                          required
                          rows={4}
                          placeholder="Share your experience with this tea..."
                          value={reviewForm.body}
                          onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-800 text-sm placeholder-stone-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all resize-none"
                        />
                        <button
                          type="submit"
                          disabled={submitting}
                          style={arialBlack}
                          className="px-6 py-3 bg-stone-900 hover:bg-amber-600 text-white text-sm rounded-full transition-colors disabled:opacity-50"
                        >
                          {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </form>
                    </div>
                  )
                ) : (
                  <div className="border-t border-stone-100 pt-6 text-center">
                    <p className="text-stone-500 text-sm mb-3">Sign in to leave a review</p>
                    <button
                      onClick={() => navigate('/auth')}
                      style={arialBlack}
                      className="px-5 py-2.5 bg-stone-900 text-white text-sm rounded-full hover:bg-amber-600 transition-colors"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-10" />
    </div>
  )
}