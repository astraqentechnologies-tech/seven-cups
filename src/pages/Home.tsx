import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HeroBanner, { defaultHeroSlides, type HeroBannerSlide } from '../components/HeroBanner'
import StatsBar from '../components/StatsBar'
import CategoryGrid from '../components/CategoryGrid'
import FeaturedTeas from '../components/FeaturedTeas'
import WhyChooseUs from '../components/Whychooseus'
import OurStory from '../components/Ourstory'

interface Category {
  id: number
  name: string
  slug: string
  image_url: string | null
}

export interface ApiProduct {
  id: number
  category_id: number
  name: string
  slug: string
  description: string
  price: string
  compare_price: string
  weight_grams: number
  image_url: string | null
  flavor_profile: string
  steep_time: string
  temperature: string
  benefits: string
  ingredients: string
  brewing_instructions: string
  is_active: number
  is_featured: number
  is_new_arrival: number
  is_best_seller: number
  created_at: string
  updated_at: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL

export default function Home() {
  const navigate = useNavigate()
  const [heroSlides, setHeroSlides] = useState<HeroBannerSlide[]>(defaultHeroSlides)
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<ApiProduct[]>([])
  const [featuredLoading, setFeaturedLoading] = useState(true)

  useEffect(() => {
    const fetchWithCheck = (url: string, setter: (data: any) => void, onDone?: () => void) => {
      fetch(url)
        .then(res => {
          if (!res.ok) throw new Error(`Server responded with status ${res.status}`)
          return res.json()
        })
        .then(data => setter(Array.isArray(data) ? data : data?.data ?? []))
        .catch(err => console.error(`Error fetching from ${url}:`, err))
        .finally(() => onDone?.())
    }

    fetchWithCheck(`${API_BASE_URL}/hero-banner`, setHeroSlides)
    fetchWithCheck(`${API_BASE_URL}/categories`, setCategories)
    fetchWithCheck(
      `${API_BASE_URL}/products?featured=1&limit=4`,
      setFeaturedProducts,
      () => setFeaturedLoading(false)
    )
  }, [])

  return (
    <div className='min-h-screen bg-stone-50'>
      <HeroBanner />
      <StatsBar speedPx={60} />
      <CategoryGrid categories={categories} />
      <FeaturedTeas
        products={featuredProducts}
        loading={featuredLoading}
        onViewAll={() => navigate('/products')}
      />
      <WhyChooseUs />
      <OurStory />
    </div>
  )
}