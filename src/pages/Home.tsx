import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Star,
  ChevronLeft,
  ChevronRight,
  Play
} from 'lucide-react'
import ProductCard from '../components/ProductCard'

type Props = {
  onNavigate: (page: string, params?: Record<string, string>) => void
}

interface Category {
  id: number
  name: string
  slug: string
  image_url: string | null
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
}

interface HeroBanner {
  title: string
  subtitle: string
  cta: string
  image: string
  accent?: string
}

const defaultHeroBanners: HeroBanner[] = [
  {
    title: 'Discover the Art of Tea',
    subtitle: 'Sourced from ancient gardens, crafted with centuries of wisdom.',
    cta: 'Explore Collection',
    image: 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg',
    accent: 'from-stone-900/80 via-stone-900/50 to-transparent'
  },
  {
    title: 'New Season, New Arrivals',
    subtitle:
      'Spring harvests from the misty highlands of Japan and Darjeeling.',
    cta: 'Shop New Arrivals',
    image: 'https://images.pexels.com/photos/3887985/pexels-photo-3887985.jpeg',
    accent: 'from-stone-900/80 via-stone-900/40 to-transparent'
  },
  {
    title: 'Wellness in Every Cup',
    subtitle: 'Ancient remedies. Modern ritual. Pure, intentional blends.',
    cta: 'Explore Wellness',
    image: 'https://images.pexels.com/photos/1453712/pexels-photo-1453712.jpeg',
    accent: 'from-stone-900/80 via-stone-900/50 to-transparent'
  }
]

function AnimatedCounter ({
  end,
  duration = 2000,
  suffix = ''
}: {
  end: number
  duration?: number
  suffix?: string
}) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !started.current) {
        started.current = true
        const start = Date.now()
        const tick = () => {
          const elapsed = Date.now() - start
          const progress = Math.min(elapsed / duration, 1)
          setCount(Math.floor(end * (1 - Math.pow(1 - progress, 3))))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])

  return (
    <div ref={ref}>
      {count}
      {suffix}
    </div>
  )
}

export default function Home ({ onNavigate }: Props) {
  const [heroIdx, setHeroIdx] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>(defaultHeroBanners)
  const [categories, setCategories] = useState<Category[]>([])
  const [featured, setFeatured] = useState<Product[]>([])
  const [newArrivals, setNewArrivals] = useState<Product[]>([])
  const [bestSellers, setBestSellers] = useState<Product[]>([])

  const API_BASE_URL = 'https://www.astraqentechnologies.com/sevencups/api'

  useEffect(() => {
    const fetchWithCheck = (url: string, setter: (data: any) => void) => {
      fetch(url)
        .then(res => {
          if (!res.ok)
            throw new Error(`Server responded with status ${res.status}`)
          return res.json()
        })
        .then(data => setter(Array.isArray(data) ? data : data?.data || []))
        .catch(err => console.error(`Error fetching from ${url}:`, err))
    }

    fetchWithCheck(`${API_BASE_URL}/hero-banner`, setHeroBanners)
    fetchWithCheck(`${API_BASE_URL}/categories`, setCategories)
    fetchWithCheck(`${API_BASE_URL}/products?featured=1&limit=4`, setFeatured)
    fetchWithCheck(
      `${API_BASE_URL}/products?new_arrival=1&limit=4`,
      setNewArrivals
    )
    fetchWithCheck(
      `${API_BASE_URL}/products?best_seller=1&limit=4`,
      setBestSellers
    )
  }, [])

  useEffect(() => {
    if (!heroBanners.length) return

    intervalRef.current = setInterval(
      () => setHeroIdx(i => (i + 1) % heroBanners.length),
      5500
    )
    return () => clearInterval(intervalRef.current)
  }, [heroBanners.length])

  const activeHero = heroBanners[heroIdx] || heroBanners[0] || defaultHeroBanners[0]

  return (
    <div className='min-h-screen bg-stone-50'>
      {/* Hero Section */}
      <section className='relative w-full max-w-[1920px] h-[600px] mx-auto overflow-hidden bg-stone-900'>
        {heroBanners.map((b, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === heroIdx ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Explicit sizing limits to 1920x600px view */}
            <img
              src={b.image}
              alt={b.title}
              className='w-full h-[600px] object-cover scale-105'
            />
            {/* Solid dark gradient overlay instead of dynamic transparent accent classes */}
            <div className='absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent' />
          </div>
        ))}
        {/* Flex layout container aligned within the 600px height limit */}
       
      </section>

      {/* Stats row */}
      <section className='bg-stone-900 py-14'>
        <div className='max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center'>
          {[
            { value: 50, suffix: '+', label: 'Tea Varieties' },
            { value: 12, suffix: '+', label: 'Source Countries' },
            { value: 25000, suffix: '+', label: 'Happy Customers' },
            { value: 8, suffix: '+', label: 'Years of Expertise' }
          ].map((stat, i) => (
            <div key={i} className='flex flex-col items-center'>
              <div className='text-amber-400 font-bold text-4xl md:text-5xl font-serif mb-2'>
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <p className='text-stone-400 text-sm tracking-wide uppercase'>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Grid Collections */}
      <section className='py-20 bg-white'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='text-center mb-14'>
            <span className='text-amber-600 text-sm font-medium tracking-widest uppercase'>
              Discover
            </span>
            <h2 className='text-4xl md:text-5xl font-bold text-stone-900 font-serif mt-2 mb-4'>
              Explore Our Collections
            </h2>
          </div>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onNavigate('products', { category: cat.slug })}
                className='group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer w-full text-left'
              >
                <img
                  src={
                    cat.image_url ||
                    'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg'
                  }
                  alt={cat.name}
                  className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent' />
                <div className='absolute bottom-0 left-0 right-0 p-4'>
                  <p className='text-white font-semibold text-sm font-serif leading-tight'>
                    {cat.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Render Product Panels */}
      {featured.length > 0 && (
        <section className='py-20 bg-stone-50'>
          <div className='max-w-7xl mx-auto px-6'>
            <h2 className='text-4xl font-bold text-stone-900 font-serif mb-12'>
              Featured Teas
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
              {featured.map(p => (
                <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
