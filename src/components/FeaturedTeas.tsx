import { motion, useInView, AnimatePresence } from 'motion/react'
import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ApiProduct } from '../pages/Home'
import { useCart } from '../context/CartContext'

/* ─── Fallback image ── */
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

/* ─── Types ── */
interface Product {
  id: number
  name: string
  slug: string
  price: number
  badge: string
  image: string
  raw: ApiProduct
}

interface FeaturedTeasProps {
  products: ApiProduct[]
  loading: boolean
  onViewAll?: () => void
}

function mapApiProduct(p: ApiProduct): Product {
  const badge = p.is_best_seller ? 'Best Seller' : p.is_new_arrival ? 'New Arrival' : 'Featured'
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: parseFloat(p.price),
    badge,
    image: p.image_url ?? '',
    raw: p,
  }
}

/* ─── Skeleton ── */
function SkeletonCard() {
  return (
    <div className='rounded-2xl overflow-hidden bg-white animate-pulse'>
      <div className='bg-stone-100 h-[240px] w-full' />
      <div className='p-4 space-y-3'>
        <div className='h-4 bg-stone-100 rounded w-3/4' />
        <div className='h-4 bg-stone-100 rounded w-1/3' />
        <div className='h-10 bg-amber-100 rounded-xl mt-2' />
      </div>
    </div>
  )
}

/* ─── Product Card ── */
function ProductCard({ product, index, sectionVisible }: { product: Product; index: number; sectionVisible: boolean }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  const [adding, setAdding] = useState(false)
  const { addToCart, isInCart } = useCart()
  const inCart = isInCart(product.id)

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setAdding(true)
    await addToCart(product.raw as any)
    setTimeout(() => setAdding(false), 600)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={sectionVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      className='group cursor-pointer'
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/product/${product.slug}`)}
    >
      <div
        className='rounded-2xl overflow-hidden bg-white'
        style={{
          boxShadow: hovered
            ? '0 16px 48px rgba(120,70,20,0.14)'
            : '0 2px 12px rgba(0,0,0,0.06)',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        {/* Image */}
        <div className='relative overflow-hidden' style={{ height: 240 }}>
          <motion.div
            className='w-full h-full'
            animate={{ scale: hovered ? 1.05 : 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <Img src={product.image} alt={product.name} className='w-full h-full object-cover' />
          </motion.div>

          {/* Dark overlay on hover */}
          <motion.div
            className='absolute inset-0'
            style={{ background: 'rgba(0,0,0,0)' }}
            animate={{ background: hovered ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0)' }}
            transition={{ duration: 0.3 }}
          />

          {/* Badge */}
          <div
            className='absolute top-3 left-3 px-2.5 py-1 rounded-full text-white text-xs font-semibold'
            style={{
              background: product.badge === 'Best Seller' ? '#b45309'
                : product.badge === 'New Arrival' ? '#16a34a'
                : '#6b7280',
            }}
          >
            {product.badge}
          </div>
        </div>

        {/* Info */}
        <div className='p-4'>
          <h3
            className='font-semibold text-stone-800 mb-1 leading-snug'
            style={{ fontSize: 15 }}
          >
            {product.name}
          </h3>

          <p className='font-bold text-amber-700 mb-3' style={{ fontSize: 16 }}>
            ₹{product.price}
          </p>

          <motion.button
            onClick={handleAdd}
            disabled={adding || inCart}
            className='w-full py-2.5 rounded-xl font-semibold text-sm relative overflow-hidden'
            style={{
              background: inCart ? '#16a34a' : '#d97706',
              color: '#fff',
              transition: 'background 0.3s ease',
            }}
            whileHover={!inCart ? { background: '#b45309' } : {}}
            whileTap={{ scale: 0.97 }}
          >
            <AnimatePresence mode='wait'>
              {inCart ? (
                <motion.span
                  key='done'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className='flex items-center justify-center gap-1.5'
                >
                  ✓ In Cart
                </motion.span>
              ) : adding ? (
                <motion.span key='adding' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Added!
                </motion.span>
              ) : (
                <motion.span key='add' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Add to Cart
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Main Component ── */
export default function FeaturedTeas({ products: rawProducts, loading, onViewAll }: FeaturedTeasProps) {
  const navigate = useNavigate()
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const products = rawProducts.map(mapApiProduct)

  if (!loading && products.length === 0) return null

  return (
    <section
      ref={ref}
      className='py-16 px-4 sm:px-6'
      style={{ background: '#fafaf8' }}
    >
      <div className='max-w-6xl mx-auto'>

        {/* Header */}
        <div className='flex items-end justify-between mb-10'>
          <div>
            <motion.p
              className='text-xs font-bold tracking-widest uppercase mb-2'
              style={{ color: '#b45309' }}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4 }}
            >
              Hand Picked For You
            </motion.p>
            <motion.h2
              className='font-bold text-stone-900'
              style={{ fontSize: 'clamp(26px, 5vw, 38px)', lineHeight: 1.1 }}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Featured <span style={{ color: '#d97706' }}>Teas</span>
            </motion.h2>
          </div>

          <motion.button
            onClick={() => onViewAll ? onViewAll() : navigate('/products')}
            className='text-sm font-semibold hidden sm:block'
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
        <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} sectionVisible={inView} />
              ))}
        </div>

        {/* Mobile view all */}
        <motion.div
          className='mt-8 flex justify-center sm:hidden'
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={() => onViewAll ? onViewAll() : navigate('/products')}
            className='px-8 py-2.5 rounded-full text-sm font-semibold text-white'
            style={{ background: '#d97706' }}
          >
            View All Teas →
          </button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          className='mt-12 pt-8 border-t border-stone-100 flex flex-wrap justify-center gap-6 sm:gap-10'
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
        >
          {[
            { icon: '🌿', label: '100% Organic' },
            { icon: '🚚', label: 'Free Shipping ₹40+' },
            { icon: '🔒', label: 'Secure Checkout' },
            { icon: '♻️', label: 'Eco Packaging' },
          ].map(b => (
            <div key={b.label} className='flex items-center gap-2 text-stone-400 text-xs font-medium'>
              <span>{b.icon}</span>
              <span>{b.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}