import { useState } from 'react'
import {
  CheckCircle,
  ArrowRight,
  Package,
  CreditCard,
  ChevronLeft
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

type Props = {
  onNavigate: (page: string) => void
}

type ShippingForm = {
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  zip: string
  notes: string
  payment: string
}

const API_BASE_URL = 'http://127.0.0.1:8000/api'

const countries = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'Singapore',
  'India',
  'Other'
]

export default function Checkout ({ onNavigate }: Props) {
  const { user, token, profile } = useAuth()
  const { items, localItems, total, clearCart } = useCart()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<ShippingForm>({
    name: profile?.name || user?.name || '',
    email: profile?.email || user?.email || '',
    phone: '',
    address: '',
    city: '',
    country: 'United States',
    zip: '',
    notes: '',
    payment: 'cod'
  })
  const [placing, setPlacing] = useState(false)
  const [orderId, setOrderId] = useState('')

  if (!user) {
    return (
      <div className='min-h-screen bg-stone-50 pt-20 flex items-center justify-center'>
        <div className='text-center'>
          <Package className='w-12 h-12 text-amber-400 mx-auto mb-4' />
          <h2 className='text-2xl font-bold text-stone-900 font-serif mb-3'>
            Sign In to Checkout
          </h2>
          <p className='text-stone-500 mb-6'>
            Please sign in to complete your purchase.
          </p>
          <button
            onClick={() => onNavigate('auth')}
            className='px-8 py-4 bg-stone-900 text-white font-bold rounded-full hover:bg-amber-600 transition-all'
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  // FIXED: Normalizes item configurations safely from Laravel backend OR guest local records
  const displayItems = items.map(item => {
    const productData = item.products || (item as any).product
    return {
      name: productData?.name || 'Premium Tea Blend',
      image:
        productData?.image_url ||
        'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg',
      price: Number(productData?.price || 0),
      quantity: item.quantity,
      productId: item.product_id
    }
  })

  const shipping = total >= 50 ? 0 : 5.99
  const grandTotal = total + shipping

  // FIXED: Migrated from old Supabase insertion blocks to your unified Laravel REST endpoint
  const handlePlaceOrder = async () => {
    if (displayItems.length === 0) return
    setPlacing(true)

    const payload = {
      full_name: form.name,
      email: form.email,
      phone: form.phone,
      street_address: form.address,
      city: form.city,
      zip_postal: form.zip,
      country: form.country,
      notes: form.notes,
      payment_method: form.payment,
      items: displayItems.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price
      }))
    }

    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (res.ok) {
        await clearCart()
        setOrderId(`#LUM-${data.order_id || Date.now()}`)
        setStep(3)
      } else {
        alert(data.message || 'Failed to submit order to Laravel.')
      }
    } catch (err) {
      console.error('Checkout processing failure:', err)
    } finally {
      setPlacing(false)
    }
  }

  if (step === 3) {
    return (
      <div className='min-h-screen bg-stone-50 pt-20 flex items-center justify-center px-4'>
        <div className='max-w-lg w-full text-center'>
          <div className='w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6'>
            <CheckCircle className='w-10 h-10 text-emerald-600' />
          </div>
          <h1 className='text-4xl font-bold text-stone-900 font-serif mb-3'>
            Order Confirmed!
          </h1>
          <p className='text-stone-500 mb-3'>
            Thank you for your order. We're preparing it with care.
          </p>
          <div className='bg-white border border-stone-100 rounded-2xl px-6 py-4 inline-block mb-8'>
            <p className='text-stone-500 text-sm'>Order Reference</p>
            <p className='text-stone-900 font-bold text-xl font-mono'>
              {orderId}
            </p>
          </div>
          <p className='text-stone-400 text-sm mb-10'>
            A confirmation will be sent to <strong>{form.email}</strong>. Your
            order will arrive within 5–7 business days.
          </p>
          <div className='flex gap-4 justify-center'>
            <button
              onClick={() => onNavigate('orders')}
              className='px-8 py-4 bg-stone-900 hover:bg-amber-600 text-white font-bold rounded-full transition-all'
            >
              Track My Order
            </button>
            <button
              onClick={() => onNavigate('products')}
              className='px-8 py-4 border border-stone-200 text-stone-700 font-semibold rounded-full hover:border-amber-400 hover:text-amber-700 transition-all'
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-stone-50 pt-20'>
      <div className='max-w-6xl mx-auto px-6 py-12'>
        {/* Progress Timeline */}
        <div className='flex items-center justify-center gap-4 mb-12'>
          {[
            { n: 1, label: 'Shipping' },
            { n: 2, label: 'Review & Pay' }
          ].map((s, i) => (
            <div key={s.n} className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step >= s.n
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  {step > s.n ? <CheckCircle className='w-5 h-5' /> : s.n}
                </div>
                <span
                  className={`text-sm font-medium ${
                    step >= s.n ? 'text-stone-900' : 'text-stone-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < 1 && (
                <div
                  className={`w-16 h-0.5 ${
                    step > s.n ? 'bg-stone-900' : 'bg-stone-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-5 gap-10'>
          {/* Main Action Forms */}
          <div className='lg:col-span-3'>
            {step === 1 && (
              <div className='bg-white rounded-3xl border border-stone-100 p-8 shadow-sm'>
                <h2 className='text-2xl font-bold text-stone-900 font-serif mb-7'>
                  Shipping Details
                </h2>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                  {[
                    {
                      label: 'Full Name',
                      key: 'name',
                      placeholder: 'Your name',
                      span: 2
                    },
                    {
                      label: 'Email',
                      key: 'email',
                      placeholder: 'you@example.com',
                      type: 'email'
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
                    { label: 'ZIP / Postal', key: 'zip', placeholder: '94102' }
                  ].map(field => (
                    <div
                      key={field.key}
                      className={field.span === 2 ? 'col-span-2' : ''}
                    >
                      <label className='block text-stone-600 text-sm font-medium mb-2'>
                        {field.label}
                      </label>
                      <input
                        type={field.type || 'text'}
                        value={(form as Record<string, string>)[field.key]}
                        onChange={e =>
                          setForm(f => ({ ...f, [field.key]: e.target.value }))
                        }
                        placeholder={field.placeholder}
                        className='w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm outline-none focus:border-amber-400 focus:bg-white transition-all'
                      />
                    </div>
                  ))}
                  <div className='col-span-2'>
                    <label className='block text-stone-600 text-sm font-medium mb-2'>
                      Country
                    </label>
                    <select
                      value={form.country}
                      onChange={e =>
                        setForm(f => ({ ...f, country: e.target.value }))
                      }
                      className='w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm outline-none focus:border-amber-400 appearance-none'
                    >
                      {countries.map(c => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className='col-span-2'>
                    <label className='block text-stone-600 text-sm font-medium mb-2'>
                      Order Notes (optional)
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={e =>
                        setForm(f => ({ ...f, notes: e.target.value }))
                      }
                      placeholder='Special instructions, gift message...'
                      rows={3}
                      className='w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm outline-none focus:border-amber-400 resize-none'
                    />
                  </div>
                </div>
                <button
                  onClick={() => setStep(2)}
                  disabled={!form.name || !form.email || !form.address}
                  className='mt-7 w-full flex items-center justify-center gap-2 py-4 bg-stone-900 hover:bg-amber-600 text-white font-bold rounded-xl transition-all disabled:opacity-40'
                >
                  Continue to Review <ArrowRight className='w-4 h-4' />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className='bg-white rounded-3xl border border-stone-100 p-8 shadow-sm'>
                <button
                  onClick={() => setStep(1)}
                  className='flex items-center gap-2 text-stone-500 hover:text-amber-600 text-sm mb-6 transition-colors'
                >
                  <ChevronLeft className='w-4 h-4' /> Edit Shipping
                </button>
                <h2 className='text-2xl font-bold text-stone-900 font-serif mb-6'>
                  Review & Payment
                </h2>

                <div className='bg-stone-50 rounded-2xl p-5 mb-6 border border-stone-100'>
                  <p className='text-stone-500 text-xs uppercase tracking-wide font-medium mb-3'>
                    Delivering to
                  </p>
                  <p className='font-bold text-stone-800'>{form.name}</p>
                  <p className='text-stone-500 text-sm'>
                    {form.address}, {form.city}, {form.zip}
                  </p>
                  <p className='text-stone-500 text-sm'>{form.country}</p>
                  <p className='text-stone-500 text-sm'>{form.email}</p>
                </div>

                <div className='mb-6'>
                  <p className='text-stone-700 font-semibold text-sm mb-3 flex items-center gap-2'>
                    <CreditCard className='w-4 h-4 text-amber-500' /> Payment
                    Method
                  </p>
                  <div className='space-y-3'>
                    {[
                      {
                        value: 'cod',
                        label: 'Cash on Delivery',
                        sub: 'Pay when your order arrives'
                      },
                      {
                        value: 'bank',
                        label: 'Bank Transfer',
                        sub: 'Details will be sent via email'
                      }
                    ].map(pm => (
                      <label
                        key={pm.value}
                        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                          form.payment === pm.value
                            ? 'border-amber-400 bg-amber-50'
                            : 'border-stone-200 hover:border-amber-300'
                        }`}
                      >
                        <input
                          type='radio'
                          value={pm.value}
                          checked={form.payment === pm.value}
                          onChange={e =>
                            setForm(f => ({ ...f, payment: e.target.value }))
                          }
                          className='mt-0.5'
                        />
                        <div>
                          <p className='font-semibold text-stone-800 text-sm'>
                            {pm.label}
                          </p>
                          <p className='text-stone-400 text-xs'>{pm.sub}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className='w-full flex items-center justify-center gap-2 py-4 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold rounded-xl transition-all text-sm disabled:opacity-50'
                >
                  <CheckCircle className='w-5 h-5' />
                  {placing
                    ? 'Placing Order...'
                    : `Place Order · $${grandTotal.toFixed(2)}`}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary Interface Panel */}
          <div className='lg:col-span-2'>
            <div className='bg-white rounded-3xl border border-stone-100 p-6 shadow-sm sticky top-24'>
              <h3 className='font-bold text-stone-900 text-lg font-serif mb-5'>
                Order Summary
              </h3>
              <div className='space-y-3 mb-5 max-h-64 overflow-y-auto pr-1'>
                {displayItems.map((item, i) => (
                  <div key={i} className='flex gap-3 items-center py-1'>
                    <div className='w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-stone-50 border border-stone-100'>
                      <img
                        src={item.image}
                        alt={item.name}
                        className='w-full h-full object-cover'
                      />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-stone-800 font-semibold text-sm font-serif truncate'>
                        {item.name}
                      </p>
                      <p className='text-stone-400 text-xs mt-0.5'>
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className='text-stone-800 font-bold text-sm shrink-0'>
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className='border-t border-stone-100 pt-4 space-y-2.5'>
                <div className='flex justify-between text-sm'>
                  <span className='text-stone-500'>Subtotal</span>
                  <span className='text-stone-800 font-semibold'>
                    ${total.toFixed(2)}
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-stone-500'>Shipping</span>
                  <span
                    className={
                      shipping === 0
                        ? 'text-emerald-600 font-bold'
                        : 'text-stone-800 font-semibold'
                    }
                  >
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className='flex justify-between font-bold pt-3 border-t border-stone-100 mt-2'>
                  <span className='text-stone-900'>Total</span>
                  <span className='text-stone-900 text-lg'>
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
