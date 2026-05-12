import { ShoppingCart, Star, Eye, Heart } from 'lucide-react';
import { Product } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

type Props = {
  product: Product;
  onNavigate: (page: string, params?: Record<string, string>) => void;
};

export default function ProductCard({ product, onNavigate }: Props) {
  const { addToCart, isInCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const inCart = isInCart(product.id);
  const discount = product.compare_price > 0
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setAdding(true);
    await addToCart(product);
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-stone-100 hover:border-amber-200">
      {/* Image */}
      <div className="relative overflow-hidden bg-stone-50 aspect-[4/3]" onClick={() => onNavigate('product', { slug: product.slug })}>
        <img
          src={product.cover_image_url || 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_new_arrival && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">New</span>
          )}
          {product.is_best_seller && (
            <span className="bg-amber-500 text-stone-900 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">Best Seller</span>
          )}
          {discount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">-{discount}%</span>
          )}
        </div>
        {/* Wishlist */}
        <button
          onClick={e => { e.stopPropagation(); setWishlisted(!wishlisted); }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-sm"
        >
          <Heart className={`w-4 h-4 transition-colors ${wishlisted ? 'text-red-500 fill-red-500' : 'text-stone-400'}`} />
        </button>
        {/* Quick view */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
          <button
            onClick={e => { e.stopPropagation(); onNavigate('product', { slug: product.slug }); }}
            className="flex items-center gap-2 bg-white text-stone-800 text-xs font-semibold px-4 py-2 rounded-full shadow-lg hover:bg-amber-50 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> Quick View
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4" onClick={() => onNavigate('product', { slug: product.slug })}>
        {product.categories && (
          <p className="text-amber-600 text-[11px] font-semibold uppercase tracking-widest mb-1.5">
            {(product.categories as unknown as { name: string }).name}
          </p>
        )}
        <h3 className="text-stone-800 font-semibold text-base leading-snug mb-2 font-serif group-hover:text-amber-700 transition-colors">
          {product.name}
        </h3>
        <p className="text-stone-500 text-xs leading-relaxed line-clamp-2 mb-3">{product.short_description}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[1,2,3,4,5].map(s => (
            <Star key={s} className={`w-3 h-3 ${s <= 5 ? 'text-amber-400 fill-amber-400' : 'text-stone-300'}`} />
          ))}
          <span className="text-stone-400 text-xs ml-1">(24)</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-stone-900 font-bold text-lg">${product.price.toFixed(2)}</span>
            {product.compare_price > 0 && (
              <span className="text-stone-400 text-sm line-through">${product.compare_price.toFixed(2)}</span>
            )}
          </div>
          <span className="text-stone-400 text-xs">{product.weight_grams}g</span>
        </div>
      </div>

      {/* Add to cart */}
      <div className="px-4 pb-4" onClick={e => e.stopPropagation()}>
        <button
          onClick={handleAddToCart}
          disabled={adding}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            inCart
              ? 'bg-emerald-500 text-white'
              : 'bg-stone-900 hover:bg-amber-600 text-white'
          } ${adding ? 'scale-95' : ''}`}
        >
          <ShoppingCart className="w-4 h-4" />
          {adding ? 'Added!' : inCart ? 'In Cart' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
