import { useState } from 'react';
import { ShoppingCart, Star, ChevronLeft, Leaf, Clock, Droplets, Thermometer, Package, ArrowRight, Plus, Minus } from 'lucide-react';
import { useProduct, useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

type Props = {
  slug: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
};

export default function ProductDetail({ slug, onNavigate }: Props) {
  const { product, loading } = useProduct(slug);
  const { products: related } = useProducts({ limit: 4 });
  const { addToCart } = useCart();
  const { user, profile } = useAuth();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });
  const [submitting, setSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    await addToCart(product, qty);
    setTimeout(() => setAdding(false), 700);
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) return;
    setSubmitting(true);
    await supabase.from('reviews').insert({
      product_id: product.id,
      user_id: user.id,
      reviewer_name: profile?.full_name || 'Anonymous',
      ...reviewForm,
    });
    setReviewSubmitted(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24">
        <div className="max-w-7xl mx-auto px-6 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-12">
            <div className="bg-stone-200 rounded-3xl aspect-square" />
            <div className="space-y-6">
              <div className="h-4 bg-stone-200 rounded w-1/4" />
              <div className="h-10 bg-stone-200 rounded w-3/4" />
              <div className="h-20 bg-stone-200 rounded" />
              <div className="h-12 bg-stone-200 rounded-full w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-400 text-lg mb-4">Product not found.</p>
          <button onClick={() => onNavigate('products')} className="text-amber-600 hover:underline">Browse all teas</button>
        </div>
      </div>
    );
  }

  const images = product.product_images && product.product_images.length > 0
    ? product.product_images.sort((a, b) => a.sort_order - b.sort_order).map(i => i.url)
    : [product.cover_image_url];

  const discount = product.compare_price > 0
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  const tabs = ['description', 'ingredients', 'brewing', 'reviews'];

  return (
    <div className="min-h-screen bg-stone-50 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <button onClick={() => onNavigate('products')} className="flex items-center gap-2 text-stone-500 hover:text-amber-600 text-sm mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to All Teas
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-white border border-stone-100 shadow-sm">
              <img
                src={images[activeImage] || 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${i === activeImage ? 'border-amber-400' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {/* Badges */}
            <div className="flex gap-2 mb-4">
              {product.is_new_arrival && <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">New Arrival</span>}
              {product.is_best_seller && <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">Best Seller</span>}
              {discount > 0 && <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">Save {discount}%</span>}
            </div>

            {product.categories && (
              <button
                onClick={() => onNavigate('products', { category: (product.categories as unknown as { slug: string }).slug })}
                className="text-amber-600 text-sm font-semibold tracking-widest uppercase hover:text-amber-700 transition-colors mb-2"
              >
                {(product.categories as unknown as { name: string }).name}
              </button>
            )}

            <h1 className="text-4xl md:text-5xl font-bold text-stone-900 font-serif mb-4 leading-tight">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
              </div>
              <span className="text-stone-500 text-sm">24 reviews</span>
            </div>

            <p className="text-stone-600 text-base leading-relaxed mb-6">{product.short_description}</p>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-4xl font-bold text-stone-900">${product.price.toFixed(2)}</span>
              {product.compare_price > 0 && <span className="text-stone-400 text-xl line-through">${product.compare_price.toFixed(2)}</span>}
              <span className="text-stone-400 text-sm">/ {product.weight_grams}g</span>
            </div>

            {/* Quick info */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                { icon: Leaf, label: 'Flavor', value: product.flavor_profile?.slice(0, 30) || 'Natural' },
                { icon: Package, label: 'Weight', value: `${product.weight_grams}g` },
                { icon: Clock, label: 'Steep Time', value: '2-5 min' },
                { icon: Thermometer, label: 'Temperature', value: '75-100°C' },
              ].map((info, i) => (
                <div key={i} className="flex items-center gap-3 bg-stone-100/80 rounded-xl px-4 py-3">
                  <info.icon className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-stone-400 text-[10px] uppercase tracking-wide">{info.label}</p>
                    <p className="text-stone-800 text-xs font-semibold">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Qty + Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-3 bg-stone-100 rounded-full px-4 py-2">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-stone-200 transition-colors">
                  <Minus className="w-3 h-3 text-stone-600" />
                </button>
                <span className="w-8 text-center font-bold text-stone-800">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-stone-200 transition-colors">
                  <Plus className="w-3 h-3 text-stone-600" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className={`flex-1 flex items-center justify-center gap-2 py-4 bg-stone-900 hover:bg-amber-600 text-white font-bold rounded-full transition-all text-sm ${adding ? 'scale-95 bg-emerald-600' : ''}`}
              >
                <ShoppingCart className="w-5 h-5" />
                {adding ? 'Added to Cart!' : 'Add to Cart'}
              </button>
            </div>

            <button
              onClick={() => { addToCart(product, qty); onNavigate('checkout'); }}
              className="w-full flex items-center justify-center gap-2 py-4 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold rounded-full transition-all text-sm"
            >
              Buy Now <ArrowRight className="w-4 h-4" />
            </button>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {product.tags.map(tag => (
                  <span key={tag} className="bg-stone-100 text-stone-500 text-xs px-3 py-1 rounded-full">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden shadow-sm mb-16">
          <div className="flex border-b border-stone-100 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 text-sm font-semibold capitalize whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/50'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-stone-700 leading-relaxed text-base">{product.description}</p>
                {product.benefits && (
                  <div className="mt-6">
                    <h4 className="text-stone-900 font-bold text-lg font-serif mb-3 flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-amber-500" /> Key Benefits
                    </h4>
                    <p className="text-stone-600 leading-relaxed">{product.benefits}</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'ingredients' && (
              <div>
                <h4 className="text-stone-900 font-bold text-lg font-serif mb-3">Ingredients</h4>
                <p className="text-stone-600 leading-relaxed">{product.ingredients || 'Pure tea leaves, no additives.'}</p>
                {product.flavor_profile && (
                  <div className="mt-6 bg-amber-50 border border-amber-100 rounded-2xl p-6">
                    <h5 className="font-bold text-stone-800 mb-2">Flavor Profile</h5>
                    <p className="text-stone-600">{product.flavor_profile}</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'brewing' && (
              <div>
                <h4 className="text-stone-900 font-bold text-lg font-serif mb-3">Brewing Instructions</h4>
                <p className="text-stone-600 leading-relaxed">{product.brewing_instructions || 'Steep in hot water for 3-5 minutes. Adjust time to taste.'}</p>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {[
                    { icon: Droplets, label: 'Amount', value: '2-3g per 200ml' },
                    { icon: Thermometer, label: 'Temperature', value: '75-100°C' },
                    { icon: Clock, label: 'Steep Time', value: '2-5 minutes' },
                  ].map((s, i) => (
                    <div key={i} className="bg-stone-50 rounded-2xl p-5 text-center border border-stone-100">
                      <s.icon className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                      <p className="text-stone-400 text-xs uppercase tracking-wide mb-1">{s.label}</p>
                      <p className="text-stone-800 font-semibold text-sm">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div>
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="space-y-6 mb-10">
                    {product.reviews.map(r => (
                      <div key={r.id} className="border-b border-stone-100 pb-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center font-bold text-amber-700 text-sm">
                            {r.reviewer_name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-stone-800 text-sm">{r.reviewer_name}</p>
                            <div className="flex">
                              {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200'}`} />)}
                            </div>
                          </div>
                        </div>
                        {r.title && <p className="font-semibold text-stone-800 mb-1 text-sm">{r.title}</p>}
                        <p className="text-stone-500 text-sm leading-relaxed">{r.body}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-400 text-sm mb-8">No reviews yet. Be the first!</p>
                )}

                {user ? (
                  reviewSubmitted ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
                      <p className="text-emerald-700 font-semibold">Thank you for your review!</p>
                      <p className="text-stone-500 text-sm mt-1">It will appear after moderation.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleReview} className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                      <h4 className="font-bold text-stone-900 text-lg font-serif mb-5">Write a Review</h4>
                      <div className="mb-4">
                        <label className="block text-stone-600 text-sm font-medium mb-2">Rating</label>
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(s => (
                            <button key={s} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: s }))}>
                              <Star className={`w-6 h-6 transition-colors ${s <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-300'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        value={reviewForm.title}
                        onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="Review title (optional)"
                        className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm mb-3 outline-none focus:border-amber-400"
                      />
                      <textarea
                        value={reviewForm.body}
                        onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))}
                        placeholder="Share your experience..."
                        rows={4}
                        className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-400 resize-none mb-4"
                        required
                      />
                      <button type="submit" disabled={submitting} className="px-8 py-3 bg-stone-900 hover:bg-amber-600 text-white font-semibold rounded-full text-sm transition-all">
                        {submitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  )
                ) : (
                  <div className="bg-stone-100 rounded-2xl p-6 text-center">
                    <p className="text-stone-500 text-sm mb-3">Sign in to write a review</p>
                    <button onClick={() => onNavigate('auth')} className="px-6 py-2.5 bg-stone-900 text-white font-semibold rounded-full text-sm hover:bg-amber-600 transition-colors">
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl font-bold text-stone-900 font-serif">You May Also Like</h2>
            <button onClick={() => onNavigate('products')} className="flex items-center gap-2 text-amber-600 text-sm font-medium hover:text-amber-700 transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.filter(p => p.id !== product.id).slice(0, 4).map(p => <ProductCard key={p.id} product={p} onNavigate={onNavigate} />)}
          </div>
        </section>
      </div>
    </div>
  );
}
