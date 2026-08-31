import { useState, useEffect } from 'react'
import {
  CheckCircle,
  ArrowRight,
  Package,
  CreditCard,
  ChevronLeft,
  Zap
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

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

const API_BASE_URL = import.meta.env.VITE_API_URL
const BASE_URL = 'https://admin.sevencups.in'

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

// Razorpay types
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayResponse) => void
  prefill: {
    name: string
    email: string
    contact: string
  }
  config?: {
    display?: {
      blocks?: Record<string, unknown>
      sequence?: string[]
      preferences?: {
        show_default_blocks?: boolean
      }
    }
  }
  theme: {
    color: string
  }
  modal?: {
    ondismiss?: () => void
  }
}

interface RazorpayInstance {
  open: () => void
}

interface RazorpayResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export default function Checkout() {
  const navigate = useNavigate()
  const { user, token, profile } = useAuth()
  const { items, total, clearCart } = useCart()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<ShippingForm>({
    name: profile?.name || user?.name || '',
    email: profile?.email || user?.email || '',
    phone: '',
    address: '',
    city: '',
    country: 'India',
    zip: '',
    notes: '',
    payment: 'razorpay'
  })
  const [placing, setPlacing] = useState(false)
  const [orderId, setOrderId] = useState('')

  // Load Razorpay SDK dynamically
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

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
            onClick={() => navigate('/auth')}
            className='px-8 py-4 bg-stone-900 text-white font-bold rounded-full hover:bg-amber-600 transition-all'
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  const displayItems = items.map(item => {
    const productData = item.product || item.products
    const rawImageUrl = productData?.primary_image?.image_url
    const imageUrl = rawImageUrl
      ? rawImageUrl.startsWith('http')
        ? rawImageUrl
        : `${BASE_URL}${rawImageUrl}`
      : 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg'

    return {
      name: productData?.name || 'Premium Tea Blend',
      image: imageUrl,
      price: Number(productData?.price || 0),
      quantity: item.quantity,
      productId: item.product_id
    }
  })

  const shipping = total >= 50 ? 0 : 5.99
  const grandTotal = total + shipping

  // ─── COD / Bank Transfer Order ────────────────────────────────────────────────
  const handleCODOrder = async () => {
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
        setOrderId(`#SC-${data.order_id || Date.now()}`)
        setStep(3)
      } else {
        alert(data.message || 'Order submit karne mein problem aayi.')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Network error. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  // ─── Razorpay Order Flow ──────────────────────────────────────────────────────
  const handleRazorpayOrder = async () => {
    if (displayItems.length === 0) return
    if (!window.Razorpay) {
      alert('Payment gateway load nahi hua. Please refresh karein.')
      return
    }

    setPlacing(true)

    try {
      // FIX: Rupees mein bhejo — backend khud paise mein convert karega
      const amountInRupees = Math.round(grandTotal)

      const createRes = await fetch(`${BASE_URL}/api/razorpay/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        },
        body: JSON.stringify({ amount: amountInRupees })
      })

      const createData = await createRes.json()

      if (!createRes.ok || !createData.order_id) {
        alert(createData.message || 'Payment order create karne mein dikkat aayi.')
        setPlacing(false)
        return
      }

      const { key, order_id, amount } = createData

      // FIX: UPI/Scanner show karne ke liye config add kiya
      const options: RazorpayOptions = {
        key,
        amount,
        currency: 'INR',
        name: 'Seven Cups',
        description: 'Premium Tea Order',
        order_id,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone  // valid 10-digit Indian number hona chahiye
        },
        // UPI scanner force show karne ke liye
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay via UPI',
                instruments: [
                  { method: 'upi' }
                ]
              },
              other: {
                name: 'Other Payment Modes',
                instruments: [
                  { method: 'card' },
                  { method: 'netbanking' },
                  { method: 'wallet' }
                ]
              }
            },
            sequence: ['block.upi', 'block.other'],
            preferences: {
              show_default_blocks: false
            }
          }
        },
        theme: {
          color: '#78350f'
        },
        handler: async (response: RazorpayResponse) => {
          await verifyAndCreateOrder(response, order_id)
        },
        modal: {
          ondismiss: () => {
            setPlacing(false)
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      console.error('Razorpay init error:', err)
      alert('Payment gateway mein error aaya. Please try again.')
      setPlacing(false)
    }
  }

  // ─── Verify Payment + Save Order ──────────────────────────────────────────────
  const verifyAndCreateOrder = async (
    response: RazorpayResponse,
    rzpOrderId: string
  ) => {
    try {
      const payload = {
        razorpay_order_id: response.razorpay_order_id || rzpOrderId,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        full_name: form.name,
        email: form.email,
        phone: form.phone,
        street_address: form.address,
        city: form.city,
        zip_postal: form.zip,
        country: form.country,
        notes: form.notes,
        items: displayItems.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price
        }))
      }

      const verifyRes = await fetch(`${BASE_URL}/api/razorpay/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const verifyData = await verifyRes.json()

      if (verifyRes.ok && verifyData.success !== false) {
        await clearCart()
        setOrderId(`#SC-${verifyData.order_id || response.razorpay_payment_id}`)
        setStep(3)
      } else {
        alert(verifyData.message || 'Payment verification failed. Please contact support.')
        setPlacing(false)
      }
    } catch (err) {
      console.error('Payment verify error:', err)
      alert('Verification mein error. Please contact support with payment ID.')
      setPlacing(false)
    }
  }

  // ─── Main Place Order Handler ──────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (form.payment === 'razorpay') {
      await handleRazorpayOrder()
    } else {
      await handleCODOrder()
    }
  }

  // ─── Success Screen ────────────────────────────────────────────────────────────
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
            <p className='text-stone-900 font-bold text-xl font-mono'>{orderId}</p>
          </div>
          <p className='text-stone-400 text-sm mb-10'>
            A confirmation will be sent to <strong>{form.email}</strong>. Your
            order will arrive within 5–7 business days.
          </p>
          <div className='flex gap-4 justify-center'>
            <button
              onClick={() => navigate('/account')}
              className='px-8 py-4 bg-stone-900 hover:bg-amber-600 text-white font-bold rounded-full transition-all'
            >
              Track My Order
            </button>
            <button
              onClick={() => navigate('/products')}
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
                    step >= s.n ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  {step > s.n ? <CheckCircle className='w-5 h-5' /> : s.n}
                </div>
                <span className={`text-sm font-medium ${step >= s.n ? 'text-stone-900' : 'text-stone-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < 1 && (
                <div className={`w-16 h-0.5 ${step > s.n ? 'bg-stone-900' : 'bg-stone-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-5 gap-10'>

          {/* Main Forms */}
          <div className='lg:col-span-3'>

            {/* ── Step 1: Shipping ── */}
            {step === 1 && (
              <div className='bg-white rounded-3xl border border-stone-100 p-8 shadow-sm'>
                <h2 className='text-2xl font-bold text-stone-900 font-serif mb-7'>Shipping Details</h2>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                  {[
                    { label: 'Full Name', key: 'name', placeholder: 'Your name', span: 2 },
                    { label: 'Email', key: 'email', placeholder: 'you@example.com', type: 'email' },
                    { label: 'Phone', key: 'phone', placeholder: '+91 99999 99999', type: 'tel' },
                    { label: 'Street Address', key: 'address', placeholder: '123 Garden St', span: 2 },
                    { label: 'City', key: 'city', placeholder: 'Mumbai' },
                    { label: 'ZIP / Postal', key: 'zip', placeholder: '400001' }
                  ].map(field => (
                    <div key={field.key} className={field.span === 2 ? 'col-span-2' : ''}>
                      <label className='block text-stone-600 text-sm font-medium mb-2'>{field.label}</label>
                      <input
                        type={field.type || 'text'}
                        value={(form as Record<string, string>)[field.key]}
                        onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className='w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm outline-none focus:border-amber-400 focus:bg-white transition-all'
                      />
                    </div>
                  ))}
                  <div className='col-span-2'>
                    <label className='block text-stone-600 text-sm font-medium mb-2'>Country</label>
                    <select
                      value={form.country}
                      onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                      className='w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm outline-none focus:border-amber-400 appearance-none'
                    >
                      {countries.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className='col-span-2'>
                    <label className='block text-stone-600 text-sm font-medium mb-2'>Order Notes (optional)</label>
                    <textarea
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder='Special instructions, gift message...'
                      rows={3}
                      className='w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm outline-none focus:border-amber-400 resize-none'
                    />
                  </div>
                </div>
                <button
                  onClick={() => setStep(2)}
                  disabled={!form.name || !form.email || !form.address || !form.phone}
                  className='mt-7 w-full flex items-center justify-center gap-2 py-4 bg-stone-900 hover:bg-amber-600 text-white font-bold rounded-xl transition-all disabled:opacity-40'
                >
                  Continue to Review <ArrowRight className='w-4 h-4' />
                </button>
              </div>
            )}

            {/* ── Step 2: Review & Payment ── */}
            {step === 2 && (
              <div className='bg-white rounded-3xl border border-stone-100 p-8 shadow-sm'>
                <button
                  onClick={() => setStep(1)}
                  className='flex items-center gap-2 text-stone-500 hover:text-amber-600 text-sm mb-6 transition-colors'
                >
                  <ChevronLeft className='w-4 h-4' /> Edit Shipping
                </button>
                <h2 className='text-2xl font-bold text-stone-900 font-serif mb-6'>Review & Payment</h2>

                {/* Delivery Address Summary */}
                <div className='bg-stone-50 rounded-2xl p-5 mb-6 border border-stone-100'>
                  <p className='text-stone-500 text-xs uppercase tracking-wide font-medium mb-3'>Delivering to</p>
                  <p className='font-bold text-stone-800'>{form.name}</p>
                  <p className='text-stone-500 text-sm'>{form.address}, {form.city}, {form.zip}</p>
                  <p className='text-stone-500 text-sm'>{form.country}</p>
                  <p className='text-stone-500 text-sm'>{form.email} · {form.phone}</p>
                </div>

                {/* Payment Method */}
                <div className='mb-6'>
                  <p className='text-stone-700 font-semibold text-sm mb-3 flex items-center gap-2'>
                    <CreditCard className='w-4 h-4 text-amber-500' /> Payment Method
                  </p>
                  <div className='space-y-3'>

                    {/* Razorpay - Online Payment */}
                    <label
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        form.payment === 'razorpay'
                          ? 'border-amber-400 bg-amber-50'
                          : 'border-stone-200 hover:border-amber-300'
                      }`}
                    >
                      <input
                        type='radio'
                        value='razorpay'
                        checked={form.payment === 'razorpay'}
                        onChange={e => setForm(f => ({ ...f, payment: e.target.value }))}
                        className='mt-0.5'
                      />
                      <div className='flex-1'>
                        <div className='flex items-center gap-2'>
                          <Zap className='w-4 h-4 text-amber-500' />
                          <p className='font-semibold text-stone-800 text-sm'>Online Payment</p>
                          <span className='text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium'>
                            Recommended
                          </span>
                        </div>
                        <p className='text-stone-400 text-xs mt-0.5'>
                          UPI, Scanner, Cards, Net Banking, Wallets via Razorpay
                        </p>
                      </div>
                    </label>

                    {/* COD */}
                    <label
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        form.payment === 'cod'
                          ? 'border-amber-400 bg-amber-50'
                          : 'border-stone-200 hover:border-amber-300'
                      }`}
                    >
                      <input
                        type='radio'
                        value='cod'
                        checked={form.payment === 'cod'}
                        onChange={e => setForm(f => ({ ...f, payment: e.target.value }))}
                        className='mt-0.5'
                      />
                      <div>
                        <p className='font-semibold text-stone-800 text-sm'>Cash on Delivery</p>
                        <p className='text-stone-400 text-xs'>Pay when your order arrives</p>
                      </div>
                    </label>

                    {/* Bank Transfer */}
                    <label
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        form.payment === 'bank'
                          ? 'border-amber-400 bg-amber-50'
                          : 'border-stone-200 hover:border-amber-300'
                      }`}
                    >
                      <input
                        type='radio'
                        value='bank'
                        checked={form.payment === 'bank'}
                        onChange={e => setForm(f => ({ ...f, payment: e.target.value }))}
                        className='mt-0.5'
                      />
                      <div>
                        <p className='font-semibold text-stone-800 text-sm'>Bank Transfer</p>
                        <p className='text-stone-400 text-xs'>Details will be sent via email</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className={`w-full flex items-center justify-center gap-2 py-4 font-bold rounded-xl transition-all text-sm disabled:opacity-50 ${
                    form.payment === 'razorpay'
                      ? 'bg-amber-500 hover:bg-amber-400 text-stone-900'
                      : 'bg-stone-900 hover:bg-amber-600 text-white'
                  }`}
                >
                  <CheckCircle className='w-5 h-5' />
                  {placing
                    ? form.payment === 'razorpay'
                      ? 'Opening Payment...'
                      : 'Placing Order...'
                    : form.payment === 'razorpay'
                      ? `Pay ₹${grandTotal.toFixed(2)} via Razorpay`
                      : `Place Order · ₹${grandTotal.toFixed(2)}`
                  }
                </button>

                {form.payment === 'razorpay' && (
                  <p className='text-center text-stone-400 text-xs mt-3'>
                    🔒 Secured by Razorpay · SSL Encrypted
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className='lg:col-span-2'>
            <div className='bg-white rounded-3xl border border-stone-100 p-6 shadow-sm sticky top-24'>
              <h3 className='font-bold text-stone-900 text-lg font-serif mb-5'>Order Summary</h3>
              <div className='space-y-3 mb-5 max-h-64 overflow-y-auto pr-1'>
                {displayItems.map((item, i) => (
                  <div key={i} className='flex gap-3 items-center py-1'>
                    <div className='w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-stone-50 border border-stone-100'>
                      <img src={item.image} alt={item.name} className='w-full h-full object-cover' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-stone-800 font-semibold text-sm font-serif truncate'>{item.name}</p>
                      <p className='text-stone-400 text-xs mt-0.5'>Qty: {item.quantity}</p>
                    </div>
                    <p className='text-stone-800 font-bold text-sm shrink-0'>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className='border-t border-stone-100 pt-4 space-y-2.5'>
                <div className='flex justify-between text-sm'>
                  <span className='text-stone-500'>Subtotal</span>
                  <span className='text-stone-800 font-semibold'>₹{total.toFixed(2)}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-stone-500'>Shipping</span>
                  <span className={shipping === 0 ? 'text-emerald-600 font-bold' : 'text-stone-800 font-semibold'}>
                    {shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className='flex justify-between font-bold pt-3 border-t border-stone-100 mt-2'>
                  <span className='text-stone-900'>Total</span>
                  <span className='text-stone-900 text-lg'>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}