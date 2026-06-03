import { useState, useEffect } from 'react'
import {
  User,
  Package,
  Save,
  CreditCard as Edit2,
  AlertCircle,
  Clock,
  MapPin,
  ShoppingBag
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

type Props = {
  onNavigate: (page: string) => void
}

const API_BASE_URL = 'http://127.0.0.1:8000/api'

interface Product {
  id: number
  name: string
  image_url: string
}

interface OrderItem {
  id: number
  price: string
  quantity: number
  product: Product
}

interface Order {
  id: number
  total_amount: string
  status: string
  created_at: string
  street_address: string
  city: string
  country: string
  phone?: string
  full_name?: string
  items: OrderItem[]
}

export default function Account ({ onNavigate }: Props) {
  const { user, token, profile, refreshProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile')
  const [editing, setEditing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    country: ''
  })

  // 1. Fetch backend payload containing both user and order records
  useEffect(() => {
    if (token) {
      setLoadingOrders(true)
      fetch(`${API_BASE_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      })
        .then(res => res.json())
        .then(data => {
          setOrders(data.orders || [])
        })
        .catch(err => console.error('Error loading account payload:', err))
        .finally(() => setLoadingOrders(false))
    }
  }, [token])

  // 2. FIXED: Dynamically compute display fields whenever context profile or backend orders update
  const latestOrder = orders[0]

  const displayInfo = {
    name: profile?.name || user?.name || latestOrder?.full_name || '—',
    phone: profile?.phone || latestOrder?.phone || '—',
    address: profile?.address || latestOrder?.street_address || '—',
    city: profile?.city || latestOrder?.city || '—',
    country: profile?.country || latestOrder?.country || '—'
  }

  // Pre-populate input form fields when turning on edit mode
  useEffect(() => {
    if (!editing) {
      setForm({
        name: displayInfo.name !== '—' ? displayInfo.name : '',
        phone: displayInfo.phone !== '—' ? displayInfo.phone : '',
        address: displayInfo.address !== '—' ? displayInfo.address : '',
        city: displayInfo.city !== '—' ? displayInfo.city : '',
        country: displayInfo.country !== '—' ? displayInfo.country : ''
      })
    }
  }, [editing, orders, profile, user])

  if (!user) {
    return (
      <div className='min-h-screen bg-stone-50 pt-20 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-stone-500 mb-4'>
            Please sign in to view your account.
          </p>
          <button
            onClick={() => onNavigate('auth')}
            className='px-6 py-3 bg-stone-900 text-white font-bold rounded-full hover:bg-amber-600 transition-all'
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    if (!token) return
    setSaving(true)
    setErrorMsg(null)

    try {
      const res = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        },
        body: JSON.stringify(form)
      })

      if (res.ok) {
        if (refreshProfile) await refreshProfile()
        setSaved(true)
        setEditing(false)
        setTimeout(() => setSaved(false), 4000)
      } else {
        const errData = await res.json()
        setErrorMsg(errData.message || 'Failed to update profile details.')
      }
    } catch (err) {
      console.error('Profile update failed:', err)
      setErrorMsg('An unexpected network error occurred.')
    } finally {
      setSaving(false)
    }
  }

  const displayEmail = profile?.email || user?.email || ''

  return (
    <div className='min-h-screen bg-stone-50 pt-20'>
      <div className='max-w-4xl mx-auto px-6 py-12'>
        {/* Header Section */}
        <div className='flex items-center gap-4 mb-10'>
          <div className='w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center shadow-sm'>
            <User className='w-8 h-8 text-amber-600' />
          </div>
          <div>
            <h1 className='text-3xl font-bold text-stone-900 font-serif tracking-tight'>
              {displayInfo.name}
            </h1>
            <p className='text-stone-500 text-sm mt-0.5'>{displayEmail}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className='flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-none'>
          {[
            { id: 'profile', icon: User, label: 'Profile' },
            { id: 'orders', icon: Package, label: 'My Orders' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-400 hover:text-amber-700'
              }`}
            >
              <tab.icon className='w-4 h-4' /> {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: PROFILE INTERFACE */}
        {activeTab === 'profile' && (
          <div className='bg-white rounded-3xl border border-stone-100 shadow-sm p-8 transition-all duration-300'>
            <div className='flex items-center justify-between mb-7'>
              <h2 className='text-xl font-bold text-stone-900 font-serif'>
                Personal Information
              </h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-600 bg-amber-50 rounded-full hover:bg-amber-100 transition-colors'
                >
                  <Edit2 className='w-4 h-4' /> Edit
                </button>
              )}
            </div>

            {saved && (
              <div className='bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm mb-5 shadow-sm'>
                Profile updated successfully!
              </div>
            )}
            {errorMsg && (
              <div className='bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm mb-5 shadow-sm flex items-center gap-2'>
                <AlertCircle className='w-4 h-4 shrink-0' />
                {errorMsg}
              </div>
            )}

            {editing ? (
              <div className='space-y-5'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                  {[
                    {
                      label: 'Full Name',
                      key: 'name',
                      placeholder: 'Your full name'
                    },
                    {
                      label: 'Phone',
                      key: 'phone',
                      placeholder: '+1 555 000 0000'
                    },
                    {
                      label: 'Street Address',
                      key: 'address',
                      placeholder: '123 Garden St',
                      span: 2
                    },
                    {
                      label: 'City',
                      key: 'city',
                      placeholder: 'San Francisco'
                    },
                    {
                      label: 'Country',
                      key: 'country',
                      placeholder: 'United States'
                    }
                  ].map(field => (
                    <div
                      key={field.key}
                      className={field.span === 2 ? 'sm:col-span-2' : ''}
                    >
                      <label className='block text-stone-600 text-sm font-medium mb-2'>
                        {field.label}
                      </label>
                      <input
                        value={
                          (form as Record<string, string>)[field.key] || ''
                        }
                        onChange={e =>
                          setForm(f => ({ ...f, [field.key]: e.target.value }))
                        }
                        placeholder={field.placeholder}
                        className='w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm outline-none focus:border-amber-400 focus:bg-white transition-all'
                      />
                    </div>
                  ))}
                </div>
                <div className='flex gap-3 pt-2'>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className='flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-amber-600 text-white font-semibold rounded-full text-sm transition-all disabled:opacity-50'
                  >
                    <Save className='w-4 h-4' />{' '}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false)
                      setErrorMsg(null)
                    }}
                    className='px-6 py-3 border border-stone-200 text-stone-600 font-semibold rounded-full text-sm hover:border-stone-300 transition-all'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                {[
                  { label: 'Full Name', value: displayInfo.name },
                  { label: 'Email', value: displayEmail || '—' },
                  { label: 'Phone', value: displayInfo.phone },
                  { label: 'City', value: displayInfo.city },
                  { label: 'Address', value: displayInfo.address, span: true },
                  { label: 'Country', value: displayInfo.country },
                  {
                    label: 'Member Since',
                    value:
                      profile?.created_at || (user as any)?.created_at
                        ? new Date(
                            profile?.created_at || (user as any).created_at
                          ).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long'
                          })
                        : '—'
                  }
                ].map((field, i) => (
                  <div key={i} className={field.span ? 'sm:col-span-2' : ''}>
                    <p className='text-stone-400 text-xs uppercase tracking-wide font-medium mb-1'>
                      {field.label}
                    </p>
                    <p className='text-stone-800 font-medium'>{field.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ORDERS INTERFACE */}
        {activeTab === 'orders' && (
          <div className='space-y-6 transition-all duration-300'>
            {loadingOrders ? (
              <div className='bg-white rounded-3xl border border-stone-100 shadow-sm p-12 text-center text-stone-500 text-sm'>
                Loading purchase transactions...
              </div>
            ) : orders.length === 0 ? (
              <div className='bg-white rounded-3xl border border-stone-100 shadow-sm p-8 text-center py-16'>
                <div className='w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <ShoppingBag className='w-8 h-8 text-stone-400' />
                </div>
                <h2 className='text-xl font-bold text-stone-900 font-serif mb-2'>
                  No orders found
                </h2>
                <p className='text-stone-500 text-sm max-w-xs mx-auto mb-6'>
                  Explore our fine selection of artisanal single-origin teas.
                </p>
                <button
                  onClick={() => onNavigate('shop')}
                  className='px-6 py-3 bg-stone-900 text-white font-medium rounded-full hover:bg-amber-600 transition-all text-sm'
                >
                  Browse Teas
                </button>
              </div>
            ) : (
              orders.map(order => (
                <div
                  key={order.id}
                  className='bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden'
                >
                  <div className='bg-stone-50 px-8 py-5 border-b border-stone-100 flex flex-wrap gap-4 items-center justify-between'>
                    <div className='flex gap-6 text-xs text-stone-500 uppercase tracking-wider font-medium'>
                      <div>
                        <p className='text-stone-400 mb-0.5'>Order Placed</p>
                        <span className='text-stone-700 flex items-center gap-1 normal-case font-semibold'>
                          <Clock className='w-3.5 h-3.5 text-stone-400' />{' '}
                          {new Date(order.created_at).toLocaleDateString(
                            'en-US',
                            { year: 'numeric', month: 'short', day: 'numeric' }
                          )}
                        </span>
                      </div>
                      <div>
                        <p className='text-stone-400 mb-0.5'>Total Amount</p>
                        <span className='text-stone-900 font-bold text-sm'>
                          ${parseFloat(order.total_amount).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <p className='text-stone-400 mb-0.5'>Order Reference</p>
                        <span className='text-stone-700 font-semibold font-mono text-sm'>
                          #LMN-{order.id}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          order.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className='p-8 space-y-6'>
                    {order.items?.map(item => (
                      <div
                        key={item.id}
                        className='flex gap-5 items-center pb-6 border-b border-stone-100 last:border-none last:pb-0'
                      >
                        <img
                          src={item.product?.image_url}
                          alt={item.product?.name}
                          className='w-20 h-20 object-cover bg-stone-100 rounded-2xl border border-stone-100 shrink-0'
                        />
                        <div className='flex-1 min-w-0'>
                          <h4 className='text-stone-900 font-bold font-serif text-base truncate'>
                            {item.product?.name}
                          </h4>
                          <p className='text-stone-500 text-sm mt-0.5'>
                            Quantity:{' '}
                            <span className='text-stone-800 font-semibold'>
                              {item.quantity}
                            </span>
                          </p>
                        </div>
                        <div className='text-right shrink-0'>
                          <p className='text-stone-900 font-bold'>
                            ${parseFloat(item.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className='pt-4 flex gap-2 items-start text-stone-500 text-xs mt-2 border-t border-stone-50'>
                      <MapPin className='w-4 h-4 text-stone-400 shrink-0 mt-0.5' />
                      <p>
                        Shipping destination address:{' '}
                        <span className='text-stone-700 font-medium'>
                          {order.street_address}, {order.city}, {order.country}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
