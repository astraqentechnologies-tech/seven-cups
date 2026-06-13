import { X, ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CartSidebar({ open, onClose }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, localItems, itemCount, total, updateQuantity, removeFromCart, updateLocalQuantity, removeFromLocalCart } = useCart();

  const displayItems = user
    ? items.map(item => ({
        id: item.id,
        name: item.products?.name || '',
        image: item.products?.cover_image_url || '',
        price: item.products?.price || 0,
        quantity: item.quantity,
        onQty: (q: number) => updateQuantity(item.id, q),
        onRemove: () => removeFromCart(item.id),
      }))
    : localItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        image: item.product.cover_image_url,
        price: item.product.price,
        quantity: item.quantity,
        onQty: (q: number) => updateLocalQuantity(item.product.id, q),
        onRemove: () => removeFromLocalCart(item.product.id),
      }));

  const goTo = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />}
      <div className={`fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-amber-600" />
            <h2 className="text-stone-900 font-bold text-lg font-serif">Your Cart</h2>
            {itemCount > 0 && (
              <span className="bg-amber-500 text-stone-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{itemCount}</span>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-100 transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-8 h-8 text-stone-300" />
              </div>
              <p className="text-stone-500 text-lg font-medium mb-2">Your cart is empty</p>
              <p className="text-stone-400 text-sm mb-6">Add some teas to get started</p>
              <button
                onClick={() => goTo('/products')}
                className="px-6 py-3 bg-stone-900 text-white rounded-full text-sm font-semibold hover:bg-amber-600 transition-colors"
              >
                Browse Teas
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {displayItems.map(item => (
                <div key={item.id} className="flex gap-4 p-3 bg-stone-50 rounded-xl">
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-stone-100">
                    <img src={item.image || 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg'} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-stone-800 font-semibold text-sm leading-snug mb-1 font-serif line-clamp-1">{item.name}</p>
                    <p className="text-amber-600 font-bold text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => item.onQty(item.quantity - 1)} className="w-6 h-6 bg-white border border-stone-200 rounded-full flex items-center justify-center hover:border-amber-400 transition-colors">
                        <Minus className="w-3 h-3 text-stone-500" />
                      </button>
                      <span className="text-stone-800 font-medium text-sm w-5 text-center">{item.quantity}</span>
                      <button onClick={() => item.onQty(item.quantity + 1)} className="w-6 h-6 bg-white border border-stone-200 rounded-full flex items-center justify-center hover:border-amber-400 transition-colors">
                        <Plus className="w-3 h-3 text-stone-500" />
                      </button>
                    </div>
                  </div>
                  <button onClick={item.onRemove} className="self-start p-1.5 hover:bg-red-50 rounded-lg transition-colors group">
                    <Trash2 className="w-4 h-4 text-stone-300 group-hover:text-red-400 transition-colors" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {displayItems.length > 0 && (
          <div className="px-6 py-5 border-t border-stone-100 bg-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-stone-500 text-sm">Subtotal</span>
              <span className="text-stone-800 font-bold text-lg">₹{total.toFixed(2)}</span>
            </div>
            <p className="text-stone-400 text-xs mb-4">Shipping calculated at checkout</p>
            <button
              onClick={() => goTo('/checkout')}
              className="w-full flex items-center justify-center gap-2 py-4 bg-stone-900 hover:bg-amber-600 text-white font-bold rounded-xl transition-all text-sm"
            >
              Checkout <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => goTo('/cart')}
              className="w-full text-center mt-3 text-stone-500 text-sm hover:text-amber-600 transition-colors"
            >
              View Full Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}