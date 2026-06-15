import {
  motion,
  AnimatePresence,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ApiProduct } from '../pages/Home'
import { useCart } from '../context/CartContext'

/* ─── Fallback image ──────────────────────────────────────────────────────── */

const ERROR_IMG =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4='

function Img(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [err, setErr] = useState(false)
  const { src, alt, className, style, ...rest } = props
  return err ? (
    <div className={`bg-amber-50 flex items-center justify-center ${className ?? ''}`} style={style}>
      <img src={ERROR_IMG} alt='img error' />
    </div>
  ) : (
    <img src={src} alt={alt} className={className} style={style} {...rest} onError={() => setErr(true)} />
  )
}

/* ─── Internal mapped product shape ──────────────────────────────────────── */

interface Product {
  id: number
  name: string
  slug: string
  subtitle: string
  price: number
  rating: number
  reviews: number
  badge: string
  badgeColor: string
  accent: string
  image: string
  tags: string[]
  raw: ApiProduct
}

/* ─── Props ───────────────────────────────────────────────────────────────── */

interface FeaturedTeasProps {
  products: ApiProduct[]
  loading: boolean
  onViewAll?: () => void
}

/* ─── Palette pools ───────────────────────────────────────────────────────── */

const ACCENTS = ['#4ade80', '#f59e0b', '#c4b5fd', '#fb923c', '#67e8f9', '#f472b6']
const BADGE_COLORS = ['#16a34a', '#b45309', '#7c3aed', '#dc2626', '#0369a1', '#be185d']

function mapApiProduct(p: ApiProduct, idx: number): Product {
  const palette = idx % ACCENTS.length
  const subtitle = p.flavor_profile
    ? p.flavor_profile.split(',')[0].trim()
    : p.description.split(/[.,]/)[0].slice(0, 40)
  const tags: string[] = [p.steep_time, p.temperature].filter(Boolean)
  const badge = p.is_best_seller ? 'Best Seller' : p.is_new_arrival ? 'New Arrival' : 'Featured'
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    subtitle,
    price: parseFloat(p.price),
    rating: 0,
    reviews: 0,
    badge,
    badgeColor: BADGE_COLORS[palette],
    accent: ACCENTS[palette],
    image: p.image_url ?? '',
    tags,
    raw: p,
  }
}

/* ─── Ambient particles ───────────────────────────────────────────────────── */

function AmbientParticle({ i }: { i: number }) {
  const size = 4 + (i % 5) * 3
  const left = `${8 + ((i * 23) % 84)}%`
  const duration = 6 + (i % 4) * 2.5
  const delay = (i * 0.7) % 4
  return (
    <motion.div
      className='absolute rounded-full pointer-events-none'
      style={{
        width: size, height: size, left, bottom: '-10%',
        background: i % 3 === 0 ? '#fbbf2455' : i % 3 === 1 ? '#d9770655' : '#a78bfa44',
      }}
      animate={{ y: [0, -(280 + (i % 3) * 120)], opacity: [0, 0.7, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  )
}

/* ─── Star rating ─────────────────────────────────────────────────────────── */

function Stars({ rating, revealed }: { rating: number; revealed: boolean }) {
  return (
    <div className='flex gap-0.5'>
      {[1, 2, 3, 4, 5].map(n => (
        <motion.svg key={n} width='14' height='14' viewBox='0 0 24 24'
          initial={{ scale: 0, rotate: -30 }}
          animate={revealed ? { scale: 1, rotate: 0 } : {}}
          transition={{ delay: n * 0.08, type: 'spring', stiffness: 400, damping: 18 }}
        >
          <polygon
            points='12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26'
            fill={n <= Math.floor(rating) ? '#f59e0b' : n - 0.5 <= rating ? '#fbbf24' : '#d1d5db'}
            stroke='none'
          />
        </motion.svg>
      ))}
    </div>
  )
}

/* ─── 3-D tilt product card ───────────────────────────────────────────────── */

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
  const cardRef = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)
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

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const r = cardRef.current.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }, [mx, my])

  const onLeave = useCallback(() => {
    mx.set(0); my.set(0); setHovered(false)
  }, [mx, my])

  useEffect(() => {
    if (sectionVisible) {
      const t = setTimeout(() => setRevealed(true), 300 + index * 180)
      return () => clearTimeout(t)
    }
  }, [sectionVisible, index])

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setAdding(true)
    await addToCart(product.raw as any)
    setTimeout(() => setAdding(false), 600)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.92 }}
      animate={revealed ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.65, ease: [0.34, 1.2, 0.64, 1] }}
      style={{ perspective: 900 }}
    >
      <motion.div
        ref={cardRef}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className='relative rounded-2xl overflow-hidden cursor-pointer select-none'
        onClick={() => navigate(`/product/${product.slug}`)}
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
              ? `0 32px 72px ${product.accent}40, 0 8px 24px rgba(0,0,0,0.15)`
              : '0 4px 24px rgba(0,0,0,0.08)',
            transition: 'box-shadow 0.4s ease',
          }}
        >
          {/* Image zone */}
          <div className='relative overflow-hidden' style={{ height: 220 }}>
            <motion.div className='w-full h-full' animate={{ scale: hovered ? 1.1 : 1 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
              <Img src={product.image} alt={product.name} className='w-full h-full object-cover' />
            </motion.div>

            <motion.div
              className='absolute inset-0'
              style={{ background: `radial-gradient(circle at 60% 40%, ${product.accent}55, transparent 70%)` }}
              animate={{ opacity: hovered ? 1 : 0.3 }}
              transition={{ duration: 0.4 }}
            />

            <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />

            <motion.div
              className='absolute inset-0 pointer-events-none rounded-2xl'
              style={{
                background: useTransform(
                  [glowX, glowY],
                  ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.18) 0%, transparent 60%)`
                ),
              }}
            />

            <motion.div
              className='absolute top-3 left-3 px-3 py-1 rounded-full text-white text-xs font-bold tracking-wide'
              style={{ background: product.badgeColor }}
              initial={{ x: -30, opacity: 0 }}
              animate={revealed ? { x: 0, opacity: 1 } : {}}
              transition={{ delay: 0.3 + index * 0.18, duration: 0.5, type: 'spring' }}
            >
              {product.badge}
            </motion.div>

            <motion.div
              className='absolute top-3 right-3 px-3 py-1 rounded-full backdrop-blur-sm text-white font-bold text-sm'
              style={{ background: 'rgba(0,0,0,0.45)' }}
              initial={{ x: 30, opacity: 0 }}
              animate={revealed ? { x: 0, opacity: 1 } : {}}
              transition={{ delay: 0.35 + index * 0.18, duration: 0.5, type: 'spring' }}
            >
              ₹{product.price}
            </motion.div>

            <div className='absolute bottom-3 left-3 flex gap-1.5'>
              {product.tags.map((tag, ti) => (
                <motion.span
                  key={tag}
                  className='px-2 py-0.5 rounded-full text-white text-xs backdrop-blur-sm'
                  style={{ background: `${product.accent}99` }}
                  initial={{ y: 12, opacity: 0 }}
                  animate={revealed ? { y: 0, opacity: 1 } : {}}
                  transition={{ delay: 0.45 + index * 0.18 + ti * 0.08 }}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Content zone */}
          <div className='p-5'>
            <motion.div
              className='h-0.5 rounded-full mb-3'
              style={{ background: `linear-gradient(90deg, ${product.accent}, transparent)` }}
              initial={{ width: 0 }}
              animate={revealed ? { width: '55%' } : {}}
              transition={{ delay: 0.5 + index * 0.18, duration: 0.6 }}
            />

            <p className='text-xs font-semibold tracking-widest uppercase mb-0.5' style={{ color: product.accent }}>
              {product.subtitle}
            </p>
            <h3 className='text-stone-900 mb-2' style={{ fontSize: 20, fontWeight: 800 }}>
              {product.name}
            </h3>

            {product.rating > 0 && (
              <div className='flex items-center gap-2 mb-4'>
                <Stars rating={product.rating} revealed={revealed} />
                <span className='text-stone-500 text-xs'>{product.rating} ({product.reviews})</span>
              </div>
            )}

            <motion.button
              onClick={handleAdd}
              disabled={adding || inCart}
              className='w-full py-2.5 rounded-xl font-bold text-sm text-white relative overflow-hidden mt-2'
              style={{
                background: inCart
                  ? '#16a34a'
                  : `linear-gradient(135deg, ${product.accent}dd, ${product.badgeColor})`,
                transition: 'background 0.35s ease',
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
            >
              <AnimatePresence mode='wait'>
                {inCart ? (
                  <motion.span key='done' initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} className='flex items-center justify-center gap-1.5'>
                    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><polyline points='20 6 9 17 4 12' /></svg>
                    In Cart
                  </motion.span>
                ) : adding ? (
                  <motion.span key='adding' initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} className='flex items-center justify-center gap-1.5'>
                    Added!
                  </motion.span>
                ) : (
                  <motion.span key='add' initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} className='flex items-center justify-center gap-1.5'>
                    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><circle cx='9' cy='21' r='1' /><circle cx='20' cy='21' r='1' /><path d='M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6' /></svg>
                    Add to Cart
                  </motion.span>
                )}
              </AnimatePresence>

              <motion.div
                className='absolute inset-0 pointer-events-none'
                style={{
                  background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.3) 50%, transparent 65%)',
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

/* ─── Animated heading ────────────────────────────────────────────────────── */

function AnimatedHeading({ visible }: { visible: boolean }) {
  const words = 'Featured Teas'.split(' ')
  return (
    <div className='flex flex-wrap gap-x-4 justify-start items-end mb-2'>
      {words.map((word, wi) => (
        <div key={wi} className='overflow-hidden'>
          <motion.span
            className='block'
            style={{
              fontSize: 42, fontWeight: 900, letterSpacing: '-0.03em',
              color: wi === 1 ? '#d97706' : '#1c1917', lineHeight: 1.05,
            }}
            initial={{ y: '110%' }}
            animate={visible ? { y: '0%' } : {}}
            transition={{ delay: wi * 0.14, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
          </motion.span>
        </div>
      ))}
    </div>
  )
}

/* ─── Scroll dots ─────────────────────────────────────────────────────────── */

function ScrollDots({ count, active }: { count: number; active: number }) {
  return (
    <div className='flex gap-2 items-center'>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className='rounded-full'
          style={{ background: i === active ? '#d97706' : '#d1d5db' }}
          animate={{ width: i === active ? 24 : 8, height: 8 }}
          transition={{ duration: 0.35 }}
        />
      ))}
    </div>
  )
}

/* ─── Skeleton loader ─────────────────────────────────────────────────────── */

function SkeletonCard() {
  return (
    <div className='rounded-2xl overflow-hidden bg-white shadow-sm animate-pulse'>
      <div className='bg-amber-100 h-[220px] w-full' />
      <div className='p-5 space-y-3'>
        <div className='h-2 bg-amber-100 rounded w-1/2' />
        <div className='h-5 bg-stone-100 rounded w-3/4' />
        <div className='h-4 bg-stone-100 rounded w-full' />
        <div className='h-10 bg-amber-100 rounded-xl mt-4' />
      </div>
    </div>
  )
}

/* ─── Main FeaturedTeas component ─────────────────────────────────────────── */

export default function FeaturedTeas({ products: rawProducts, loading, onViewAll }: FeaturedTeasProps) {
  const navigate = useNavigate()
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [activeIdx, setActiveIdx] = useState(0)

  const products = rawProducts.map(mapApiProduct)

  useEffect(() => {
    if (!inView || products.length === 0) return
    const t = setInterval(() => setActiveIdx(p => (p + 1) % products.length), 2200)
    return () => clearInterval(t)
  }, [inView, products.length])

  if (!loading && products.length === 0) return null

  return (
    <section
      ref={ref}
      className='relative py-24 overflow-hidden'
      style={{ background: 'linear-gradient(170deg, #fafaf5 0%, #fffbeb 40%, #fef3c7 70%, #fefce8 100%)' }}
    >
      {Array.from({ length: 14 }).map((_, i) => <AmbientParticle key={i} i={i} />)}

      <motion.div
        className='absolute -right-40 -top-40 w-96 h-96 rounded-full border pointer-events-none'
        style={{ borderColor: '#fbbf2430', borderWidth: 48 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className='absolute -left-24 bottom-0 w-72 h-72 rounded-full border pointer-events-none'
        style={{ borderColor: '#d9770622', borderWidth: 32 }}
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />

      <div className='relative max-w-7xl mx-auto px-6'>
        <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14'>
          <div>
            <motion.p
              className='text-amber-600 text-xs font-bold tracking-[0.28em] uppercase mb-2'
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              ✦ Hand Picked For You
            </motion.p>
            <AnimatedHeading visible={inView} />
            <motion.div
              className='flex items-center gap-3 mt-3'
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.4 }}
            >
              <div className='h-px w-10 bg-amber-400' />
              <p className='text-stone-500 text-sm'>Curated by our master tea blenders</p>
            </motion.div>
          </div>

          <motion.div
            className='flex flex-col items-start sm:items-end gap-3'
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <ScrollDots count={Math.max(products.length, 1)} active={activeIdx} />
            <motion.button
              onClick={() => onViewAll ? onViewAll() : navigate('/products')}
              className='px-6 py-2 rounded-full text-sm font-semibold border-2 text-amber-700'
              style={{ borderColor: '#d97706' }}
              whileHover={{ background: '#d97706', color: '#fff', scale: 1.04, boxShadow: '0 8px 24px rgba(217,119,6,0.35)' }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.25 }}
            >
              View All Teas →
            </motion.button>
          </motion.div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} sectionVisible={inView} />
              ))}
        </div>

        <motion.div
          className='mt-14 flex flex-wrap justify-center gap-8'
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          {[
            { icon: '🌿', label: '100% Organic' },
            { icon: '🚚', label: 'Free Shipping ₹40+' },
            { icon: '🔒', label: 'Secure Checkout' },
            { icon: '♻️', label: 'Eco Packaging' },
          ].map(b => (
            <motion.div
              key={b.label}
              className='flex items-center gap-2 text-stone-500 text-sm'
              whileHover={{ color: '#92400e', scale: 1.06 }}
              transition={{ duration: 0.2 }}
            >
              <span className='text-lg'>{b.icon}</span>
              <span className='font-medium'>{b.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}