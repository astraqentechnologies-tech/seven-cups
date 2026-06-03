import { useState, useEffect } from 'react'
import {
  ShoppingCart,
  Star,
  ChevronLeft,
  Leaf,
  Clock,
  Droplets,
  Thermometer,
  Package,
  ArrowRight,
  Plus,
  Minus
} from 'lucide-react'
import { useProduct, useProducts } from '../hooks/useProducts'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'
import { useAuth } from '../context/AuthContext'

type Props = {
  slug: string
  onNavigate: (page: string, params?: Record<string, string>) => void
}

interface ProductReview {
  id: number
  reviewer_name: string
  rating: number
  title?: string
  body: string
}

export default function ProductDetail({ slug, onNavigate }: Props) {
  const productHookData = useProduct(slug)
  const { products: related } = useProducts({ limit: 5 })
  const { addToCart } = useCart()
  const { user, profile } = useAuth()

  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [activeTab, setActiveTab] = useState('description')
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' })
  const [submitting, setSubmitting] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  const API_BASE_URL = 'http://localhost:8000/api'

  // ROBUST HYPER-DEFENSIVE UNWRAPPING ENGINE
  const getUnwrappedProduct = () => {
    if (!productHookData) return null;
    if (productHookData.product) {
      const p = productHookData.product as any;
      if (p.data && typeof p.data === 'object' && !Array.isArray(p.data)) return p.data;
      if (p.product && typeof p.product === 'object') return p.product;
      return p;
    }
    return null;
  }

  const product = getUnwrappedProduct()
  const loading = productHookData?.loading

  const handleAddToCart = async () => {
    if (!product) return
    setAdding(true)
    await addToCart(product as any, qty)
    setTimeout(() => setAdding(false), 700)
  }

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !product) return
    setSubmitting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          reviewer_name: profile?.full_name || 'Anonymous',
          ...reviewForm
        })
      })
      if (response.ok) setReviewSubmitted(true)
    } catch (err) {
      console.error('Failed to submit product review:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-stone-50 pt-24'>
        <div className='max-w-7xl mx-auto px-6 animate-pulse'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 py-12'>
            <div className='bg-stone-200 rounded-3xl aspect-square' />
            <div className='space-y-6'>
              <div className='h-4 bg-stone-200 rounded w-1/4' />
              <div className='h-10 bg-stone-200 rounded w-3/4' />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product || !product.name) {
    return (
      <div className='min-h-screen bg-stone-50 pt-24 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-stone-400 text-lg mb-4'>Product not found.</p>
          <button onClick={() => onNavigate('products')} className='text-amber-600 hover:underline font-medium'>
            Browse all teas
          </button>
        </div>
      </div>
    )
  }

  const images: string[] = product.product_images && product.product_images.length > 0
    ? [...product.product_images].sort((a: any, b: any) => a.sort_order - b.sort_order).map((i: any) => i.url)
    : [product.image_url || 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg']

  const comparePrice = product.compare_price || 0
  const discount = comparePrice > 0 ? Math.round(((comparePrice - product.price) / comparePrice) * 100) : 0
  const productReviews: ProductReview[] = product.reviews || []

  return (
    <div className='min-h-screen bg-stone-50 pt-20'>
      <div className='max-w-7xl mx-auto px-6 py-8'>
        <button onClick={() => onNavigate('products')} className='flex items-center gap-2 text-stone-500 hover:text-amber-600 text-sm mb-8 transition-colors'>
          <ChevronLeft className='w-4 h-4' /> Back to All Teas
        </button>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20'>
          <div className='space-y-4'>
            <div className='aspect-square rounded-3xl overflow-hidden bg-white border border-stone-100 shadow-sm'>
              <img src={images[activeImage]} alt={product.name} className='w-full h-full object-cover' />
            </div>
          </div>

          <div>
            <h1 className='text-4xl md:text-5xl font-bold text-stone-900 font-serif mb-4'>{product.name}</h1>
            <p className='text-stone-600 text-base mb-6'>{product.description || 'No description available.'}</p>
            <div className='flex items-baseline gap-3 mb-8'>
              <span className='text-4xl font-bold text-stone-900'>${Number(product.price).toFixed(2)}</span>
            </div>

            <div className='flex items-center gap-4 mb-6'>
              <div className='flex items-center gap-3 bg-stone-100 rounded-full px-4 py-2'>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className='w-7 h-7 flex items-center justify-center rounded-full hover:bg-stone-200'><Minus className='w-3 h-3' /></button>
                <span className='w-8 text-center font-bold text-stone-800'>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className='w-7 h-7 flex items-center justify-center rounded-full hover:bg-stone-200'><Plus className='w-3 h-3' /></button>
              </div>
              <button onClick={handleAddToCart} disabled={adding} className='flex-1 py-4 bg-stone-900 hover:bg-amber-600 text-white font-bold rounded-full transition-all'>
                {adding ? 'Added to Cart!' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Selection Panel */}
        <div className='bg-white rounded-3xl border border-stone-100 overflow-hidden shadow-sm mb-16'>
          <div className='flex border-b border-stone-100'>
            {['description', 'ingredients', 'brewing', 'reviews'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-4 text-sm font-semibold capitalize ${activeTab === tab ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/50' : 'text-stone-500'}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className='p-8'>
            {activeTab === 'description' && <p className='text-stone-700 leading-relaxed'>{product.description}</p>}
            {activeTab === 'ingredients' && <p className='text-stone-600'>{product.ingredients || 'Pure single-origin tea leaves.'}</p>}
            {activeTab === 'brewing' && <p className='text-stone-600'>{product.brewing_instructions || 'Steep in hot water for 3-5 minutes.'}</p>}
            {activeTab === 'reviews' && (
              <div>
                {productReviews.length > 0 ? (
                  productReviews.map(r => (
                    <div key={r.id} className='border-b border-stone-100 pb-6 mb-4'>
                      <p className='font-semibold text-stone-800 text-sm'>{r.reviewer_name}</p>
                      <p className='text-stone-500 text-sm'>{r.body}</p>
                    </div>
                  ))
                ) : (
                  <p className='text-stone-400 text-sm'>No reviews yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}