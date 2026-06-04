import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  MessageSquare,
  Users,
  Plus,
  CreditCard as Edit2,
  Trash2,
  X,
  Save,
  CheckSquare,
  BarChart3,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

type Props = {
  onNavigate: (page: string) => void
}

type AdminTab = 'dashboard' | 'products' | 'categories' | 'orders' | 'inquiries'

// Custom Type mappings corresponding with Laravel Model Objects
interface LaravelProduct {
  id: number
  name: string
  slug: string
  category_id: number | string
  price: number
  compare_price: number
  weight_grams: number
  stock_quantity: number
  short_description: string | null
  description: string | null
  ingredients: string | null
  benefits: string | null
  brewing_instructions: string | null
  flavor_profile: string | null
  cover_image_url: string | null
  is_featured: boolean | number
  is_new_arrival: boolean | number
  is_best_seller: boolean | number
  is_active: boolean | number
  category?: { name: string }
}

interface LaravelCategory {
  id: number
  name: string
  slug: string
  description: string | null
  image_url: string | null
}

interface LaravelOrder {
  id: number
  order_number?: string
  full_name: string
  email: string
  total_amount: number | string
  status: string
  payment_method?: string
  created_at: string
  items?: any[]
}

interface LaravelInquiry {
  id: number
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  is_read: boolean | number
  created_at: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL

const EMPTY_PRODUCT: Partial<LaravelProduct> = {
  name: '',
  slug: '',
  category_id: '',
  price: 0,
  compare_price: 0,
  weight_grams: 100,
  stock_quantity: 0,
  short_description: '',
  description: '',
  ingredients: '',
  benefits: '',
  brewing_instructions: '',
  flavor_profile: '',
  cover_image_url: '',
  is_featured: false,
  is_new_arrival: false,
  is_best_seller: false,
  is_active: true
}

export default function Admin ({ onNavigate }: Props) {
  const { profile, token } = useAuth()
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')

  // Dashboard state stats
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    inquiries: 0,
    revenue: 0
  })

  // Entity States
  const [products, setProducts] = useState<LaravelProduct[]>([])
  const [productForm, setProductForm] =
    useState<Partial<LaravelProduct>>(EMPTY_PRODUCT)
  const [editingProduct, setEditingProduct] = useState<number | null>(null)
  const [productModal, setProductModal] = useState(false)

  const [categories, setCategories] = useState<LaravelCategory[]>([])
  const [catForm, setCatForm] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: ''
  })
  const [editingCat, setEditingCat] = useState<number | null>(null)
  const [catModal, setCatModal] = useState(false)

  const [orders, setOrders] = useState<LaravelOrder[]>([])
  const [inquiries, setInquiries] = useState<LaravelInquiry[]>([])

  useEffect(() => {
    if (profile?.role === 'admin' && token) {
      loadAll()
    }
  }, [activeTab, profile, token])

  // FIXED: Replaced Promise.all Supabase calls with native fetch routes pointed to Laravel Admin controllers
  const loadAll = async () => {
    if (!token) return
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }

      const [prodRes, catRes, ordRes, inqRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/products`, { headers }),
        fetch(`${API_BASE_URL}/categories`, { headers }), // Public categories route fallback
        fetch(`${API_BASE_URL}/admin/orders`, { headers }),
        fetch(`${API_BASE_URL}/admin/inquiries`, { headers })
      ])

      const prods = prodRes.ok ? await prodRes.json() : []
      const cats = catRes.ok ? await catRes.json() : []
      const ords = ordRes.ok ? await ordRes.json() : []
      const inqs = inqRes.ok ? await inqRes.json() : []

      setProducts(prods)
      setCategories(cats)
      setOrders(ords)
      setInquiries(inqs)

      // Dynamically aggregates total platform transaction data
      const calculatedRevenue = ords.reduce(
        (sum: number, o: LaravelOrder) => sum + Number(o.total_amount || 0),
        0
      )

      setStats({
        products: prods.length,
        orders: ords.length,
        inquiries: inqs.length,
        revenue: calculatedRevenue
      })
    } catch (err) {
      console.error('Failed to aggregate administrative metrics:', err)
    }
  }

  if (profile?.role !== 'admin') {
    return (
      <div className='min-h-screen bg-stone-50 pt-20 flex items-center justify-center'>
        <div className='text-center'>
          <AlertCircle className='w-12 h-12 text-red-400 mx-auto mb-4' />
          <h2 className='text-2xl font-bold text-stone-900 mb-2'>
            Access Denied
          </h2>
          <p className='text-stone-500 mb-4'>
            You need admin privileges to access this area.
          </p>
          <button
            onClick={() => onNavigate('home')}
            className='px-6 py-3 bg-stone-900 text-white font-bold rounded-full'
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  // FIXED: Product Form Mutations via Laravel API
  const handleSaveProduct = async () => {
    const slug =
      productForm.slug ||
      productForm.name
        ?.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '') ||
      ''
    const payload = { ...productForm, slug }

    const url = editingProduct
      ? `${API_BASE_URL}/admin/products/${editingProduct}`
      : `${API_BASE_URL}/admin/products`
    const method = editingProduct ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setProductModal(false)
        setEditingProduct(null)
        setProductForm(EMPTY_PRODUCT)
        loadAll()
      }
    } catch (err) {
      console.error('Product save operational exception:', err)
    }
  }

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Delete this product permanently?')) return
    try {
      const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) loadAll()
    } catch (err) {
      console.error(err)
    }
  }

  const openEditProduct = (p: LaravelProduct) => {
    setProductForm({
      ...p,
      is_featured: !!p.is_featured,
      is_new_arrival: !!p.is_new_arrival,
      is_best_seller: !!p.is_best_seller,
      is_active: !!p.is_active
    })
    setEditingProduct(p.id)
    setProductModal(true)
  }

  // FIXED: Category Mutations via Laravel API
  const handleSaveCat = async () => {
    const slug = catForm.slug || catForm.name.toLowerCase().replace(/\s+/g, '-')
    const payload = { ...catForm, slug }

    const url = editingCat
      ? `${API_BASE_URL}/admin/categories/${editingCat}`
      : `${API_BASE_URL}/admin/categories`
    const method = editingCat ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setCatModal(false)
        setEditingCat(null)
        setCatForm({ name: '', slug: '', description: '', image_url: '' })
        loadAll()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteCat = async (id: number) => {
    if (!confirm('Delete this product category?')) return
    try {
      const res = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) loadAll()
    } catch (err) {
      console.error(err)
    }
  }

  // FIXED: Order Lifecycle Status updates via Laravel REST Endpoint
  const handleOrderStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        },
        body: JSON.stringify({ status })
      })
      if (res.ok) loadAll()
    } catch (err) {
      console.error(err)
    }
  }

  // FIXED: CRM Message Update hooks redirected via Laravel REST Endpoint
  const handleMarkRead = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/inquiries/${id}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      })
      if (res.ok) loadAll()
    } catch (err) {
      console.error(err)
    }
  }

  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'products', icon: Package, label: 'Products' },
    { id: 'categories', icon: Tag, label: 'Categories' },
    { id: 'orders', icon: ShoppingBag, label: 'Orders' },
    {
      id: 'inquiries',
      icon: MessageSquare,
      label: 'Inquiries',
      badge: inquiries.filter(i => !i.is_read).length
    }
  ] as const

  return (
    <div className='min-h-screen bg-stone-50 pt-20'>
      <div className='max-w-7xl mx-auto px-6 py-10'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-stone-900 font-serif'>
              Admin Panel
            </h1>
            <p className='text-stone-500 text-sm mt-1'>Manage your tea brand</p>
          </div>
          <button
            onClick={() => onNavigate('home')}
            className='text-sm text-stone-500 hover:text-amber-600 transition-colors'
          >
            ← Back to Site
          </button>
        </div>

        {/* Tab Selection Row */}
        <div className='flex gap-2 overflow-x-auto mb-8 pb-1'>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all relative ${
                activeTab === tab.id
                  ? 'bg-stone-900 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-400 hover:text-amber-700'
              }`}
            >
              <tab.icon className='w-4 h-4' />
              {tab.label}
              {'badge' in tab && tab.badge > 0 && (
                <span className='bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center'>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Dashboard Panels */}
        {activeTab === 'dashboard' && (
          <div>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-5 mb-10'>
              {[
                {
                  icon: Package,
                  label: 'Products',
                  value: stats.products,
                  color: 'bg-blue-100 text-blue-600'
                },
                {
                  icon: ShoppingBag,
                  label: 'Total Orders',
                  value: stats.orders,
                  color: 'bg-amber-100 text-amber-600'
                },
                {
                  icon: MessageSquare,
                  label: 'Inquiries',
                  value: stats.inquiries,
                  color: 'bg-emerald-100 text-emerald-600'
                },
                {
                  icon: BarChart3,
                  label: 'Revenue',
                  value: `$${stats.revenue.toFixed(2)}`,
                  color: 'bg-purple-100 text-purple-600'
                }
              ].map((stat, i) => (
                <div
                  key={i}
                  className='bg-white rounded-2xl border border-stone-100 p-6 shadow-sm'
                >
                  <div
                    className={`w-11 h-11 ${stat.color} rounded-full flex items-center justify-center mb-4`}
                  >
                    <stat.icon className='w-5 h-5' />
                  </div>
                  <p className='text-stone-400 text-xs uppercase tracking-wide mb-1'>
                    {stat.label}
                  </p>
                  <p className='text-stone-900 font-bold text-2xl font-serif'>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <div className='bg-white rounded-2xl border border-stone-100 p-6'>
                <h3 className='font-bold text-stone-900 font-serif mb-4 flex items-center gap-2'>
                  <TrendingUp className='w-5 h-5 text-amber-500' /> Recent
                  Orders
                </h3>
                <div className='space-y-3'>
                  {orders.slice(0, 5).map(order => {
                    const totalAmt = Number(order.total_amount || 0)
                    return (
                      <div
                        key={order.id}
                        className='flex items-center justify-between py-2 border-b border-stone-50'
                      >
                        <div>
                          <p className='font-mono text-stone-800 text-sm font-semibold'>
                            #LUM-{order.id}
                          </p>
                          <p className='text-stone-400 text-xs'>
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='font-bold text-stone-800 text-sm'>
                            ${totalAmt.toFixed(2)}
                          </p>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              {
                                pending: 'bg-yellow-100 text-yellow-700',
                                delivered: 'bg-emerald-100 text-emerald-700',
                                shipped: 'bg-blue-100 text-blue-700'
                              }[order.status] || 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className='bg-white rounded-2xl border border-stone-100 p-6'>
                <h3 className='font-bold text-stone-900 font-serif mb-4 flex items-center gap-2'>
                  <Users className='w-5 h-5 text-amber-500' /> Recent Inquiries
                </h3>
                <div className='space-y-3'>
                  {inquiries.slice(0, 5).map(inq => (
                    <div
                      key={inq.id}
                      className={`py-2 border-b border-stone-50 ${
                        !inq.is_read ? 'bg-amber-50/50 rounded-lg px-2' : ''
                      }`}
                    >
                      <div className='flex items-center justify-between'>
                        <p className='font-semibold text-stone-800 text-sm'>
                          {inq.name}
                        </p>
                        {!inq.is_read && (
                          <span className='w-2 h-2 bg-amber-500 rounded-full' />
                        )}
                      </div>
                      <p className='text-stone-500 text-xs line-clamp-1'>
                        {inq.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Management View */}
        {activeTab === 'products' && (
          <div>
            <div className='flex justify-between items-center mb-5'>
              <h2 className='text-xl font-bold text-stone-900 font-serif'>
                All Products ({products.length})
              </h2>
              <button
                onClick={() => {
                  setProductForm(EMPTY_PRODUCT)
                  setEditingProduct(null)
                  setProductModal(true)
                }}
                className='flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-amber-600 text-white font-semibold rounded-full text-sm transition-all'
              >
                <Plus className='w-4 h-4' /> Add Product
              </button>
            </div>
            <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm'>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead className='bg-stone-50 border-b border-stone-100'>
                    <tr>
                      {[
                        'Image',
                        'Product',
                        'Category',
                        'Price',
                        'Stock',
                        'Flags',
                        'Actions'
                      ].map(h => (
                        <th
                          key={h}
                          className='text-left px-4 py-3 text-stone-500 font-medium text-xs uppercase tracking-wide'
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr
                        key={p.id}
                        className='border-b border-stone-50 hover:bg-stone-50/50 transition-colors'
                      >
                        <td className='px-4 py-3'>
                          <div className='w-12 h-12 rounded-lg overflow-hidden bg-stone-100 border'>
                            <img
                              src={
                                p.cover_image_url ||
                                'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg'
                              }
                              alt={p.name}
                              className='w-full h-full object-cover'
                            />
                          </div>
                        </td>
                        <td className='px-4 py-3'>
                          <p className='font-semibold text-stone-800 font-serif'>
                            {p.name}
                          </p>
                          <p className='text-stone-400 text-xs'>{p.slug}</p>
                        </td>
                        <td className='px-4 py-3 text-stone-600'>
                          {p.category?.name || '—'}
                        </td>
                        <td className='px-4 py-3'>
                          <p className='font-bold text-stone-800'>
                            ${Number(p.price || 0).toFixed(2)}
                          </p>
                          {Number(p.compare_price || 0) > 0 && (
                            <p className='text-stone-400 text-xs line-through'>
                              ${Number(p.compare_price).toFixed(2)}
                            </p>
                          )}
                        </td>
                        <td className='px-4 py-3'>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              p.stock_quantity > 0
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-600'
                            }`}
                          >
                            {p.stock_quantity} units
                          </span>
                        </td>
                        <td className='px-4 py-3'>
                          <div className='flex gap-1 flex-wrap'>
                            {!!p.is_featured && (
                              <span className='text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium'>
                                Featured
                              </span>
                            )}
                            {!!p.is_new_arrival && (
                              <span className='text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium'>
                                New
                              </span>
                            )}
                            {!!p.is_best_seller && (
                              <span className='text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium'>
                                Best
                              </span>
                            )}
                          </div>
                        </td>
                        <td className='px-4 py-3'>
                          <div className='flex gap-2'>
                            <button
                              onClick={() => openEditProduct(p)}
                              className='p-2 bg-stone-100 hover:bg-amber-100 rounded-lg transition-colors'
                            >
                              <Edit2 className='w-3.5 h-3.5 text-stone-600 hover:text-amber-700' />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className='p-2 bg-stone-100 hover:bg-red-100 rounded-lg transition-colors'
                            >
                              <Trash2 className='w-3.5 h-3.5 text-stone-600 hover:text-red-600' />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Categories Management View */}
        {activeTab === 'categories' && (
          <div>
            <div className='flex justify-between items-center mb-5'>
              <h2 className='text-xl font-bold text-stone-900 font-serif'>
                Categories ({categories.length})
              </h2>
              <button
                onClick={() => {
                  setCatForm({
                    name: '',
                    slug: '',
                    description: '',
                    image_url: ''
                  })
                  setEditingCat(null)
                  setCatModal(true)
                }}
                className='flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-amber-600 text-white font-semibold rounded-full text-sm transition-all'
              >
                <Plus className='w-4 h-4' /> Add Category
              </button>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
              {categories.map(cat => (
                <div
                  key={cat.id}
                  className='bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm'
                >
                  <div className='h-36 bg-stone-100 overflow-hidden border-b'>
                    <img
                      src={
                        cat.image_url ||
                        'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg'
                      }
                      alt={cat.name}
                      className='w-full h-full object-cover'
                    />
                  </div>
                  <div className='p-5'>
                    <div className='flex items-start justify-between mb-2'>
                      <div>
                        <h3 className='font-bold text-stone-900 font-serif'>
                          {cat.name}
                        </h3>
                        <p className='text-stone-400 text-xs'>{cat.slug}</p>
                      </div>
                      <div className='flex gap-2'>
                        <button
                          onClick={() => {
                            setCatForm({
                              name: cat.name,
                              slug: cat.slug,
                              description: cat.description || '',
                              image_url: cat.image_url || ''
                            })
                            setEditingCat(cat.id)
                            setCatModal(true)
                          }}
                          className='p-2 bg-stone-100 hover:bg-amber-100 rounded-lg transition-colors'
                        >
                          <Edit2 className='w-3.5 h-3.5 text-stone-600' />
                        </button>
                        <button
                          onClick={() => handleDeleteCat(cat.id)}
                          className='p-2 bg-stone-100 hover:bg-red-100 rounded-lg transition-colors'
                        >
                          <Trash2 className='w-3.5 h-3.5 text-stone-600 hover:text-red-600' />
                        </button>
                      </div>
                    </div>
                    <p className='text-stone-500 text-xs line-clamp-2'>
                      {cat.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Management View */}
        {activeTab === 'orders' && (
          <div>
            <h2 className='text-xl font-bold text-stone-900 font-serif mb-5'>
              All Orders ({orders.length})
            </h2>
            <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm'>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead className='bg-stone-50 border-b border-stone-100'>
                    <tr>
                      {[
                        'Order #',
                        'Customer',
                        'Date',
                        'Total',
                        'Payment',
                        'Status',
                        'Actions'
                      ].map(h => (
                        <th
                          key={h}
                          className='text-left px-4 py-3 text-stone-500 font-medium text-xs uppercase tracking-wide'
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr
                        key={order.id}
                        className='border-b border-stone-50 hover:bg-stone-50/50'
                      >
                        <td className='px-4 py-3 font-mono font-semibold text-stone-800 text-xs'>
                          #LUM-{order.id}
                        </td>
                        <td className='px-4 py-3'>
                          <p className='font-medium text-stone-700'>
                            {order.full_name}
                          </p>
                          <p className='text-stone-400 text-xs'>
                            {order.email}
                          </p>
                        </td>
                        <td className='px-4 py-3 text-stone-500 text-xs'>
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className='px-4 py-3 font-bold text-stone-800'>
                          ${Number(order.total_amount || 0).toFixed(2)}
                        </td>
                        <td className='px-4 py-3'>
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                              order.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {order.payment_method || 'COD'}
                          </span>
                        </td>
                        <td className='px-4 py-3'>
                          <select
                            value={order.status}
                            onChange={e =>
                              handleOrderStatus(order.id, e.target.value)
                            }
                            className='text-xs border border-stone-200 rounded-lg px-2 py-1.5 outline-none bg-white font-medium'
                          >
                            {[
                              'pending',
                              'confirmed',
                              'processing',
                              'shipped',
                              'delivered',
                              'cancelled'
                            ].map(s => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className='px-4 py-3'>
                          <span className='text-stone-400 text-xs'>
                            {order.items?.length || 0} item(s)
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Inquiries Management View */}
        {activeTab === 'inquiries' && (
          <div>
            <h2 className='text-xl font-bold text-stone-900 font-serif mb-5'>
              Inquiries ({inquiries.filter(i => !i.is_read).length} unread)
            </h2>
            <div className='space-y-4'>
              {inquiries.map(inq => (
                <div
                  key={inq.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm ${
                    !inq.is_read
                      ? 'border-amber-300 bg-amber-50/30'
                      : 'border-stone-100'
                  }`}
                >
                  <div className='flex items-start justify-between gap-4'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2'>
                        <p className='font-bold text-stone-900'>{inq.name}</p>
                        {!inq.is_read && (
                          <span className='w-2 h-2 bg-amber-500 rounded-full' />
                        )}
                        {inq.subject && (
                          <span className='text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full'>
                            {inq.subject}
                          </span>
                        )}
                      </div>
                      <p className='text-stone-500 text-xs mb-1'>
                        {inq.email} {inq.phone && `· ${inq.phone}`}
                      </p>
                      <p className='text-stone-700 text-sm leading-relaxed'>
                        {inq.message}
                      </p>
                      <p className='text-stone-400 text-xs mt-2'>
                        {new Date(inq.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className='flex gap-2 shrink-0'>
                      {!inq.is_read && (
                        <button
                          onClick={() => handleMarkRead(inq.id)}
                          className='flex items-center gap-1 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-semibold rounded-full transition-colors'
                        >
                          <CheckSquare className='w-3.5 h-3.5' /> Mark Read
                        </button>
                      )}
                      <a
                        href={`mailto:${inq.email}`}
                        className='flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-amber-100 text-stone-600 hover:text-amber-700 text-xs font-semibold rounded-full transition-colors'
                      >
                        Reply
                      </a>
                    </div>
                  </div>
                </div>
              ))}
              {inquiries.length === 0 && (
                <div className='text-center py-16 bg-white rounded-2xl border border-stone-100'>
                  <MessageSquare className='w-10 h-10 text-stone-200 mx-auto mb-3' />
                  <p className='text-stone-500'>No inquiries yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Product Mutation Modal */}
      {productModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl'>
            <div className='flex items-center justify-between px-8 py-5 border-b border-stone-100 sticky top-0 bg-white z-10'>
              <h3 className='text-xl font-bold text-stone-900 font-serif'>
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h3>
              <button
                onClick={() => setProductModal(false)}
                className='p-2 hover:bg-stone-100 rounded-full transition-colors'
              >
                <X className='w-5 h-5 text-stone-500' />
              </button>
            </div>
            <div className='px-8 py-6 space-y-5'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                {[
                  { label: 'Product Name *', key: 'name', span: 2 },
                  { label: 'Slug (auto-generated)', key: 'slug' },
                  { label: 'Price ($) *', key: 'price', type: 'number' },
                  {
                    label: 'Compare Price ($)',
                    key: 'compare_price',
                    type: 'number'
                  },
                  {
                    label: 'Weight (grams)',
                    key: 'weight_grams',
                    type: 'number'
                  },
                  {
                    label: 'Stock Quantity',
                    key: 'stock_quantity',
                    type: 'number'
                  },
                  { label: 'Cover Image URL', key: 'cover_image_url', span: 2 },
                  {
                    label: 'Short Description',
                    key: 'short_description',
                    span: 2
                  },
                  {
                    label: 'Full Description',
                    key: 'description',
                    span: 2,
                    textarea: true
                  },
                  {
                    label: 'Ingredients',
                    key: 'ingredients',
                    span: 2,
                    textarea: true
                  },
                  {
                    label: 'Benefits',
                    key: 'benefits',
                    span: 2,
                    textarea: true
                  },
                  {
                    label: 'Brewing Instructions',
                    key: 'brewing_instructions',
                    span: 2,
                    textarea: true
                  },
                  { label: 'Flavor Profile', key: 'flavor_profile', span: 2 }
                ].map(field => (
                  <div
                    key={field.key}
                    className={field.span === 2 ? 'col-span-2' : ''}
                  >
                    <label className='block text-stone-600 text-xs font-medium mb-1.5 uppercase tracking-wide'>
                      {field.label}
                    </label>
                    {field.textarea ? (
                      <textarea
                        value={String(
                          (productForm as Record<string, any>)[field.key] || ''
                        )}
                        onChange={e =>
                          setProductForm(f => ({
                            ...f,
                            [field.key]: e.target.value
                          }))
                        }
                        rows={3}
                        className='w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm outline-none focus:border-amber-400 resize-none'
                      />
                    ) : (
                      <input
                        type={field.type || 'text'}
                        value={String(
                          (productForm as Record<string, any>)[field.key] ?? ''
                        )}
                        onChange={e =>
                          setProductForm(f => ({
                            ...f,
                            [field.key]:
                              field.type === 'number'
                                ? parseFloat(e.target.value) || 0
                                : e.target.value
                          }))
                        }
                        className='w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm outline-none focus:border-amber-400'
                      />
                    )}
                  </div>
                ))}
                <div className='col-span-2'>
                  <label className='block text-stone-600 text-xs font-medium mb-1.5 uppercase tracking-wide'>
                    Category
                  </label>
                  <select
                    value={productForm.category_id}
                    onChange={e =>
                      setProductForm(f => ({
                        ...f,
                        category_id: e.target.value
                      }))
                    }
                    className='w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm outline-none focus:border-amber-400 font-medium'
                  >
                    <option value=''>Select category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='col-span-2 flex flex-wrap gap-4'>
                  {[
                    { key: 'is_featured', label: 'Featured' },
                    { key: 'is_new_arrival', label: 'New Arrival' },
                    { key: 'is_best_seller', label: 'Best Seller' },
                    { key: 'is_active', label: 'Active' }
                  ].map(flag => (
                    <label
                      key={flag.key}
                      className='flex items-center gap-2 cursor-pointer'
                    >
                      <input
                        type='checkbox'
                        checked={Boolean(
                          (productForm as Record<string, any>)[flag.key]
                        )}
                        onChange={e =>
                          setProductForm(f => ({
                            ...f,
                            [flag.key]: e.target.checked
                          }))
                        }
                        className='w-4 h-4 accent-amber-500'
                      />
                      <span className='text-stone-700 text-sm'>
                        {flag.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className='flex gap-3 pt-3'>
                <button
                  onClick={handleSaveProduct}
                  className='flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-amber-600 text-white font-semibold rounded-full text-sm transition-all'
                >
                  <Save className='w-4 h-4' />{' '}
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
                <button
                  onClick={() => setProductModal(false)}
                  className='px-6 py-3 border border-stone-200 text-stone-600 font-semibold rounded-full text-sm hover:border-stone-300 transition-all'
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Mutation Modal */}
      {catModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-3xl w-full max-w-md shadow-2xl'>
            <div className='flex items-center justify-between px-8 py-5 border-b border-stone-100'>
              <h3 className='text-xl font-bold text-stone-900 font-serif'>
                {editingCat ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                onClick={() => setCatModal(false)}
                className='p-2 hover:bg-stone-100 rounded-full'
              >
                <X className='w-5 h-5 text-stone-500' />
              </button>
            </div>
            <div className='px-8 py-6 space-y-4'>
              {[
                { label: 'Name', key: 'name', placeholder: 'e.g. Green Tea' },
                {
                  label: 'Slug (optional)',
                  key: 'slug',
                  placeholder: 'auto-generated'
                },
                {
                  label: 'Image URL',
                  key: 'image_url',
                  placeholder: 'https://...'
                }
              ].map(f => (
                <div key={f.key}>
                  <label className='block text-stone-600 text-xs font-medium mb-1.5 uppercase tracking-wide'>
                    {f.label}
                  </label>
                  <input
                    value={(catForm as Record<string, string>)[f.key]}
                    onChange={e =>
                      setCatForm(cf => ({ ...cf, [f.key]: e.target.value }))
                    }
                    placeholder={f.placeholder}
                    className='w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm outline-none focus:border-amber-400'
                  />
                </div>
              ))}
              <div>
                <label className='block text-stone-600 text-xs font-medium mb-1.5 uppercase tracking-wide'>
                  Description
                </label>
                <textarea
                  value={catForm.description}
                  onChange={e =>
                    setCatForm(cf => ({ ...cf, description: e.target.value }))
                  }
                  rows={3}
                  className='w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm outline-none focus:border-amber-400 resize-none'
                />
              </div>
              <div className='flex gap-3'>
                <button
                  onClick={handleSaveCat}
                  className='flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-amber-600 text-white font-semibold rounded-full text-sm transition-all'
                >
                  <Save className='w-4 h-4' />{' '}
                  {editingCat ? 'Save Changes' : 'Create Category'}
                </button>
                <button
                  onClick={() => setCatModal(false)}
                  className='px-6 py-3 border border-stone-200 text-stone-600 font-semibold rounded-full text-sm hover:border-stone-300 transition-all'
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
