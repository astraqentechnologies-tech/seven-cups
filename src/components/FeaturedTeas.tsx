import { motion, useInView, AnimatePresence } from 'motion/react'
import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ApiProduct } from '../pages/Home'
import { useCart } from '../context/CartContext'
import { ShoppingCart, Star, Heart } from 'lucide-react'

const ERROR_IMG =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4='

function Img(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [err, setErr] = useState(false)
  const { src, alt, className, style, ...rest } = props
  return err ? (
    <div className={`bg-gray-100 flex items-center justify-center ${className ?? ''}`} style={style}>
      <img src={ERROR_IMG} alt="img error" />
    </div>
  ) : (
    <img src={src} alt={alt} className={className} style={style} {...rest} onError={() => setErr(true)} />
  )
}

interface Product {
  id: number
  name: string
  slug: string
  price: number
  comparePrice: number
  badge: string
  image: string
  ingredients: string
  rating: number
  reviewCount: number
  raw: ApiProduct
}

interface FeaturedTeasProps {
  products: ApiProduct[]
  loading: boolean
  onViewAll?: () => void
}

function mapApiProduct(p: ApiProduct, i: number): Product {
  const badge = p.is_best_seller ? 'Best Seller' : p.is_new_arrival ? 'New Arrival' : 'Featured'
  const comparePrice = parseFloat((p as any).compare_price ?? '0')
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: parseFloat(p.price),
    comparePrice,
    badge,
    image: p.image_url ?? '',
    ingredients: (p as any).ingredients || '',
    rating: (p as any).rating ?? 4.5,
    reviewCount: (p as any).review_count ?? 80 + (p.id % 200),
    raw: p,
  }
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={9}
            fill={s <= Math.round(rating) ? '#f59e0b' : 'none'}
            color={s <= Math.round(rating) ? '#f59e0b' : '#d1d5db'}
            strokeWidth={1.5}
          />
        ))}
      </div>
      <span className="text-stone-400 font-medium" style={{ fontSize: 8 }}>{count}</span>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden bg-white animate-pulse shadow-sm">
      <div className="bg-gray-100 w-full" style={{ height: 110 }} />
      <div className="p-2 space-y-1.5">
        <div className="h-2.5 bg-gray-100 rounded w-3/4" />
        <div className="h-2.5 bg-gray-100 rounded w-1/2" />
        <div className="h-2.5 bg-gray-100 rounded w-2/3" />
        <div className="h-7 bg-yellow-100 rounded-lg mt-1" />
      </div>
    </div>
  )
}

function ProductCard({
  product,
  index,
  sectionVisible,
}: {
  product: Product
  index: number
  sectionVisible: boolean
}) {
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const { addToCart, isInCart } = useCart()
  const inCart = isInCart(product.id)

  const hasDiscount = product.comparePrice > product.price
  const discountPct = hasDiscount
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (inCart || adding) return
    setAdding(true)
    await addToCart(product.raw as any)
    setTimeout(() => setAdding(false), 600)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={sectionVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
      className="cursor-pointer"
      onClick={() => navigate(`/product/${product.slug}`)}
    >
      <div
        className="rounded-xl overflow-hidden bg-white flex flex-col h-full"
        style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)' }}
      >
        {/* ── Image ── */}
        <div
          className="relative overflow-hidden bg-gray-50 flex items-center justify-center"
          style={{ height: 'clamp(100px, 30vw, 200px)' }}
        >
          <Img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-1"
          />

          {/* Badge top-left */}
          <div
            className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-white font-bold leading-none"
            style={{
              fontSize: 8,
              background:
                product.badge === 'Best Seller' ? '#1d4ed8'
                : product.badge === 'New Arrival' ? '#059669'
                : '#7c3aed',
            }}
          >
            {/* {product.badge === 'Best Seller' ? 'Best' : product.badge === 'New Arrival' ? 'New' : 'Top'} */}
          </div>

          {/* Discount pill bottom-left */}
          {/* {hasDiscount && (
            <div
              className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-white font-bold leading-none"
              style={{ fontSize: 8, background: '#dc2626' }}
            >
              {discountPct}% OFF
            </div>
          )} */}

          {/* Wishlist top-right */}
          <button
            className="absolute top-1.5 right-1.5 rounded-full bg-white flex items-center justify-center"
            style={{ width: 24, height: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
            onClick={(e) => { e.stopPropagation(); setWishlisted(w => !w) }}
          >
            <Heart
              size={12}
              fill={wishlisted ? '#ef4444' : 'none'}
              color={wishlisted ? '#ef4444' : '#9ca3af'}
              strokeWidth={2}
            />
          </button>
        </div>

        {/* ── Info ── */}
        <div className="flex flex-col px-2 pt-2 pb-2 flex-1" style={{ gap: 4 }}>

          {/* Name */}
          <h3
            className="text-stone-900 leading-tight line-clamp-2 font-semibold"
            style={{ fontSize: 'clamp(10px, 2.8vw, 13px)' }}
          >
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex flex-col" style={{ gap: 1 }}>
            {hasDiscount && (
              <span className="text-stone-400 line-through leading-none" style={{ fontSize: 'clamp(8px, 2vw, 10px)' }}>
                MRP ₹{product.comparePrice.toFixed(0)}
              </span>
            )}
            <span className="text-red-500 font-bold leading-tight" style={{ fontSize: 'clamp(10px, 2.8vw, 13px)' }}>
              From ₹ {product.price.toFixed(0)}
            </span>
          </div>

          {/* Stars */}
          <StarRating rating={product.rating} count={product.reviewCount} />

          {/* Ingredients */}
          {product.ingredients && (
            <p
              className="text-stone-400 leading-tight line-clamp-1"
              style={{ fontSize: 'clamp(8px, 2vw, 10px)' }}
            >
              {product.ingredients}
            </p>
          )}

          {/* CTA */}
          <motion.button
            onClick={handleAdd}
            disabled={adding || inCart}
            className="w-full flex items-center justify-between rounded-lg font-bold mt-auto"
            style={{
              background: inCart ? '#d1fae5' : '#fde047',
              color: inCart ? '#065f46' : '#1c1917',
              fontSize: 'clamp(9px, 2.4vw, 12px)',
              padding: 'clamp(6px, 1.5vw, 9px) clamp(7px, 1.8vw, 11px)',
              marginTop: 4,
              transition: 'background 0.3s ease',
            }}
            whileTap={{ scale: 0.97 }}
          >
            <AnimatePresence mode="wait">
              {inCart ? (
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
                  Add to cart
                </motion.span>
              )}
            </AnimatePresence>
            {!inCart && <ShoppingCart size={11} strokeWidth={2} />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default function FeaturedTeas({ products: rawProducts, loading, onViewAll }: FeaturedTeasProps) {
  const navigate = useNavigate()
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const products = rawProducts.map((p, i) => mapApiProduct(p, i))

  if (!loading && products.length === 0) return null

  return (
    <section ref={ref} className="py-8 px-2.5 sm:px-6" style={{ background: '#fafaf8' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-4 sm:mb-8">
          <div>
            <motion.p
              className="text-xs font-bold tracking-widest uppercase mb-1"
              style={{ color: '#b45309' }}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4 }}
            >
              Hand Picked For You
            </motion.p>
            <motion.h2
              className="font-bold text-stone-900"
              style={{ fontSize: 'clamp(20px, 5vw, 36px)', lineHeight: 1.15 }}
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Featured <span style={{ color: '#d97706' }}>Teas</span>
            </motion.h2>
          </div>
          <motion.button
            onClick={() => onViewAll ? onViewAll() : navigate('/products')}
            className="text-sm font-semibold hidden sm:block"
            style={{ color: '#b45309' }}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
            whileHover={{ x: 3 }}
          >
            View All →
          </motion.button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} sectionVisible={inView} />
              ))}
        </div>

        {/* Mobile view all */}
        <motion.div
          className="mt-5 flex justify-center sm:hidden"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={() => onViewAll ? onViewAll() : navigate('/products')}
            className="px-8 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ background: '#d97706' }}
          >
            View All Teas →
          </button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          className="mt-8 pt-5 border-t border-stone-100 flex flex-wrap justify-center gap-3 sm:gap-10"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
        >
          {[
            { icon: '🌿', label: '100% Organic' },
            { icon: '🚚', label: 'Free Shipping ₹40+' },
            { icon: '🔒', label: 'Secure Checkout' },
            { icon: '♻️', label: 'Eco Packaging' },
          ].map((b) => (
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