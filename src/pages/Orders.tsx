import { useEffect, useState } from 'react'
import { Package, ChevronRight, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase, Order } from '../lib/supabase'

type Props = {
  onNavigate: (page: string) => void
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-amber-100 text-amber-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-600'
}

export default function Orders ({ onNavigate }: Props) {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Order | null>(null)

  useEffect(() => {
    if (!user) return
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data as Order[]) || [])
        setLoading(false)
      })
  }, [user])

  if (!user) {
    return (
      <div className='min-h-screen bg-stone-50 pt-20 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-stone-500 mb-4'>
            Please sign in to view your orders.
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

  if (selected) {
    return (
      <div className='min-h-screen bg-stone-50 pt-20'>
        <div className='max-w-3xl mx-auto px-6 py-12'>
          <button
            onClick={() => setSelected(null)}
            className='flex items-center gap-2 text-stone-500 hover:text-amber-600 text-sm mb-8 transition-colors'
          >
            <ArrowLeft className='w-4 h-4' /> Back to Orders
          </button>
          <div className='bg-white rounded-3xl border border-stone-100 shadow-sm p-8'>
            <div className='flex items-start justify-between mb-6'>
              <div>
                <p className='text-stone-400 text-xs uppercase tracking-wide mb-1'>
                  Order Number
                </p>
                <h2 className='text-2xl font-bold text-stone-900 font-mono'>
                  {selected.order_number}
                </h2>
                <p className='text-stone-400 text-sm mt-1'>
                  {new Date(selected.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <span
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                  statusColors[selected.status] || 'bg-stone-100 text-stone-600'
                }`}
              >
                {selected.status}
              </span>
            </div>

            {/* Items */}
            <div className='mb-6'>
              <h3 className='font-semibold text-stone-700 text-sm mb-4'>
                Items Ordered
              </h3>
              <div className='space-y-3'>
                {selected.order_items?.map(item => (
                  <div
                    key={item.id}
                    className='flex gap-4 items-center bg-stone-50 rounded-xl p-4'
                  >
                    <div className='w-14 h-14 rounded-lg overflow-hidden bg-stone-100 shrink-0'>
                      <img
                        src={
                          item.product_image ||
                          'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg'
                        }
                        alt={item.product_name}
                        className='w-full h-full object-cover'
                      />
                    </div>
                    <div className='flex-1'>
                      <p className='font-semibold text-stone-800 text-sm'>
                        {item.product_name}
                      </p>
                      <p className='text-stone-400 text-xs'>
                        Qty: {item.quantity} × ${item.unit_price.toFixed(2)}
                      </p>
                    </div>
                    <p className='font-bold text-stone-800 text-sm'>
                      ${item.total_price.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6'>
              <div className='bg-stone-50 rounded-2xl p-5'>
                <p className='text-stone-400 text-xs uppercase tracking-wide font-medium mb-3'>
                  Shipping Address
                </p>
                <p className='font-semibold text-stone-800 text-sm'>
                  {selected.shipping_name}
                </p>
                <p className='text-stone-500 text-sm'>
                  {selected.shipping_address}
                </p>
                <p className='text-stone-500 text-sm'>
                  {selected.shipping_city}, {selected.shipping_zip}
                </p>
                <p className='text-stone-500 text-sm'>
                  {selected.shipping_country}
                </p>
              </div>
              <div className='bg-stone-50 rounded-2xl p-5'>
                <p className='text-stone-400 text-xs uppercase tracking-wide font-medium mb-3'>
                  Order Totals
                </p>
                <div className='space-y-1.5 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-stone-500'>Subtotal</span>
                    <span className='text-stone-800'>
                      ${selected.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-stone-500'>Shipping</span>
                    <span className='text-stone-800'>
                      {selected.shipping_cost === 0
                        ? 'Free'
                        : `$${selected.shipping_cost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className='flex justify-between font-bold pt-1 border-t border-stone-100 mt-1'>
                    <span>Total</span>
                    <span>${selected.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-stone-50 pt-20'>
      <div className='max-w-4xl mx-auto px-6 py-12'>
        <div className='flex items-center gap-3 mb-10'>
          <Package className='w-7 h-7 text-amber-600' />
          <h1 className='text-3xl font-bold text-stone-900 font-serif'>
            My Orders
          </h1>
        </div>

        {loading ? (
          <div className='space-y-4'>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className='bg-white rounded-2xl h-24 animate-pulse'
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className='text-center py-20 bg-white rounded-3xl border border-stone-100'>
            <Package className='w-12 h-12 text-stone-200 mx-auto mb-4' />
            <h2 className='text-xl font-bold text-stone-900 font-serif mb-2'>
              No orders yet
            </h2>
            <p className='text-stone-500 text-sm mb-6'>
              Start exploring our teas and place your first order.
            </p>
            <button
              onClick={() => onNavigate('products')}
              className='px-8 py-4 bg-stone-900 text-white font-bold rounded-full hover:bg-amber-600 transition-all'
            >
              Browse Teas
            </button>
          </div>
        ) : (
          <div className='space-y-4'>
            {orders.map(order => (
              <button
                key={order.id}
                onClick={() => setSelected(order)}
                className='w-full bg-white rounded-2xl border border-stone-100 p-5 flex items-center gap-5 shadow-sm hover:border-amber-300 hover:shadow-md transition-all text-left'
              >
                <div className='w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0'>
                  <Package className='w-6 h-6 text-amber-600' />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-3 mb-1'>
                    <p className='font-bold text-stone-900 font-mono text-sm'>
                      {order.order_number}
                    </p>
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-semibold ${
                        statusColors[order.status] ||
                        'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className='text-stone-400 text-xs'>
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className='text-right shrink-0'>
                  <p className='font-bold text-stone-900'>
                    ${order.total.toFixed(2)}
                  </p>
                  <p className='text-stone-400 text-xs'>
                    {order.order_items?.length || 0} item(s)
                  </p>
                </div>
                <ChevronRight className='w-5 h-5 text-stone-300 shrink-0' />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
