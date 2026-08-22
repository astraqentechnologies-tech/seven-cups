import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HeroBanner, { defaultHeroSlides } from '../components/Herobanner'
import CategoryGrid from '../components/Categorygrid'
import FeaturedTeas from '../components/FeaturedTeas'
import WhyChooseUs from '../components/Whychooseus'
import OurStory from '../components/Ourstory'

const BASE_URL = 'https://admin.sevencups.in'

export interface ApiCategory {
  id: number
  name: string
  slug: string
  image_url: string | null
  description: string | null
  color: string | null
}

export interface ApiImage {
  id: number
  product_id: number
  image_path: string
  is_primary: number
  image_url: string
}

export interface ApiProduct {
  id: number
  name: string
  slug: string
  description: string
  category_id: number
  price: string
  compare_price: string
  weight_grams: number | null
  image_url?: string | null
  flavor_profile: string | null
  steep_time: string | null
  temperature: number | null
  benefits: string | null
  ingredients: string | null
  brewing_instructions: string | null
  is_active: number
  is_featured: number
  is_new_arrival: number
  is_best_seller: number
  created_at: string
  updated_at: string
  category?: { id: number; name: string; slug: string }
  images?: ApiImage[]
}

const CATEGORY_IMAGE_FALLBACK: Record<string, string> = {
  'herbal-detox': 'https://res.cloudinary.com/pjiarotf/image/upload/v1784315832/ChatGPT_Image_Jul_18_2026_12_19_53_AM_bjvb4c.png',
  'energy-vitality': 'https://res.cloudinary.com/pjiarotf/image/upload/v1784315811/ChatGPT_Image_Jul_18_2026_12_22_08_AM_jfmo8e.png',
  'detox-antioxidanty': 'https://res.cloudinary.com/pjiarotf/image/upload/v1784315829/ChatGPT_Image_Jul_18_2026_12_18_08_AM_d03bo9.png',
  'skin-health': 'https://res.cloudinary.com/pjiarotf/image/upload/v1784315775/ChatGPT_Image_Jul_18_2026_12_27_39_AM_c1yvj5.png',
  'relaxation-stress': 'https://res.cloudinary.com/pjiarotf/image/upload/v1784315801/Jul_18_2026_12_26_06_AM_mmwc8e.png',
  'wellness-hormonal': 'https://res.cloudinary.com/pjiarotf/image/upload/v1784315811/ChatGPT_Image_Jul_18_2026_12_12_56_AM_donaiu.png',
  'digestive-metabolic': 'https://res.cloudinary.com/pjiarotf/image/upload/v1784315769/ChatGPT_Image_Jul_18_2026_12_30_28_AM_kl5uhu.png',
}

// API product ko FeaturedTeas-compatible shape mein convert karo
function normalizeProduct(p: ApiProduct): any {
  const primaryImage = p.images?.find(i => i.is_primary === 1) ?? p.images?.[0]
  const imageUrl = primaryImage
    ? primaryImage.image_url.startsWith('http')
      ? primaryImage.image_url
      : `${BASE_URL}${primaryImage.image_url}`
    : null

  return {
    id: p.id,
    category_id: p.category_id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    compare_price: p.compare_price,
    weight_grams: p.weight_grams ?? 0,
    image_url: imageUrl,
    flavor_profile: p.flavor_profile ?? '',
    steep_time: p.steep_time ?? '',
    temperature: String(p.temperature ?? ''),
    benefits: p.benefits ?? '',
    ingredients: p.ingredients ?? '',
    brewing_instructions: p.brewing_instructions ?? '',
    is_active: p.is_active,
    is_featured: p.is_featured,
    is_new_arrival: p.is_new_arrival,
    is_best_seller: p.is_best_seller,
    created_at: p.created_at,
    updated_at: p.updated_at,
    category: p.category,
  }
}

export default function Home() {
  const navigate = useNavigate()

  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [catLoading, setCatLoading] = useState(true)

  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [prodLoading, setProdLoading] = useState(true)

  // Categories fetch
  useEffect(() => {
    fetch(`${BASE_URL}/api/categories`)
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json() })
      .then((data: ApiCategory[]) => {
        const normalized = data.map(cat => ({
          ...cat,
          image_url: cat.image_url
            ? cat.image_url.startsWith('http')
              ? cat.image_url
              : `${BASE_URL}/${cat.image_url}`
            : (CATEGORY_IMAGE_FALLBACK[cat.slug] ?? null),
        }))
        setCategories(normalized)
      })
      .catch(err => console.error('Categories fetch failed:', err))
      .finally(() => setCatLoading(false))
  }, [])

  // Featured products fetch
  useEffect(() => {
    fetch(`${BASE_URL}/api/products`)
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json() })
      .then((data: { featured: ApiProduct[]; new_arrival: ApiProduct[]; best_seller: ApiProduct[] }) => {
        const featured = (data.featured ?? []).slice(0, 4).map(normalizeProduct)
        setFeaturedProducts(featured)
      })
      .catch(err => console.error('Products fetch failed:', err))
      .finally(() => setProdLoading(false))
  }, [])

  return (
    <div className='min-h-screen bg-stone-50'>
      <HeroBanner slides={defaultHeroSlides} />
      <CategoryGrid categories={categories} loading={catLoading} />
      <FeaturedTeas
        products={featuredProducts}
        loading={prodLoading}
        onViewAll={() => navigate('/products')}
      />
      <WhyChooseUs />
      <OurStory />
    </div>
  )
}