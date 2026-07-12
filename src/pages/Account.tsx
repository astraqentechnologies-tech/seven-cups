import { useState, useEffect } from 'react'
import {
  User,
  Package,
  Save,
  CreditCard as Edit2,
  AlertCircle,
  Clock,
  MapPin,
  ShoppingBag,
  CheckCircle2,
  X
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = import.meta.env.VITE_API_URL

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

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200'
}
const DEFAULT_STATUS_STYLE = 'bg-blue-50 text-blue-700 border-blue-200'

const PROFILE_FIELDS = [
  { label: 'Full Name', key: 'name', placeholder: 'Your full name', span: 1 },
  { label: 'Phone', key: 'phone', placeholder: '+91 98000 00000', span: 1 },
  { label: 'Street Address', key: 'street_address', placeholder: '123 Garden St', span: 2 },
  { label: 'City', key: 'city', placeholder: 'Mumbai', span: 1 },
  { label: 'Country', key: 'country', placeholder: 'India', span: 1 }
] as const

export default function Account () {
  const navigate = useNavigate()
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
    email: '',
    phone: '',
    street_address: '',
    city: '',
    country: ''
  })

  useEffect(() => {
    if (!token) return
    setLoadingOrders(true)
    fetch(`${API_BASE_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        const raw = Array.isArray(data) ? data : data?.data ?? []
        setOrders(raw)
      })
      .catch(err => console.error('Error loading orders:', err))
      .finally(() => setLoadingOrders(false))
  }, [token])

  const latestOrder = orders[0]

  const displayInfo = {
    name: profile?.name || user?.name || latestOrder?.full_name || '—',
    phone: profile?.phone || latestOrder?.phone || '—',
    address:
      profile?.address ||
      (profile as any)?.street_address ||
      latestOrder?.street_address ||
      '—',
    city: profile?.city || latestOrder?.city || '—',
    country: profile?.country || latestOrder?.country || '—'
  }

  const displayEmail = profile?.email || user?.email || ''

  useEffect(() => {
    if (editing) return
    setForm({
      name: displayInfo.name !== '—' ? displayInfo.name : '',
      email: displayEmail,
      phone: displayInfo.phone !== '—' ? displayInfo.phone : '',
      street_address: displayInfo.address !== '—' ? displayInfo.address : '',
      city: displayInfo.city !== '—' ? displayInfo.city : '',
      country: displayInfo.country !== '—' ? displayInfo.country : ''
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, orders, profile, user, displayInfo.name, displayEmail])

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

  if (!user) {
    return (
      <div className='min-h-screen bg-stone-50 pt-20 flex items-center justify-center px-6'>
        <div className='text-center max-w-sm'>
          <div className='w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-5'>
            <User className='w-7 h-7 text-stone-400' />
          </div>
          <p className='text-stone-500 mb-6 text-sm'>
            Please sign in to view your account.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className='px-6 py-3 bg-stone-900 text-white font-bold rounded-full hover:bg-amber-600 transition-colors'
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-stone-50 pt-20'>
      <div className='max-w-4xl mx-auto px-6 py-12'>

        {/* ============ HEADER ============ */}
        <header className='flex items-center gap-4 mb-12'>
          <div className='w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center shrink-0'>
            <User className='w-8 h-8 text-amber-600' />
          </div>
          <div className='min-w-0'>
            <h1 className='text-3xl font-bold text-stone-900 font-serif tracking-tight truncate'>
              {displayInfo.name}
            </h1>
            <p className='text-stone-500 text-sm mt-1'>{displayEmail}</p>
          </div>
        </header>

        {/* ============ TAB NAVIGATION ============ */}
        <nav className='flex gap-2 mb-10 border-b border-stone-200'>
          {[
            { id: 'profile' as const, icon: User, label: 'Profile' },
            { id: 'orders' as const, icon: Package, label: 'My Orders' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? 'border-amber-600 text-stone-900'
                  : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              <tab.icon className='w-4 h-4' />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* ============ TAB PANELS ============ */}
        {activeTab === 'profile' ? (
          <ProfileSection
            editing={editing}
            setEditing={setEditing}
            saved={saved}
            errorMsg={errorMsg}
            setErrorMsg={setErrorMsg}
            saving={saving}
            form={form}
            setForm={setForm}
            handleSave={handleSave}
            displayInfo={displayInfo}
            displayEmail={displayEmail}
            memberSince={profile?.created_at || user?.created_at}
          />
        ) : (
          <OrdersSection
            loadingOrders={loadingOrders}
            orders={orders}
            navigate={navigate}
          />
        )}
      </div>
    </div>
  )
}

/* ===================================================================== */
/* PROFILE SECTION                                                        */
/* ===================================================================== */

function ProfileSection ({
  editing,
  setEditing,
  saved,
  errorMsg,
  setErrorMsg,
  saving,
  form,
  setForm,
  handleSave,
  displayInfo,
  displayEmail,
  memberSince
}: {
  editing: boolean
  setEditing: (v: boolean) => void
  saved: boolean
  errorMsg: string | null
  setErrorMsg: (v: string | null) => void
  saving: boolean
  form: Record<string, string>
  setForm: React.Dispatch<React.SetStateAction<Record<string, string>>>
  handleSave: () => void
  displayInfo: { name: string; phone: string; address: string; city: string; country: string }
  displayEmail: string
  memberSince: string | undefined
}) {
  const viewFields = [
    { label: 'Full Name', value: displayInfo.name },
    { label: 'Email', value: displayEmail || '—' },
    { label: 'Phone', value: displayInfo.phone },
    { label: 'City', value: displayInfo.city },
    { label: 'Address', value: displayInfo.address, span: true },
    { label: 'Country', value: displayInfo.country },
    {
      label: 'Member Since',
      value: memberSince
        ? new Date(memberSince).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
          })
        : '—'
    }
  ]

  return (
    <section className='bg-white rounded-3xl border border-stone-100 shadow-sm'>
      {/* Section header */}
      <div className='flex items-center justify-between px-8 py-6 border-b border-stone-100'>
        <h2 className='text-lg font-bold text-stone-900 font-serif'>
          Personal Information
        </h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 rounded-full hover:bg-amber-100 transition-colors'
          >
            <Edit2 className='w-4 h-4' />
            Edit
          </button>
        )}
      </div>

      {/* Status banners */}
      {(saved || errorMsg) && (
        <div className='px-8 pt-6'>
          {saved && (
            <div className='flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm'>
              <CheckCircle2 className='w-4 h-4 shrink-0' />
              Profile updated successfully.
            </div>
          )}
          {errorMsg && (
            <div className='flex items-center justify-between gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm'>
              <span className='flex items-center gap-2'>
                <AlertCircle className='w-4 h-4 shrink-0' />
                {errorMsg}
              </span>
              <button onClick={() => setErrorMsg(null)} aria-label='Dismiss error'>
                <X className='w-4 h-4 text-rose-400 hover:text-rose-600' />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div className='px-8 py-8'>
        {editing ? (
          <div className='space-y-8'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5'>
              {PROFILE_FIELDS.map(field => (
                <div
                  key={field.key}
                  className={field.span === 2 ? 'sm:col-span-2' : ''}
                >
                  <label
                    htmlFor={field.key}
                    className='block text-stone-600 text-sm font-medium mb-2'
                  >
                    {field.label}
                  </label>
                  <input
                    id={field.key}
                    value={form[field.key] || ''}
                    onChange={e =>
                      setForm(f => ({ ...f, [field.key]: e.target.value }))
                    }
                    placeholder={field.placeholder}
                    className='w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm outline-none focus:border-amber-400 focus:bg-white transition-colors'
                  />
                </div>
              ))}
            </div>

            <div className='flex gap-3 pt-2 border-t border-stone-100'>
              <button
                onClick={handleSave}
                disabled={saving}
                className='flex items-center gap-2 px-6 py-3 mt-6 bg-stone-900 hover:bg-amber-600 text-white font-semibold rounded-full text-sm transition-colors disabled:opacity-50'
              >
                <Save className='w-4 h-4' />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setEditing(false)
                  setErrorMsg(null)
                }}
                className='px-6 py-3 mt-6 border border-stone-200 text-stone-600 font-semibold rounded-full text-sm hover:border-stone-300 transition-colors'
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6'>
            {viewFields.map((field, i) => (
              <div key={i} className={field.span ? 'sm:col-span-2' : ''}>
                <p className='text-stone-400 text-xs uppercase tracking-wide font-semibold mb-1.5'>
                  {field.label}
                </p>
                <p className='text-stone-800 font-medium'>{field.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ===================================================================== */
/* ORDERS SECTION                                                         */
/* ===================================================================== */

function OrdersSection ({
  loadingOrders,
  orders,
  navigate
}: {
  loadingOrders: boolean
  orders: Order[]
  navigate: ReturnType<typeof useNavigate>
}) {
  if (loadingOrders) {
    return (
      <div className='bg-white rounded-3xl border border-stone-100 shadow-sm p-16 text-center text-stone-500 text-sm'>
        Loading your orders...
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className='bg-white rounded-3xl border border-stone-100 shadow-sm px-8 py-16 text-center'>
        <div className='w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-5'>
          <ShoppingBag className='w-8 h-8 text-stone-400' />
        </div>
        <h2 className='text-xl font-bold text-stone-900 font-serif mb-2'>
          No orders found
        </h2>
        <p className='text-stone-500 text-sm max-w-xs mx-auto mb-7'>
          Explore our fine selection of artisanal single-origin teas.
        </p>
        <button
          onClick={() => navigate('/products')}
          className='px-6 py-3 bg-stone-900 text-white font-medium rounded-full hover:bg-amber-600 transition-colors text-sm'
        >
          Browse Teas
        </button>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}

function OrderCard ({ order }: { order: Order }) {
  const statusStyle = STATUS_STYLES[order.status] ?? DEFAULT_STATUS_STYLE
  const orderTotal = parseFloat(order.total_amount)

  return (
    <article className='bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden'>
      {/* Order meta header */}
      <div className='bg-stone-50 px-8 py-5 border-b border-stone-100 flex flex-wrap gap-6 items-center justify-between'>
        <div className='flex flex-wrap gap-x-8 gap-y-3 text-xs text-stone-400 uppercase tracking-wider font-medium'>
          <div>
            <p className='mb-1'>Order Placed</p>
            <span className='flex items-center gap-1.5 normal-case text-stone-700 font-semibold text-sm'>
              <Clock className='w-3.5 h-3.5 text-stone-400' />
              {new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
          <div>
            <p className='mb-1'>Total Amount</p>
            <span className='text-stone-900 font-bold text-sm normal-case'>
              ₹{orderTotal.toFixed(2)}
            </span>
          </div>
          <div>
            <p className='mb-1'>Order Reference</p>
            <span className='text-stone-700 font-semibold font-mono text-sm normal-case'>
              #LMN-{String(order.id).padStart(4, '0')}
            </span>
          </div>
        </div>

        <span
          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${statusStyle}`}
        >
          {order.status}
        </span>
      </div>

      {/* Order items */}
      <div className='px-8 py-6 divide-y divide-stone-100'>
        {order.items?.map(item => (
          <OrderItemRow key={item.id} item={item} />
        ))}
      </div>

      {/* Shipping address */}
      <div className='px-8 pb-6 flex gap-2 items-start text-stone-500 text-xs'>
        <MapPin className='w-4 h-4 text-stone-400 shrink-0 mt-0.5' />
        <p>
          Shipping to:{' '}
          <span className='text-stone-700 font-medium'>
            {order.street_address}, {order.city}, {order.country}
          </span>
        </p>
      </div>
    </article>
  )
}

function OrderItemRow ({ item }: { item: OrderItem }) {
  const lineTotal = parseFloat(item.price) * item.quantity

  return (
    <div className='flex gap-5 items-center py-5 first:pt-0 last:pb-0'>
      <img
        src={
          item.product?.image_url ||
          'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg'
        }
        alt={item.product?.name}
        className='w-20 h-20 object-cover bg-stone-100 rounded-2xl border border-stone-100 shrink-0'
      />
      <div className='flex-1 min-w-0'>
        <h4 className='text-stone-900 font-bold font-serif text-base truncate'>
          {item.product?.name}
        </h4>
        <p className='text-stone-500 text-sm mt-1'>
          Quantity: <span className='text-stone-800 font-semibold'>{item.quantity}</span>
        </p>
      </div>
      <div className='text-right shrink-0'>
        <p className='text-stone-900 font-bold'>₹{lineTotal.toFixed(2)}</p>
        <p className='text-stone-400 text-xs mt-0.5'>₹{parseFloat(item.price).toFixed(2)} each</p>
      </div>
    </div>
  )
}