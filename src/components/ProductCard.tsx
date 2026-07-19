import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react'
import React, { useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

/* ─── Fallback image ──────────────────────────────────────────────────────── */

const ERROR_IMG =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4='

function Img(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [err, setErr] = useState(false)
  const { src, alt, className, style, ...rest } = props
  return err ? (
    <div
      className={`bg-amber-50 flex items-center justify-center ${className ?? ''}`}
      style={style}
    >
      <img src={ERROR_IMG} alt='img error' />
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

/* ─── Types ───────────────────────────────────────────────────────────────── */

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
  [key: string]: any
}

interface ProductCardProps {
  product: ApiProductLike
  index?: number
  accent?: string
}

/* ─── Palette pools ───────────────────────────────────────────────────────── */

const ACCENTS = ['#4ade80', '#f59e0b', '#c4b5fd', '#fb923c', '#67e8f9', '#f472b6']

function getCategoryLabel(cats: ApiProductLike['categories']): string | null {
  if (!cats) return null
  if (Array.isArray(cats) && cats.length > 0) return cats[0].name
  if (typeof cats === 'object' && 'name' in (cats as any)) return (cats as ProductCategory).name
  if (typeof cats === 'string') return cats
  return null
}

/* ─── ProductCard ─────────────────────────────────────────────────────────── */

export default function ProductCard({ product, index = 0, accent }: ProductCardProps) {
  const navigate = useNavigate()
  const cardRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const [adding, setAdding] = useState(false)
  const { addToCart, isInCart } = useCart()
  const inCart = isInCart(product.id)

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const smx = useSpring(mx, { stiffness: 200, damping: 22 })
  const smy = useSpring(my, { stiffness: 200, damping: 22 })
  const rotateX = useTransform(smy, [-0.5, 0.5], [8, -8])
  const rotateY = useTransform(smx, [-0.5, 0.5], [-8, 8])
  const glowX = useTransform(smx, [-0.5, 0.5], ['0%', '100%'])
  const glowY = useTransform(smy, [-0.5, 0.5], ['0%', '100%'])

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return
      const r = cardRef.current.getBoundingClientRect()
      mx.set((e.clientX - r.left) / r.width - 0.5)
      my.set((e.clientY - r.top) / r.height - 0.5)
    },
    [mx, my]
  )

  const onLeave = useCallback(() => {
    mx.set(0)
    my.set(0)
    setHovered(false)
  }, [mx, my])

  const cardAccent = accent ?? ACCENTS[index % ACCENTS.length]

  const numPrice = Number(product.price || 0)
  const numCompare = Number(product.compare_price || 0)
  const discount =
    numCompare > numPrice ? Math.round(((numCompare - numPrice) / numCompare) * 100) : 0

  const catLabel = getCategoryLabel(product.categories)

  let badge: { label: string; bg: string } | null = null
  if (product.is_best_seller) badge = { label: 'Best Seller', bg: 'linear-gradient(135deg,#d97706,#f59e0b)' }
  else if (product.is_new_arrival) badge = { label: 'New Arrival', bg: 'linear-gradient(135deg,#059669,#10b981)' }
  else if (product.is_featured) badge = { label: 'Featured', bg: 'linear-gradient(135deg,#7c3aed,#a78bfa)' }

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (inCart || adding) return
    setAdding(true)
    await addToCart(product as any)
    setTimeout(() => setAdding(false), 600)
  }

  const handleCardClick = () => {
    navigate(`/product/${product.slug}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.65, ease: [0.34, 1.2, 0.64, 1] }}
      style={{ perspective: 900 }}
    >
      <motion.div
        ref={cardRef}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className='relative rounded-2xl overflow-hidden cursor-pointer select-none'
        onClick={handleCardClick}
        onMouseMove={onMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={onLeave}
        whileHover={{ scale: 1.025 }}
        transition={{ scale: { duration: 0.3 } }}
      >
        <div
          className='relative rounded-2xl overflow-hidden'
          style={{
            background: '#fff',
            boxShadow: hovered
              ? `0 32px 72px ${cardAccent}40, 0 8px 24px rgba(0,0,0,0.15)`
              : '0 4px 24px rgba(0,0,0,0.08)',
            transition: 'box-shadow 0.4s ease',
          }}
        >
          {/* Image zone */}
          <div className='relative overflow-hidden' style={{ height: 220 }}>
            <motion.div
              className='w-full h-full'
              animate={{ scale: hovered ? 1.1 : 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <Img
                src={product.image_url ?? ''}
                alt={product.name}
                className='w-full h-full object-cover'
              />
            </motion.div>

            <motion.div
              className='absolute inset-0'
              style={{
                background: `radial-gradient(circle at 60% 40%, ${cardAccent}55, transparent 70%)`,
              }}
              animate={{ opacity: hovered ? 1 : 0.3 }}
              transition={{ duration: 0.4 }}
            />

            <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />

            <motion.div
              className='absolute inset-0 pointer-events-none rounded-2xl'
              style={{
                background: useTransform(
                  [glowX, glowY],
                  ([x, y]) =>
                    `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.18) 0%, transparent 60%)`
                ),
              }}
            />

            {/* Primary badge */}
            {badge && (
              <motion.div
                className='absolute top-3 left-3 px-3 py-1 rounded-full text-white text-xs font-bold tracking-wide'
                style={{ background: badge.bg }}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.5, type: 'spring' }}
              >
                {badge.label}
              </motion.div>
            )}

            {/* Discount badge */}
            {discount > 0 && (
              <motion.div
                className='absolute left-3 px-3 py-1 rounded-full text-white text-xs font-bold tracking-wide'
                style={{
                  background: 'linear-gradient(135deg,#dc2626,#ef4444)',
                  top: badge ? 40 : 12,
                }}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
              >
                −{discount}%
              </motion.div>
            )}

            {/* Price chip */}
            <motion.div
              className='absolute top-3 right-3 px-3 py-1 rounded-full backdrop-blur-sm text-white font-bold text-sm flex items-center gap-1.5'
              style={{ background: 'rgba(0,0,0,0.45)' }}
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
            >
              ₹{numPrice.toFixed(2)}
              {discount > 0 && (
                <span className='text-[10px] font-normal line-through opacity-70'>
                  ₹{numCompare.toFixed(2)}
                </span>
              )}
            </motion.div>

            {/* Bottom tags: category + weight */}
            <div className='absolute bottom-3 left-3 flex gap-1.5'>
              {catLabel && (
                <motion.span
                  className='px-2 py-0.5 rounded-full text-white text-xs backdrop-blur-sm'
                  style={{ background: `${cardAccent}99` }}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {catLabel}
                </motion.span>
              )}
              {product.weight_grams && (
                <motion.span
                  className='px-2 py-0.5 rounded-full text-white text-xs backdrop-blur-sm'
                  style={{ background: 'rgba(0,0,0,0.4)' }}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.38 }}
                >
                  {product.weight_grams} Tea Bags
                </motion.span>
              )}
            </div>
          </div>

          {/* Content zone */}
          <div className='p-5'>
            <motion.div
              className='h-0.5 rounded-full mb-3'
              style={{ background: `linear-gradient(90deg, ${cardAccent}, transparent)` }}
              initial={{ width: 0 }}
              animate={{ width: '55%' }}
              transition={{ delay: 0.35, duration: 0.6 }}
            />

            <h3 className='text-stone-900 mb-2' style={{ fontSize: 20, fontWeight: 800 }}>
              {product.name}
            </h3>

            <p className='text-stone-400 text-xs mb-4 line-clamp-2 leading-relaxed'>
              {product.description || 'A premium tea carefully sourced and crafted for discerning palates.'}
            </p>

            {/* CTA */}
            <motion.button
              onClick={handleAdd}
              disabled={adding || inCart}
              className='w-full py-2.5 rounded-xl font-bold text-sm text-white relative overflow-hidden mt-2'
              style={{
                background: inCart
                  ? '#16a34a'
                  : `linear-gradient(135deg, ${cardAccent}dd, #1c1917)`,
                transition: 'background 0.35s ease',
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
            >
              <AnimatePresence mode='wait'>
                {inCart ? (
                  <motion.span
                    key='done'
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -16, opacity: 0 }}
                    className='flex items-center justify-center gap-1.5'
                  >
                    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                      <polyline points='20 6 9 17 4 12' />
                    </svg>
                    In Cart
                  </motion.span>
                ) : adding ? (
                  <motion.span
                    key='adding'
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -16, opacity: 0 }}
                    className='flex items-center justify-center gap-1.5'
                  >
                    Added!
                  </motion.span>
                ) : (
                  <motion.span
                    key='add'
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -16, opacity: 0 }}
                    className='flex items-center justify-center gap-1.5'
                  >
                    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                      <circle cx='9' cy='21' r='1' />
                      <circle cx='20' cy='21' r='1' />
                      <path d='M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6' />
                    </svg>
                    Add to Cart
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Shimmer sweep */}
              <motion.div
                className='absolute inset-0 pointer-events-none'
                style={{
                  background:
                    'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.3) 50%, transparent 65%)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: hovered ? '200% 0' : '-100% 0' }}
                transition={{ duration: 0.7 }}
              />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}