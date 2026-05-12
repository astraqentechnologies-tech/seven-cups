import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

type Props = {
  onNavigate: (page: string) => void;
};

export default function Cart({ onNavigate }: Props) {
  const { user } = useAuth();
  const { items, localItems, itemCount, total, updateQuantity, removeFromCart, updateLocalQuantity, removeFromLocalCart } = useCart();

  const displayItems = user
    ? items.map(item => ({
        id: item.id,
        name: item.products?.name || '',
        image: item.products?.cover_image_url || '',
        price: item.products?.price || 0,
        comparePrice: item.products?.compare_price || 0,
        quantity: item.quantity,
        onQty: (q: number) => updateQuantity(item.id, q),
        onRemove: () => removeFromCart(item.id),
      }))
    : localItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        image: item.product.cover_image_url,
        price: item.product.price,
        comparePrice: item.product.compare_price,
        quantity: item.quantity,
        onQty: (q: number) => updateLocalQuantity(item.product.id, q),
        onRemove: () => removeFromLocalCart(item.product.id),
      }));

  const shipping = total >= 50 ? 0 : 5.99;

  return (
    <div className="min-h-screen bg-stone-50 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-10">
          <ShoppingCart className="w-6 h-6 text-amber-600" />
          <h1 className="text-4xl font-bold text-stone-900 font-serif">Shopping Cart</h1>
          {itemCount > 0 && (
            <span className="bg-amber-500 text-stone-900 text-sm font-bold px-3 py-1 rounded-full">{itemCount} items</span>
          )}
        </div>

        {displayItems.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-stone-100">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShoppingCart className="w-9 h-9 text-stone-300" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 font-serif mb-3">Your cart is empty</h2>
            <p className="text-stone-500 mb-8">Discover our exceptional teas and add your favorites.</p>
            <button
              onClick={() => onNavigate('products')}
              className="px-10 py-4 bg-stone-900 hover:bg-amber-600 text-white font-bold rounded-full transition-all"
            >
              Browse All Teas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {displayItems.map(item => (
                <div key={item.id} className="bg-white rounded-2xl border border-stone-100 p-5 flex gap-5 items-start shadow-sm">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-stone-50">
                    <img src={item.image || 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg'} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-stone-900 font-bold text-base font-serif mb-1">{item.name}</h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-amber-600 font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                      {item.comparePrice > 0 && (
                        <span className="text-stone-400 text-sm line-through">${(item.comparePrice * item.quantity).toFixed(2)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-stone-100 rounded-full px-3 py-1.5">
                        <button onClick={() => item.onQty(item.quantity - 1)} className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-stone-200 transition-colors">
                          <Minus className="w-3 h-3 text-stone-600" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-stone-800">{item.quantity}</span>
                        <button onClick={() => item.onQty(item.quantity + 1)} className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-stone-200 transition-colors">
                          <Plus className="w-3 h-3 text-stone-600" />
                        </button>
                      </div>
                      <button onClick={item.onRemove} className="flex items-center gap-1 text-red-400 hover:text-red-500 text-xs font-medium transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Free shipping notice */}
              {shipping > 0 && (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <Tag className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-amber-700 text-sm">
                    Add <strong>${(50 - total).toFixed(2)}</strong> more to unlock <strong>free shipping!</strong>
                  </p>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm sticky top-24">
                <h2 className="text-xl font-bold text-stone-900 font-serif mb-6">Order Summary</h2>
                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Subtotal ({itemCount} items)</span>
                    <span className="text-stone-800 font-medium">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Shipping</span>
                    <span className={shipping === 0 ? 'text-emerald-600 font-semibold' : 'text-stone-800 font-medium'}>
                      {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {shipping === 0 && (
                    <div className="flex items-center gap-2 bg-emerald-50 rounded-xl px-3 py-2">
                      <span className="text-emerald-600 text-xs font-semibold">Free shipping applied!</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-stone-100 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="font-bold text-stone-900">Total</span>
                    <span className="font-bold text-stone-900 text-xl">${(total + shipping).toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('checkout')}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-stone-900 hover:bg-amber-600 text-white font-bold rounded-xl transition-all text-sm"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('products')}
                  className="w-full text-center mt-3 text-stone-500 text-sm hover:text-amber-600 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
