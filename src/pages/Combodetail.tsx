import { useEffect, useState } from 'react'
import {
  ShoppingCart, ChevronLeft, Plus, Minus,
  CheckCircle, Shield, Truck, Package, Leaf, Gift
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const BASE_URL = 'https://admin.sevencups.in'

const arialBlack = {
  fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif',
  fontWeight: 900,
}

function normalizeUrl(url) {
  if (!url) return ''
  return url.startsWith('http') ? url : `${BASE_URL}${url}`
}

// ─── Types ────────────────────────────────────────────────────────────────────

// Bundle item ka primary image URL nikalo
function getBundleItemImage(item) {
  const primary = item.images?.find(i => i.is_primary === 1) ?? item.images?.[0]
  return primary ? normalizeUrl(primary.image_url) : ''
}

// Combo ke liye saari images collect karo (sab bundle items ki images)
function collectAllImages(combo) {
  const all = []
  for (const item of combo.bundle_items ?? []) {
    for (const img of item.images ?? []) {
      all.push({
        ...img,
        image_url: normalizeUrl(img.image_url),
        _itemName: item.name,
      })
    }
  }
  // Primary pehle
  return all.sort((a, b) => b.is_primary - a.is_primary)
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="min-h-screen bg-stone-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
        <div className="h-4 w-32 bg-stone-200 rounded mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="aspect-square bg-stone-200 rounded-3xl" />
          <div className="space-y-4 pt-4">
            <div className="h-3 w-24 bg-stone-200 rounded" />
            <div className="h-10 w-3/4 bg-stone-200 rounded" />
            <div className="h-4 bg-stone-200 rounded" />
            <div className="h-12 w-1/3 bg-stone-200 rounded mt-4" />
            <div className="h-14 bg-stone-200 rounded-2xl mt-6" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Bundle Item Card ─────────────────────────────────────────────────────────

function BundleItemCard({ item, navigate }) {
  const img = getBundleItemImage(item)
  return (
    <div
      className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-amber-100 cursor-pointer hover:border-amber-300 transition-all"
      style={{ boxShadow: '0 2px 8px rgba(217,119,6,0.08)' }}
      onClick={() => navigate(`/product/${item.slug}`)}
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-amber-50 shrink-0 flex items-center justify-center">
        {img
          ? <img src={img} alt={item.name} className="w-full h-full object-contain p-1" />
          : <Package className="w-6 h-6 text-amber-300" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-stone-800 font-semibold text-sm leading-tight line-clamp-2">{item.name}</p>
        <p className="text-amber-600 font-bold text-xs mt-0.5">₹{parseFloat(item.price).toFixed(0)}</p>
      </div>
      <div className="shrink-0 px-2 py-1 rounded-full bg-amber-100 text-amber-800 font-bold" style={{ fontSize: 11 }}>
        ×{item.pivot?.quantity ?? 1}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ComboDetail({ slug }) {
  const navigate = useNavigate()
  const { addToCart, isInCart } = useCart()

  const [combo, setCombo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    setLoading(true)
    setActiveImage(0)
    fetch(`${BASE_URL}/api/combos/${slug}`)
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json() })
      .then(data => setCombo(data.data ?? data))
      .catch(err => { console.error('Combo fetch failed:', err); setCombo(null) })
      .finally(() => setLoading(false))
  }, [slug])

  const handleAddToCart = async () => {
    if (!combo) return
    setAdding(true)
    await addToCart(combo, qty)
    setTimeout(() => {
      setAdding(false)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }, 600)
  }

  if (loading) return <Skeleton />

  if (!combo) {
    return (
      <div className="min-h-screen bg-stone-50 pt-20 flex items-center justify-center px-4">
        <div className="text-center">
          <Package className="w-14 h-14 text-stone-200 mx-auto mb-4" />
          <p className="text-stone-500 text-lg mb-2 font-medium">Combo not found</p>
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

  // ── Derived ──
  const images = collectAllImages(combo)
  const imageUrls = images.length > 0
    ? images.map(i => i.image_url)
    : ['https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg']

  const price = parseFloat(combo.price) || 0
  const comparePrice = parseFloat(combo.compare_price ?? '0') || 0
  const hasDiscount = comparePrice > price
  const discountPct = hasDiscount ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0
  const outOfStock = !combo.is_in_stock
  const inCart = isInCart(combo.id)

  // Individual items total (to show saving vs buying separately)
  const itemsTotal = (combo.bundle_items ?? []).reduce((sum, item) => {
    return sum + parseFloat(item.price) * (item.pivot?.quantity ?? 1)
  }, 0)
  const comboSaving = itemsTotal > price ? (itemsTotal - price).toFixed(0) : null

  return (
    <div className="min-h-screen bg-stone-50 pt-20">

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-1.5 text-stone-400 hover:text-amber-600 text-sm transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          All Teas
        </button>
      </div>

      {/* Main grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">

          {/* LEFT — Images */}
          <div className="space-y-3">
            {/* Combo badge strip */}
            <div
              className="flex items-center justify-center gap-2 py-2 rounded-2xl text-white font-bold text-xs"
              style={{ background: 'linear-gradient(90deg, #d97706, #f59e0b)' }}
            >
              <Gift className="w-3.5 h-3.5" />
              COMBO PACK — {combo.included_items_count ?? combo.bundle_items?.length ?? 0} Products
            </div>

            {/* Main image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-amber-50 border border-amber-100 shadow-sm">
              <img
                src={imageUrls[activeImage]}
                alt={combo.name}
                className="w-full h-full object-contain p-4 transition-opacity duration-300"
              />
              {hasDiscount && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                  -{discountPct}%
                </span>
              )}
              {outOfStock && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-3xl">
                  <span className="bg-black/60 text-white font-bold text-sm px-4 py-2 rounded-full">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {imageUrls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {imageUrls.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all bg-white ${
                      activeImage === i
                        ? 'border-amber-500 shadow-md'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Info */}
          <div className="flex flex-col">

            {/* Category */}
            {combo.category?.name && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full w-fit mb-3">
                <Leaf className="w-3 h-3" />
                {combo.category.name}
              </span>
            )}

            {/* Name */}
            <h1 style={arialBlack} className="text-3xl sm:text-4xl text-stone-900 leading-tight mb-3">
              {combo.name}
            </h1>

            {/* Description */}
            {combo.description && combo.description !== 'sjkfd' && (
              <p className="text-stone-500 text-sm sm:text-base leading-relaxed mb-4">
                {combo.description}
              </p>
            )}

            {/* Combo saving callout */}
            {comboSaving && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-5"
                style={{ background: '#ecfdf5', border: '1px solid #d1fae5' }}
              >
                <span className="text-xl">🎁</span>
                <div>
                  <p className="text-green-700 font-bold text-sm">Save ₹{comboSaving} with this combo!</p>
                  <p className="text-green-600 text-xs">vs buying each product separately</p>
                </div>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span style={arialBlack} className="text-3xl sm:text-4xl text-stone-900">
                ₹{price.toFixed(0)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-stone-400 line-through">₹{comparePrice.toFixed(0)}</span>
              )}
              {itemsTotal > price && (
                <span className="text-sm font-bold text-red-500">
                  Save ₹{comboSaving}
                </span>
              )}
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2 mb-5">
              <div className={`w-2 h-2 rounded-full ${outOfStock ? 'bg-red-400' : 'bg-green-400'}`} />
              <span className={`text-xs font-semibold ${outOfStock ? 'text-red-500' : 'text-green-600'}`}>
                {combo.stock_status ?? (outOfStock ? 'Out of Stock' : 'In Stock')}
              </span>
            </div>

            {/* Qty + Add to cart */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-2xl px-3 py-2 shadow-sm">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-stone-100 transition-colors text-stone-600"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-bold text-stone-800 text-sm">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-stone-100 transition-colors text-stone-600"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding || outOfStock}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-sm ${
                  outOfStock
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : added
                    ? 'bg-emerald-500 text-white'
                    : 'bg-stone-900 hover:bg-amber-600 text-white active:scale-95'
                }`}
              >
                {added ? (
                  <><CheckCircle className="w-4 h-4" /> Added to Cart!</>
                ) : adding ? (
                  <><ShoppingCart className="w-4 h-4 animate-bounce" /> Adding...</>
                ) : outOfStock ? (
                  <>Out of Stock</>
                ) : (
                  <><ShoppingCart className="w-4 h-4" /> Add Combo to Cart</>
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

        {/* ── Bundle Items Section ── */}
        <div className="mt-12 bg-white rounded-3xl border border-amber-100 shadow-sm overflow-hidden">
          <div
            className="px-6 py-4 flex items-center gap-2"
            style={{ background: 'linear-gradient(90deg, #fffbeb, #fff)' }}
          >
            <Package className="w-4 h-4 text-amber-600" />
            <h2 style={arialBlack} className="text-stone-800 text-sm">
              What's included in this combo
            </h2>
            <span className="ml-auto px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
              {combo.bundle_items?.length ?? 0} products
            </span>
          </div>

          <div className="p-4 sm:p-6 space-y-3">
            {(combo.bundle_items ?? []).map(item => (
              <BundleItemCard key={item.id} item={item} navigate={navigate} />
            ))}

            {/* Total breakdown */}
            <div className="mt-4 p-4 rounded-2xl border border-dashed border-amber-200 bg-amber-50">
              <div className="flex justify-between items-center text-sm text-stone-500 mb-1">
                <span>If bought separately</span>
                <span className="line-through">₹{itemsTotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-stone-900">
                <span style={arialBlack}>Combo Price</span>
                <span style={{ ...arialBlack, color: '#d97706' }}>₹{price.toFixed(0)}</span>
              </div>
              {comboSaving && (
                <div className="flex justify-between items-center text-sm text-green-600 font-semibold mt-1">
                  <span>You save</span>
                  <span>₹{comboSaving} 🎉</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      <div className="h-10" />
    </div>
  )
}