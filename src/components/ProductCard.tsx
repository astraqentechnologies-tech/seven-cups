import { ShoppingCart, Heart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useState } from 'react'

interface ProductCategory {
  name: string
  slug?: string
}

interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: number | string
  image_url: string | null
  compare_price?: number | string
  weight_grams?: number
  is_new_arrival: boolean | number
  is_best_seller: boolean | number
  categories?: ProductCategory[] | ProductCategory | string
}

type Props = {
  product: Product
  onNavigate: (page: string, params?: Record<string, string>) => void
}

export default function ProductCard ({ product, onNavigate }: Props) {
  const { addToCart, isInCart } = useCart()
  const [adding, setAdding] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const inCart = isInCart(product.id)

  // Explicit type-casting for safety with database types
  const numericPrice = Number(product.price || 0)
  const numericComparePrice = Number(product.compare_price || 0)
  const discount =
    numericComparePrice > numericPrice
      ? Math.round(
          ((numericComparePrice - numericPrice) / numericComparePrice) * 100
        )
      : 0

  // Standard safe rendering fallback for Laravel nested structural arrays
  const getCategoryLabel = () => {
    if (!product.categories) return null
    if (Array.isArray(product.categories) && product.categories.length > 0) {
      return product.categories[0].name
    }
    if (
      typeof product.categories === 'object' &&
      'name' in product.categories
    ) {
      return product.categories.name
    }
    if (typeof product.categories === 'string') {
      return product.categories
    }
    return null
  }

  const categoryLabel = getCategoryLabel()

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setAdding(true)
    await addToCart(product as any)
    setTimeout(() => setAdding(false), 600)
  }

  return (
    <div
      onClick={() => onNavigate('product', { slug: product.slug })}
      className='group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-stone-100 hover:border-amber-200'
    >
      <div className='relative overflow-hidden bg-stone-50 aspect-[4/3]'>
        <img
          src={
            product.image_url ||
            'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg'
          }
          alt={product.name}
          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
        />
        <div className='absolute top-3 left-3 flex flex-col gap-1.5 z-10'>
          {!!product.is_new_arrival && (
            <span className='bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm'>
              New
            </span>
          )}
          {!!product.is_best_seller && (
            <span className='bg-amber-500 text-stone-900 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm'>
              Best
            </span>
          )}
          {discount > 0 && (
            <span className='bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm'>
              -{discount}%
            </span>
          )}
        </div>
        <button
          onClick={e => {
            e.stopPropagation()
            setWishlisted(!wishlisted)
          }}
          className='absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10'
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              wishlisted
                ? 'text-red-500 fill-red-500'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          />
        </button>
      </div>

      <div className='p-4 flex-1 flex flex-col'>
        {categoryLabel && (
          <span className='text-[11px] font-semibold tracking-wider uppercase text-amber-600 mb-1 block'>
            {categoryLabel}
          </span>
        )}
        <h3 className='text-stone-800 font-bold text-base leading-snug mb-1 font-serif group-hover:text-amber-700 transition-colors line-clamp-1'>
          {product.name}
        </h3>
        <p className='text-stone-500 text-xs line-clamp-2 mb-3 h-8'>
          {product.description || 'No description available.'}
        </p>
        <div className='flex items-center justify-between mt-auto pt-2'>
          <div className='flex items-baseline gap-2'>
            <span className='text-stone-900 font-bold text-lg'>
              ${numericPrice.toFixed(2)}
            </span>
            {discount > 0 && (
              <span className='text-stone-400 text-xs line-through'>
                ${numericComparePrice.toFixed(2)}
              </span>
            )}
          </div>
          {product.weight_grams && (
            <span className='text-stone-400 text-xs font-medium bg-stone-100 px-2 py-0.5 rounded'>
              {product.weight_grams}g
            </span>
          )}
        </div>
      </div>

      <div className='px-4 pb-4' onClick={e => e.stopPropagation()}>
        <button
          onClick={handleAddToCart}
          disabled={adding}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
            inCart
              ? 'bg-emerald-500 text-white'
              : 'bg-stone-900 hover:bg-amber-600 text-white hover:scale-[1.02]'
          }`}
        >
          <ShoppingCart className='w-4 h-4' />
          {adding ? 'Added!' : inCart ? 'In Cart' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}
