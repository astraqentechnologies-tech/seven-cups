import {
  motion,
  AnimatePresence,
} from 'motion/react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { ShoppingCart, Star } from 'lucide-react'

/* ─── Fallback image ─────────────────────────────────────────────────────── */
const ERROR_IMG =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4='

function Img(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [err, setErr] = useState(false)
  const { src, alt, className, style, ...rest } = props
  return err ? (
    <div
      className={`bg-gray-100 flex items-center justify-center ${className ?? ''}`}
      style={style}
    >
      <img src={ERROR_IMG} alt="img error" />
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={() => setErr(true)}
    />
  )
}

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface ProductCategory { name: string; slug?: string }

interface ApiProductLike {
  id: number
  name: string
  slug: string
  description: string
  price: number | string
  image_url: string | null
  compare_price?: number | string
  weight_grams?: number
  is_featured?: boolean | number
  is_new_arrival?: boolean | number
  is_best_seller?: boolean | number
  categories?: ProductCategory[] | ProductCategory | string
  rating?: number
  review_count?: number
  tags?: string[]
  [key: string]: any
}

interface ProductCardProps {
  product: ApiProductLike
  index?: number
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function getCategoryLabel(cats: ApiProductLike['categories']): string | null {
  if (!cats) return null
  if (Array.isArray(cats) && cats.length > 0) return cats[0].name
  if (typeof cats === 'object' && 'name' in (cats as any)) return (cats as ProductCategory).name
  if (typeof cats === 'string') return cats
  return null
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={13}
            fill={s <= Math.round(rating) ? '#f59e0b' : 'none'}
            color={s <= Math.round(rating) ? '#f59e0b' : '#d1d5db'}
            strokeWidth={1.5}
          />
        ))}
      </div>
      <span className="text-xs text-stone-500 font-medium">{count}</span>
    </div>
  )
}

/* ─── ProductCard ────────────────────────────────────────────────────────── */
export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const { addToCart, isInCart } = useCart()
  const inCart = isInCart(product.id)

  const numPrice = Number(product.price || 0)
  const numCompare = Number(product.compare_price || 0)
  const hasDiscount = numCompare > numPrice

  /* Dummy review data — replace with real API data later */
  const rating = product.rating ?? 4.5
  const reviewCount = product.review_count ?? Math.floor(80 + (product.id % 200))

  /* Tags: categories + weight */
  const catLabel = getCategoryLabel(product.categories)
  const tagLine = [
    catLabel,
    product.tags?.[0],
    product.tags?.[1],
  ].filter(Boolean).join(' | ')

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (inCart || adding) return
    setAdding(true)
    await addToCart(product as any)
    setTimeout(() => setAdding(false), 600)
  }

  const handleCardClick = () => navigate(`/product/${product.slug}`)

  /* Badge */
  let badge: { label: string; bg: string } | null = null
  if (product.is_best_seller)   badge = { label: 'Best Seller', bg: '#1d4ed8' }
  else if (product.is_new_arrival) badge = { label: 'New Arrival', bg: '#059669' }
  else if (product.is_featured)    badge = { label: 'Featured',    bg: '#7c3aed' }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
      className="cursor-pointer"
      onClick={handleCardClick}
    >
      <div
        className="rounded-2xl overflow-hidden bg-white flex flex-col"
        style={{
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        {/* ── Image zone ── */}
        <div
          className="relative overflow-hidden bg-gray-50 flex items-center justify-center"
          style={{ height: 220 }}
        >
          <Img
            src={product.image_url ?? ''}
            alt={product.name}
            className="w-full h-full object-contain p-4"
          />

          {/* Badge */}
          {badge && (
            <div
              className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-white text-xs font-bold tracking-wide"
              style={{ background: badge.bg, fontSize: 11 }}
            >
              {badge.label}
            </div>
          )}

          {/* Discount % pill */}
          {hasDiscount && (
            <div
              className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-white text-xs font-bold"
              style={{ background: '#dc2626', fontSize: 11 }}
            >
              {Math.round(((numCompare - numPrice) / numCompare) * 100)}% OFF
            </div>
          )}
        </div>

        {/* ── Content zone ── */}
        <div className="flex flex-col gap-2 px-4 pt-3 pb-4">

          {/* Product name */}
          <h3
            className="text-stone-900 leading-snug line-clamp-2"
            style={{ fontSize: 14, fontWeight: 600 }}
          >
            {product.name}
          </h3>

          {/* Price row */}
          <div className="flex items-center gap-2 flex-wrap">
            {hasDiscount && (
              <span className="text-stone-400 line-through" style={{ fontSize: 13 }}>
                MRP ₹{numCompare.toFixed(2)}
              </span>
            )}
            <span className="text-red-600 font-bold" style={{ fontSize: 16 }}>
              ₹ {numPrice.toFixed(2)}
            </span>
          </div>

          {/* Stars */}
          <StarRating rating={rating} count={reviewCount} />

          {/* Tag line */}
          {tagLine && (
            <p className="text-stone-400 leading-tight" style={{ fontSize: 12 }}>
              {tagLine}
            </p>
          )}

          {/* ── Add to Cart button ── */}
          <motion.button
            onClick={handleAdd}
            disabled={adding || inCart}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-stone-900 mt-1 relative overflow-hidden"
            style={{
              background: inCart ? '#d1fae5' : '#fde047',
              color: inCart ? '#065f46' : '#1c1917',
              fontSize: 14,
              transition: 'background 0.3s ease',
            }}
            whileTap={{ scale: 0.97 }}
          >
            <AnimatePresence mode="wait">
              {inCart ? (
                <motion.span
                  key="done"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  In Cart
                </motion.span>
              ) : adding ? (
                <motion.span
                  key="adding"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  Added!
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  Add to cart
                </motion.span>
              )}
            </AnimatePresence>

            {/* Cart icon — right side */}
            {!inCart && (
              <ShoppingCart size={18} strokeWidth={2} />
            )}
          </motion.button>

        </div>
      </div>
    </motion.div>
  )
}