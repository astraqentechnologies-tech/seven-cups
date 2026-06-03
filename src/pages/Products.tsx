import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { useCategories } from '../hooks/useProducts'

type Props = {
  onNavigate: (page: string, params?: Record<string, string>) => void
  initialCategory?: string
  initialSearch?: string
}

// Internal interfaces matching your Laravel API response types
interface Category {
  id: number
  name: string
  slug: string
  image_url: string | null
  banner_url?: string | null
  description?: string
}

interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: number
  image_url: string | null
  is_featured: boolean
  is_new_arrival: boolean
  is_best_seller: boolean
  categories?: { name: string } | string
}

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Best Sellers', value: 'best_seller' }
]

export default function Products ({
  onNavigate,
  initialCategory,
  initialSearch
}: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(initialSearch || '')
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory || ''
  )
  const [sortBy, setSortBy] = useState('featured')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { categories } = useCategories() as { categories: Category[] }

  const API_BASE_URL = 'https://www.astraqentechnologies.com/sevencups/api'

  useEffect(() => {
    setLoading(true)

    // Build the query string for your Laravel ProductController
    const queryParams = new URLSearchParams()

    if (search) {
      queryParams.append('search', search)
    }
    if (selectedCategory) {
      queryParams.append('category', selectedCategory)
    }
    if (sortBy) {
      queryParams.append('sort_by', sortBy)
    }

    // Fetch collections from your active Laravel API
    fetch(`${API_BASE_URL}/products?${queryParams.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP Error status: ${res.status}`)
        return res.json()
      })
      .then(data => {
        setProducts(Array.isArray(data) ? data : [])
      })
      .catch(err => {
        console.error('Failed to parse backend catalog items:', err)
        setProducts([]) // Safe array fallback bounds error handling
      })
      .finally(() => {
        setLoading(false)
      })
  }, [search, selectedCategory, sortBy])

  const activeCategory = categories.find(c => c.slug === selectedCategory)

  return (
    <div className='min-h-screen bg-stone-50 pt-20'>
      {/* Banner */}
      <div className='relative bg-stone-900 overflow-hidden'>
        {activeCategory?.banner_url || activeCategory?.image_url ? (
          <img
            src={activeCategory.banner_url || activeCategory.image_url || ''}
            alt={activeCategory.name}
            className='absolute inset-0 w-full h-full object-cover opacity-20'
          />
        ) : (
          <img
            src='https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg'
            alt='Teas'
            className='absolute inset-0 w-full h-full object-cover opacity-20'
          />
        )}
        <div className='relative px-6 py-20 max-w-7xl mx-auto'>
          <span className='text-amber-400 text-xs tracking-widest uppercase font-medium'>
            Our Collection
          </span>
          <h1 className='text-4xl md:text-5xl font-bold text-white font-serif mt-2 mb-3'>
            {activeCategory ? activeCategory.name : 'All Teas'}
          </h1>
          <p className='text-stone-300 text-base max-w-xl leading-relaxed'>
            {activeCategory?.description ||
              'Explore our complete collection of exceptional teas from around the world.'}
          </p>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-6 py-10'>
        {/* Search + Filters */}
        <div className='flex flex-col md:flex-row gap-4 mb-8'>
          <div className='relative flex-1'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400' />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Search teas by name...'
              className='w-full pl-11 pr-4 py-3.5 bg-white border border-stone-200 rounded-full text-stone-800 placeholder-stone-400 text-sm outline-none focus:border-amber-400 transition-colors'
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className='absolute right-4 top-1/2 -translate-y-1/2'
              >
                <X className='w-4 h-4 text-stone-400 hover:text-stone-600' />
              </button>
            )}
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className='flex items-center gap-2 px-5 py-3.5 bg-white border border-stone-200 rounded-full text-stone-700 text-sm font-medium hover:border-amber-400 transition-colors md:hidden'
          >
            <SlidersHorizontal className='w-4 h-4' /> Filters
          </button>
          {/* Sort */}
          <div className='relative'>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className='appearance-none pl-4 pr-10 py-3.5 bg-white border border-stone-200 rounded-full text-stone-700 text-sm font-medium outline-none focus:border-amber-400 cursor-pointer'
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none' />
          </div>
        </div>

        <div className='flex gap-8'>
          {/* Sidebar Filters */}
          <aside
            className={`${
              filtersOpen ? 'block' : 'hidden'
            } md:block w-full md:w-64 shrink-0`}
          >
            <div className='bg-white rounded-2xl border border-stone-100 p-6 sticky top-24'>
              <div className='flex items-center justify-between mb-5'>
                <h3 className='font-bold text-stone-900 text-sm uppercase tracking-wide'>
                  Categories
                </h3>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory('')}
                    className='text-xs text-amber-600 hover:text-amber-700 font-medium'
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className='flex flex-col gap-1'>
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    !selectedCategory
                      ? 'bg-amber-50 text-amber-700 font-semibold'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  All Teas
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() =>
                      setSelectedCategory(
                        selectedCategory === cat.slug ? '' : cat.slug
                      )
                    }
                    className={`text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      selectedCategory === cat.slug
                        ? 'bg-amber-50 text-amber-700 font-semibold'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products grid */}
          <div className='flex-1'>
            <div className='flex items-center justify-between mb-6'>
              <p className='text-stone-500 text-sm'>
                {loading ? '...' : `${products.length} products`}
              </p>
            </div>
            {loading ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className='bg-white rounded-2xl overflow-hidden animate-pulse'
                  >
                    <div className='bg-stone-100 aspect-[4/3]' />
                    <div className='p-4 space-y-3'>
                      <div className='h-3 bg-stone-100 rounded w-1/4' />
                      <div className='h-5 bg-stone-100 rounded w-3/4' />
                      <div className='h-3 bg-stone-100 rounded' />
                      <div className='h-8 bg-stone-100 rounded-xl mt-4' />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className='text-center py-24'>
                <p className='text-stone-400 text-lg font-medium'>
                  No teas found.
                </p>
                <button
                  onClick={() => {
                    setSearch('')
                    setSelectedCategory('')
                  }}
                  className='mt-4 text-amber-600 text-sm hover:underline'
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                {products.map(p => (
                  <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
