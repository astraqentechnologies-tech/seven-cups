import { useNavigate } from 'react-router-dom'
import HeroBanner, { defaultHeroSlides } from '../components/Herobanner'
import StatsBar from '../components/Statsbar'
import CategoryGrid from '../components/Categorygrid'
import FeaturedTeas from '../components/FeaturedTeas'
import WhyChooseUs from '../components/Whychooseus'
import OurStory from '../components/Ourstory'
import { PRODUCTS } from '../data/productsData'

// ✅ Static categories — abhi sirf 1 category hai
const STATIC_CATEGORIES = [
  {
    id: 1,
    name: 'Herbal-Detox',
    slug: 'Herbal-Detox',
    image_url: 'https://res.cloudinary.com/dlebmdfhr/image/upload/v1781547663/ChatGPT_Image_Jun_15_2026_11_49_53_PM_a9hq0z.png',
  },
  {
    id: 2,
    name: 'Energy-Vitality',
    slug: 'Energy-Vitality',
    image_url: 'https://res.cloudinary.com/dlebmdfhr/image/upload/v1781553116/ChatGPT_Image_Jun_16_2026_01_20_34_AM_v6ob4s.png',
  },
  {
    id: 3,
    name: 'Detox-Antioxidanty',
    slug: 'Detox-Antioxidanty',
    image_url: 'https://res.cloudinary.com/dlebmdfhr/image/upload/v1781557237/ChatGPT_Image_Jun_16_2026_02_30_15_AM_eyvxq5.png',
  },
  {
    id: 4,
    name: "Women's Wellness-Hormonal Balance",
    slug: 'Wellness-Hormonal',
    image_url: 'https://res.cloudinary.com/dlebmdfhr/image/upload/v1781560063/ChatGPT_Image_Jun_16_2026_03_16_57_AM_bsdnyf.png',
  },
]

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

// ✅ Featured products — PRODUCTS array se filter karo
const FEATURED_PRODUCTS = PRODUCTS.filter(p => p.is_featured).slice(0, 4).map(p => ({
  id: p.id,
  category_id: 1,
  name: p.name,
  slug: p.slug,
  description: p.description,
  price: String(p.price),
  compare_price: String(p.compare_price ?? 0),
  weight_grams: p.weight_grams ?? 0,
  image_url: p.image_url,
  flavor_profile: p.flavor_profile ?? '',
  steep_time: p.steep_time ?? '',
  temperature: p.temperature ?? '',
  benefits: '',
  ingredients: p.ingredients ?? '',
  brewing_instructions: p.brewing_instructions ?? '',
  is_active: 1,
  is_featured: p.is_featured ? 1 : 0,
  is_new_arrival: p.is_new_arrival ? 1 : 0,
  is_best_seller: p.is_best_seller ? 1 : 0,
  created_at: '',
  updated_at: '',
}))

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className='min-h-screen bg-stone-50'>
      <HeroBanner slides={defaultHeroSlides} />
      <StatsBar speedPx={60} />
      <CategoryGrid categories={STATIC_CATEGORIES} />
      <FeaturedTeas
        products={FEATURED_PRODUCTS}
        loading={false}
        onViewAll={() => navigate('/products')}
      />
      <WhyChooseUs />
      <OurStory />
    </div>
  )
}