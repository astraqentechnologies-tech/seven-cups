import { motion, useInView, AnimatePresence } from 'motion/react'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { ShoppingCart, Package, ChevronRight } from 'lucide-react'

const BASE_URL = 'https://admin.sevencups.in'

// ─── Types ───────────────────────────────────────────────────────────────────

interface BundleImage {
  id: number
  product_id: number
  image_path: string
  is_primary: number
  image_url: string
}

interface BundleItem {
  id: number
  name: string
  slug: string
  price: string
  stock: number
  pivot: { quantity: number }
  images: BundleImage[]
}

interface ApiCombo {
  id: number
  name: string
  slug: string
  description: string
  category_id: number
  price: string
  compare_price: string | null
  is_in_stock: boolean
  stock_status: string
  included_items_names: string
  included_items_count: number
  category: { id: number; name: string; slug: string }
  bundle_items: BundleItem[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ERROR_IMG =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4='

function getComboImage(combo: ApiCombo): string {
  // First bundle item ka primary image use karo
  for (const item of combo.bundle_items) {
    const primary = item.images.find(i => i.is_primary === 1) ?? item.images[0]
    if (primary) {
      const url = primary.image_url
      return url.startsWith('http') ? url : `${BASE_URL}${url}`
    }
  }
  return ''
}

function getAllImages(combo: ApiCombo): string[] {
  const urls: string[] = []
  for (const item of combo.bundle_items) {
    const primary = item.images.find(i => i.is_primary === 1) ?? item.images[0]
    if (primary) {
      const url = primary.image_url
      urls.push(url.startsWith('http') ? url : `${BASE_URL}${url}`)
    }
  }
  return urls
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SafeImg({ src, alt, className, style }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [err, setErr] = useState(false)
  if (err || !src) {
    return (
      <div className={`bg-amber-50 flex items-center justify-center ${className ?? ''}`} style={style}>
        <img src={ERROR_IMG} alt="img error" />
      </div>
    )
  }
  return (
    <img src={src} alt={alt} className={className} style={style} onError={() => setErr(true)} />
  )
}

function SkeletonComboCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white animate-pulse" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <div className="bg-amber-50" style={{ height: 160 }} />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-3/4" />
        <div className="h-2.5 bg-gray-100 rounded w-1/2" />
        <div className="h-2.5 bg-gray-100 rounded w-2/3" />
        <div className="h-8 bg-amber-100 rounded-xl mt-2" />
      </div>
    </div>
  )
}

// Stacked images (two product images overlapping) — combo ka visual signature
function StackedImages({ images }: { images: string[] }) {
  const [img0, img1] = images
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Back card */}
      {img1 && (
        <div
          className="absolute rounded-xl overflow-hidden bg-white"
          style={{
            width: '52%',
            height: '78%',
            right: '10%',
            top: '10%',
            transform: 'rotate(6deg)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            zIndex: 1,
          }}
        >
          <SafeImg src={img1} alt="" className="w-full h-full object-contain p-1.5" />
        </div>
      )}
      {/* Front card */}
      {img0 && (
        <div
          className="absolute rounded-xl overflow-hidden bg-white"
          style={{
            width: '52%',
            height: '78%',
            left: '10%',
            top: '6%',
            transform: 'rotate(-4deg)',
            boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
            zIndex: 2,
          }}
        >
          <SafeImg src={img0} alt="" className="w-full h-full object-contain p-1.5" />
        </div>
      )}
      {/* Single image fallback */}
      {!img1 && img0 && (
        <SafeImg src={img0} alt="" className="w-full h-full object-contain p-3" />
      )}
    </div>
  )
}

function ComboCard({
  combo,
  index,
  sectionVisible,
}: {
  combo: ApiCombo
  index: number
  sectionVisible: boolean
}) {
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const { addToCart, isInCart } = useCart()
  const inCart = isInCart(combo.id)

  const images = getAllImages(combo)
  const price = parseFloat(combo.price)
  const comparePrice = parseFloat(combo.compare_price ?? '0')
  const hasDiscount = comparePrice > price
  const discountPct = hasDiscount
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0
  const outOfStock = !combo.is_in_stock

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (inCart || adding || outOfStock) return
    setAdding(true)
    // CartContext expects ApiProduct-like shape — pass combo as raw
    await addToCart(combo as any)
    setTimeout(() => setAdding(false), 600)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={sectionVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.08, ease: 'easeOut' }}
      className="cursor-pointer"
      onClick={() => navigate(`/combo/${combo.slug ?? combo.id}`)}
    >
      <div
        className="rounded-2xl overflow-hidden flex flex-col h-full relative"
        style={{
          background: 'linear-gradient(145deg, #fffbeb 0%, #fff 60%)',
          boxShadow: '0 4px 20px rgba(217,119,6,0.12), 0 1px 4px rgba(0,0,0,0.06)',
          border: '1px solid rgba(217,119,6,0.18)',
        }}
      >
        {/* ── Combo tag ribbon ── */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center py-1 z-10"
          style={{ background: 'linear-gradient(90deg, #d97706, #f59e0b)', borderRadius: '16px 16px 0 0' }}
        >
          <Package size={9} color="white" strokeWidth={2.5} />
          <span className="text-white font-bold ml-1" style={{ fontSize: 8, letterSpacing: '0.05em' }}>
            COMBO PACK · {combo.included_items_count} Products
          </span>
        </div>

        {/* ── Stacked image area ── */}
        <div
          className="relative overflow-hidden"
          style={{ height: 'clamp(110px, 32vw, 180px)', background: '#fef3c7', marginTop: 20 }}
        >
          <StackedImages images={images} />

          {/* Discount badge */}
          {hasDiscount && (
            <div
              className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-full text-white font-bold z-20"
              style={{ fontSize: 8, background: '#dc2626' }}
            >
              {discountPct}% OFF
            </div>
          )}

          {/* Out of stock overlay */}
          {outOfStock && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.35)', zIndex: 20 }}
            >
              <span className="text-white font-bold text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.5)' }}>
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div className="flex flex-col px-2.5 pt-2 pb-2.5 flex-1" style={{ gap: 4 }}>

          {/* Name */}
          <h3
            className="text-stone-900 font-bold leading-tight line-clamp-2"
            style={{ fontSize: 'clamp(10px, 2.8vw, 13px)' }}
          >
            {combo.name}
          </h3>

          {/* Includes pill list */}
          <div className="flex flex-wrap gap-1">
            {combo.bundle_items.map(item => (
              <span
                key={item.id}
                className="px-1.5 py-0.5 rounded-full text-amber-800 font-medium leading-none"
                style={{ fontSize: 7, background: '#fef3c7', border: '1px solid #fde68a' }}
              >
                {item.name} ×{item.pivot.quantity}
              </span>
            ))}
          </div>

          {/* Price */}
          <div className="flex flex-col" style={{ gap: 1 }}>
            {hasDiscount && (
              <span
                className="text-stone-400 line-through leading-none"
                style={{ fontSize: 'clamp(8px, 2vw, 10px)' }}
              >
                MRP ₹{comparePrice.toFixed(0)}
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span
                className="text-amber-700 font-bold leading-tight"
                style={{ fontSize: 'clamp(11px, 3vw, 14px)' }}
              >
                ₹{price.toFixed(0)}
              </span>
              {hasDiscount && (
                <span className="text-green-600 font-semibold" style={{ fontSize: 9 }}>
                  Save ₹{(comparePrice - price).toFixed(0)}
                </span>
              )}
            </div>
          </div>

          {/* Savings callout */}
          <div
            className="flex items-center gap-1 px-1.5 py-1 rounded-lg"
            style={{ background: '#ecfdf5', border: '1px solid #d1fae5' }}
          >
            <span style={{ fontSize: 9 }}>🎁</span>
            <span className="text-green-700 font-semibold" style={{ fontSize: 8 }}>
              Bundle & Save — better than buying separately
            </span>
          </div>

          {/* CTA */}
          <motion.button
            onClick={handleAdd}
            disabled={adding || inCart || outOfStock}
            className="w-full flex items-center justify-between rounded-xl font-bold mt-auto"
            style={{
              background: outOfStock
                ? '#f3f4f6'
                : inCart
                ? '#d1fae5'
                : 'linear-gradient(90deg, #d97706, #f59e0b)',
              color: outOfStock ? '#9ca3af' : inCart ? '#065f46' : '#1c1917',
              fontSize: 'clamp(9px, 2.4vw, 12px)',
              padding: 'clamp(7px, 1.8vw, 10px) clamp(8px, 2vw, 12px)',
              marginTop: 4,
              transition: 'opacity 0.2s ease',
              boxShadow: outOfStock || inCart ? 'none' : '0 2px 8px rgba(217,119,6,0.35)',
            }}
            whileTap={{ scale: outOfStock ? 1 : 0.97 }}
          >
            <AnimatePresence mode="wait">
              {outOfStock ? (
                <motion.span key="oos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Out of Stock
                </motion.span>
              ) : inCart ? (
                <motion.span key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-0.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  In Cart
                </motion.span>
              ) : adding ? (
                <motion.span key="adding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Added!
                </motion.span>
              ) : (
                <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Add Combo
                </motion.span>
              )}
            </AnimatePresence>
            {!outOfStock && !inCart && <ShoppingCart size={11} strokeWidth={2} />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function ComboTeas() {
  const navigate = useNavigate()
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const [combos, setCombos] = useState<ApiCombo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${BASE_URL}/api/combos`)
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json() })
      .then((data: { status: string; data: ApiCombo[] }) => {
        setCombos(data.data ?? [])
      })
      .catch(err => console.error('Combos fetch failed:', err))
      .finally(() => setLoading(false))
  }, [])

  if (!loading && combos.length === 0) return null

  return (
    <section ref={ref} className="py-8 px-2.5 sm:px-6" style={{ background: '#fffbeb' }}>
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-end justify-between mb-4 sm:mb-8">
          <div>
            <motion.p
              className="text-xs font-bold tracking-widest uppercase mb-1"
              style={{ color: '#92400e' }}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4 }}
            >
              🎁 Bundle & Save
            </motion.p>
            <motion.h2
              className="font-bold text-stone-900"
              style={{ fontSize: 'clamp(20px, 5vw, 36px)', lineHeight: 1.15 }}
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Combo <span style={{ color: '#d97706' }}>Packs</span>
            </motion.h2>
            <motion.p
              className="text-stone-500 mt-1"
              style={{ fontSize: 'clamp(10px, 2.4vw, 13px)' }}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
            >
              Curated bundles — more teas, more savings
            </motion.p>
          </div>

          <motion.button
          onClick={() => navigate(`/combo/${combo.slug ?? combo.id}`)}
            className="text-sm font-semibold hidden sm:flex items-center gap-1"
            style={{ color: '#b45309' }}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
            whileHover={{ x: 3 }}
          >
            View All <ChevronRight size={14} strokeWidth={2.5} />
          </motion.button>
        </div>

        {/* ── Divider accent ── */}
        <motion.div
          className="mb-5 h-0.5 rounded-full"
          style={{ background: 'linear-gradient(90deg, #d97706, transparent)', maxWidth: 80 }}
          initial={{ scaleX: 0, originX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
        />

        {/* ── Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonComboCard key={i} />)
            : combos.map((combo, i) => (
                <ComboCard key={combo.id} combo={combo} index={i} sectionVisible={inView} />
              ))}
        </div>

        {/* ── Mobile view all ── */}
        <motion.div
          className="mt-5 flex justify-center sm:hidden"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          <button
          onClick={() => navigate(`/combo/${combo.slug ?? combo.id}`)}
            className="px-8 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(90deg, #d97706, #f59e0b)' }}
          >
            View All Combos →
          </button>
        </motion.div>

        {/* ── Trust strip ── */}
        <motion.div
          className="mt-8 pt-5 border-t border-amber-100 flex flex-wrap justify-center gap-3 sm:gap-10"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
        >
          {[
            { icon: '💰', label: 'Combo Savings' },
            { icon: '📦', label: 'Packed Together' },
            { icon: '🎁', label: 'Gift Ready' },
            { icon: '🚚', label: 'Free Shipping' },
          ].map(b => (
            <div key={b.label} className="flex items-center gap-1 text-stone-400 font-medium" style={{ fontSize: 10 }}>
              <span>{b.icon}</span>
              <span>{b.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}