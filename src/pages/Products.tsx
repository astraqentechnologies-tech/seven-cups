import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, SlidersHorizontal, X, ChevronDown, Leaf, PackageSearch } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import type { ApiProduct } from './Home'

const BASE_URL = 'https://admin.sevencups.in'

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Best Sellers', value: 'best_seller' },
]

function normalizeProductForCard(p: ApiProduct, baseUrl: string) {
  const primaryImage = p.images?.find(i => i.is_primary === 1) ?? p.images?.[0]
  const imageUrl = primaryImage
    ? primaryImage.image_url.startsWith('http')
      ? primaryImage.image_url
      : `${baseUrl}${primaryImage.image_url}`
    : null

  return {
    ...p,
    image_url: imageUrl,
    price: Number(p.price),
    compare_price: Number(p.compare_price),
    categories: p.category ?? null,
  }
}

export default function Products() {
  const [allProducts, setAllProducts] = useState<ReturnType<typeof normalizeProductForCard>[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const [filtersOpen, setFiltersOpen] = useState(false)

  // URL se category param read karo (CategoryGrid se navigate hota hai)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const cat = params.get('category')
    if (cat) setSelectedCategory(cat)
  }, [])

  // Fetch all products
  useEffect(() => {
    fetch(`${BASE_URL}/api/products`)
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json() })
      .then((data: { featured: ApiProduct[]; new_arrival: ApiProduct[]; best_seller: ApiProduct[] }) => {
        // Deduplicate by id — featured + new_arrival + best_seller merge
        const seen = new Set<number>()
        const merged: ApiProduct[] = []
        for (const p of [...(data.featured ?? []), ...(data.new_arrival ?? []), ...(data.best_seller ?? [])]) {
          if (!seen.has(p.id)) { seen.add(p.id); merged.push(p) }
        }
        setAllProducts(merged.map(p => normalizeProductForCard(p, BASE_URL)))
      })
      .catch(err => console.error('Products fetch failed:', err))
      .finally(() => setLoading(false))
  }, [])

  // Categories from products
  const CATEGORIES = useMemo(() => {
    const map = new Map<string, { name: string; slug: string }>()
    allProducts.forEach(p => {
      if (p.category) {
        map.set(p.category.slug, { name: p.category.name, slug: p.category.slug })
      }
    })
    return [...map.values()]
  }, [allProducts])

  const products = useMemo(() => {
    let result = [...allProducts]

    if (search.trim()) {
      result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    }

    if (selectedCategory) {
      result = result.filter(p => p.category?.slug === selectedCategory)
    }

    if (sortBy === 'price_asc') result.sort((a, b) => a.price - b.price)
    else if (sortBy === 'price_desc') result.sort((a, b) => b.price - a.price)
    else if (sortBy === 'newest') result = [...result.filter(p => p.is_new_arrival), ...result.filter(p => !p.is_new_arrival)]
    else if (sortBy === 'best_seller') result = [...result.filter(p => p.is_best_seller), ...result.filter(p => !p.is_best_seller)]
    else result = [...result.filter(p => p.is_featured), ...result.filter(p => !p.is_featured)]

    return result
  }, [allProducts, search, selectedCategory, sortBy])

  const activeCategory = CATEGORIES.find(c => c.slug === selectedCategory)
  const activeSortLabel = sortOptions.find(o => o.value === sortBy)?.label || 'Featured'

  return (
    <div className='min-h-screen bg-stone-50 pt-16 md:pt-20'>

      {/* Banner */}
      <div className='relative bg-stone-900 overflow-hidden'>
        <motion.img
          key={selectedCategory || 'default'}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 0.25, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          src='https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg'
          alt='Teas'
          className='absolute inset-0 w-full h-full object-cover'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-stone-900/30' />
        <div className='absolute inset-0 bg-gradient-to-r from-stone-900/40 via-transparent to-stone-900/40' />

        <div className='relative px-5 sm:px-6 py-14 sm:py-20 md:py-24 max-w-7xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='flex items-center gap-2 mb-3'
          >
            <Leaf className='w-3.5 h-3.5 text-amber-400' />
            <span className='text-amber-400 text-[11px] sm:text-xs tracking-[0.2em] uppercase font-semibold'>
              Our Collection
            </span>
          </motion.div>

          <motion.h1
            key={activeCategory ? activeCategory.name : 'all'}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className='text-3xl sm:text-4xl md:text-5xl font-bold text-white font-serif mb-3 leading-tight'
          >
            {activeCategory ? activeCategory.name : 'All Teas'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className='text-stone-300 text-sm sm:text-base max-w-xl leading-relaxed'
          >
            Explore our complete collection of exceptional teas, sourced from the finest gardens around the world.
          </motion.p>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-5 sm:px-6 py-8 sm:py-10'>

        {/* Search + Filters bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8'
        >
          <div className='relative flex-1'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400' />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Search teas by name...'
              className='w-full pl-11 pr-10 py-3 sm:py-3.5 bg-white border border-stone-200 rounded-full text-stone-800 placeholder-stone-400 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all shadow-sm'
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setSearch('')}
                  aria-label='Clear search'
                  className='absolute right-4 top-1/2 -translate-y-1/2'
                >
                  <X className='w-4 h-4 text-stone-400 hover:text-stone-600' />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className='flex gap-3'>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center justify-center gap-2 px-5 py-3 sm:py-3.5 rounded-full text-sm font-medium transition-colors md:hidden flex-1 sm:flex-none border ${
                filtersOpen
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-amber-400'
              }`}
            >
              <motion.span animate={{ rotate: filtersOpen ? 180 : 0 }} transition={{ duration: 0.3 }} className='flex'>
                <SlidersHorizontal className='w-4 h-4' />
              </motion.span>
              Filters
              {selectedCategory && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className='w-1.5 h-1.5 rounded-full bg-amber-400'
                />
              )}
            </motion.button>

            <div className='relative flex-1 sm:flex-none'>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                aria-label='Sort products'
                className='appearance-none w-full pl-4 pr-10 py-3 sm:py-3.5 bg-white border border-stone-200 rounded-full text-stone-700 text-sm font-medium outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 cursor-pointer shadow-sm transition-all'
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className='absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none' />
            </div>
          </div>
        </motion.div>

        {/* Active filter chips */}
        <AnimatePresence>
          {(selectedCategory || search) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className='flex flex-wrap items-center gap-2 mb-6 -mt-2 overflow-hidden'
            >
              {selectedCategory && activeCategory && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory('')}
                  className='inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium hover:bg-amber-100 transition-colors'
                >
                  {activeCategory.name}
                  <X className='w-3 h-3' />
                </motion.button>
              )}
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearch('')}
                  className='inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-stone-600 text-xs font-medium hover:bg-stone-200 transition-colors'
                >
                  "{search}"
                  <X className='w-3 h-3' />
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className='flex flex-col md:flex-row gap-6 md:gap-8'>

          {/* Sidebar */}
          <motion.aside
            initial={false}
            animate={{ height: filtersOpen ? 'auto' : 0, opacity: filtersOpen ? 1 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className='md:!h-auto md:!opacity-100 overflow-hidden md:overflow-visible w-full md:w-64 shrink-0 md:block'
          >
            <div className='bg-white rounded-2xl border border-stone-100 p-5 sm:p-6 md:sticky md:top-24 shadow-sm'>
              <div className='flex items-center justify-between mb-4 sm:mb-5'>
                <h3 className='font-bold text-stone-900 text-sm uppercase tracking-wide'>Categories</h3>
                {selectedCategory && (
                  <button onClick={() => setSelectedCategory('')} className='text-xs text-amber-600 hover:text-amber-700 font-medium'>
                    Clear
                  </button>
                )}
              </div>

              <div className='flex flex-col gap-1'>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedCategory('')}
                  className={`text-left px-3 py-2.5 rounded-lg text-sm transition-colors relative overflow-hidden ${
                    !selectedCategory ? 'text-amber-700 font-semibold' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {!selectedCategory && (
                    <motion.span layoutId='category-highlight' className='absolute inset-0 bg-amber-50 rounded-lg' transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                  )}
                  <span className='relative z-10'>All Teas</span>
                </motion.button>

                {CATEGORIES.map(cat => (
                  <motion.button
                    key={cat.slug}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setSelectedCategory(selectedCategory === cat.slug ? '' : cat.slug); setFiltersOpen(false) }}
                    className={`text-left px-3 py-2.5 rounded-lg text-sm transition-colors relative overflow-hidden ${
                      selectedCategory === cat.slug ? 'text-amber-700 font-semibold' : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {selectedCategory === cat.slug && (
                      <motion.span layoutId='category-highlight' className='absolute inset-0 bg-amber-50 rounded-lg' transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                    )}
                    <span className='relative z-10'>{cat.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.aside>

          {/* Products grid */}
          <div className='flex-1 min-w-0'>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className='flex items-center justify-between mb-5 sm:mb-6'
            >
              <p className='text-stone-500 text-sm'>
                {loading ? 'Loading...' : `${products.length} ${products.length === 1 ? 'product' : 'products'}`}
              </p>
              <p className='hidden sm:block text-stone-400 text-xs'>
                Sorted by <span className='text-stone-600 font-medium'>{activeSortLabel}</span>
              </p>
            </motion.div>

            <AnimatePresence mode='wait'>
              {loading ? (
                // Skeleton grid
                <motion.div
                  key='skeleton'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className='grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className='bg-white rounded-2xl overflow-hidden border border-stone-100'>
                      <div className='h-[220px] bg-stone-100 animate-pulse' />
                      <div className='p-5 space-y-3'>
                        <div className='h-4 bg-stone-100 rounded animate-pulse w-3/4' />
                        <div className='h-3 bg-stone-100 rounded animate-pulse' />
                        <div className='h-3 bg-stone-100 rounded animate-pulse w-5/6' />
                        <div className='h-10 bg-stone-100 rounded-xl animate-pulse mt-2' />
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : products.length === 0 ? (
                <motion.div
                  key='empty'
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className='flex flex-col items-center text-center py-16 sm:py-24 px-6 bg-white rounded-2xl border border-stone-100'
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className='w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-4'
                  >
                    <PackageSearch className='w-6 h-6 text-amber-500' />
                  </motion.div>
                  <p className='text-stone-700 text-base sm:text-lg font-semibold mb-1'>No teas found</p>
                  <p className='text-stone-400 text-sm max-w-sm mb-5'>
                    We couldn't find anything matching your search or filters. Try adjusting them or browse our full collection.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setSearch(''); setSelectedCategory('') }}
                    className='px-5 py-2.5 rounded-full bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors'
                  >
                    Clear filters
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key={`grid-${selectedCategory}-${sortBy}-${search}`}
                  initial='hidden'
                  animate='visible'
                  variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                  className='grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
                >
                  {products.map((p, i) => (
                    <motion.div
                      key={p.id}
                      variants={{ hidden: { opacity: 0, y: 18, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1 } }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      whileHover={{ y: -4 }}
                    >
                      <ProductCard product={p as any} index={i} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}