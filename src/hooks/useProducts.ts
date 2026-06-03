import { useEffect, useState } from 'react'

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: number
  image_url: string | null
  compare_price?: number
  weight_grams?: number
  is_featured: boolean
  is_new_arrival: boolean
  is_best_seller: boolean
  categories?: { name: string; slug: string } | string
  product_images?: Array<{ id: number; url: string; sort_order: number }>
  reviews?: Array<{
    id: number
    reviewer_name: string
    rating: number
    title?: string
    body: string
  }>
}

export interface Category {
  id: number
  name: string
  slug: string
  image_url: string | null
}

const API_BASE_URL = 'http://localhost:8000/api'

export function useProducts (filters?: {
  categorySlug?: string
  featured?: boolean
  newArrival?: boolean
  bestSeller?: boolean
  limit?: number
  search?: string
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    // Construct search parameters for the Laravel Controller backend
    const params = new URLSearchParams()
    if (filters?.featured) params.append('featured', '1')
    if (filters?.newArrival) params.append('new_arrival', '1')
    if (filters?.bestSeller) params.append('best_seller', '1')
    if (filters?.limit) params.append('limit', String(filters.limit))
    if (filters?.search) params.append('search', filters.search)
    if (filters?.categorySlug) params.append('category', filters.categorySlug)

    const url = `${API_BASE_URL}/products?${params.toString()}`

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Server status: ${res.status}`)
        return res.json()
      })
      .then(data => {
        // Safe check to unpack arrays whether wrapped under a pagination/data envelope or returned cleanly
        const results = Array.isArray(data) ? data : data?.data || []
        setProducts(results)
      })
      .catch(err => console.error('Error in useProducts hook:', err))
      .finally(() => setLoading(false))
  }, [
    filters?.categorySlug,
    filters?.featured,
    filters?.newArrival,
    filters?.bestSeller,
    filters?.limit,
    filters?.search
  ])

  return { products, loading }
}

export function useProduct (slug: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)

    fetch(`${API_BASE_URL}/products/${slug}`)
      .then(res => {
        if (!res.ok)
          throw new Error(`Product endpoint returned status: ${res.status}`)
        return res.json()
      })
      .then(data => {
        // Handles direct model mapping or payload wrapped returns seamlessly
        const cleanProduct =
          data?.data &&
          typeof data.data === 'object' &&
          !Array.isArray(data.data)
            ? data.data
            : data?.product || data
        setProduct(cleanProduct)
      })
      .catch(err => {
        console.error(`Error fetching product data with slug "${slug}":`, err)
        setProduct(null)
      })
      .finally(() => setLoading(false))
  }, [slug])

  return { product, loading }
}

export function useCategories () {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE_URL}/categories`)
      .then(res => {
        if (!res.ok)
          throw new Error(`Categories endpoint returned status: ${res.status}`)
        return res.json()
      })
      .then(data => {
        const results = Array.isArray(data) ? data : data?.data || []
        setCategories(results)
      })
      .catch(err => console.error('Error fetching categories collection:', err))
      .finally(() => setLoading(false))
  }, [])

  return { categories, loading }
}
