import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Star, Leaf, Shield, Package, Wind, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useProducts, useCategories } from '../hooks/useProducts';
import { supabase, Testimonial } from '../lib/supabase';
import ProductCard from '../components/ProductCard';

type Props = {
  onNavigate: (page: string, params?: Record<string, string>) => void;
};

const teaFactBanners = [
  {
    title: 'Discover the Art of Tea',
    subtitle: 'Sourced from ancient gardens, crafted with centuries of wisdom.',
    cta: 'Explore Collection',
    image: 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg',
    accent: 'from-stone-900/80 via-stone-900/50 to-transparent',
  },
  {
    title: 'New Season, New Arrivals',
    subtitle: 'Spring harvests from the misty highlands of Japan and Darjeeling.',
    cta: 'Shop New Arrivals',
    image: 'https://images.pexels.com/photos/3887985/pexels-photo-3887985.jpeg',
    accent: 'from-stone-900/80 via-stone-900/40 to-transparent',
  },
  {
    title: 'Wellness in Every Cup',
    subtitle: 'Ancient remedies. Modern ritual. Pure, intentional blends.',
    cta: 'Explore Wellness',
    image: 'https://images.pexels.com/photos/1453712/pexels-photo-1453712.jpeg',
    accent: 'from-stone-900/80 via-stone-900/50 to-transparent',
  },
];

function AnimatedCounter({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          setCount(Math.floor(end * (1 - Math.pow(1 - progress, 3))));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <div ref={ref}>{count}{suffix}</div>;
}

export default function Home({ onNavigate }: Props) {
  const [heroIdx, setHeroIdx] = useState(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const { products: featured } = useProducts({ featured: true, limit: 4 });
  const { products: newArrivals } = useProducts({ newArrival: true, limit: 4 });
  const { products: bestSellers } = useProducts({ bestSeller: true, limit: 4 });
  const { categories } = useCategories();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    supabase.from('testimonials').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
      setTestimonials((data as Testimonial[]) || []);
    });
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => setHeroIdx(i => (i + 1) % teaFactBanners.length), 5500);
    return () => clearInterval(intervalRef.current);
  }, []);

  const hero = teaFactBanners[heroIdx];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="relative h-screen min-h-[600px] overflow-hidden">
        {teaFactBanners.map((b, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === heroIdx ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={b.image} alt={b.title} className="w-full h-full object-cover scale-105 transition-transform duration-[6000ms]" />
            <div className={`absolute inset-0 bg-gradient-to-r ${b.accent}`} />
          </div>
        ))}

        {/* Floating leaves */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce opacity-20"
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.7}s`,
                animationDuration: `${3 + i * 0.5}s`,
              }}
            >
              <Leaf className="w-5 h-5 text-amber-300 rotate-45" />
            </div>
          ))}
        </div>

        {/* Steam effect */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-stone-50 to-transparent" />

        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full pt-20">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-6">
                <span className="h-px w-10 bg-amber-400" />
                <span className="text-amber-400 text-sm font-medium tracking-[0.2em] uppercase">Luminary Fine Teas</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white font-serif leading-tight mb-6 transition-all duration-700">
                {hero.title}
              </h1>
              <p className="text-stone-200 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
                {hero.subtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => onNavigate('products')}
                  className="flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold rounded-full transition-all hover:scale-105 shadow-lg shadow-amber-500/30"
                >
                  {hero.cta} <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('about')}
                  className="flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-full border border-white/20 transition-all"
                >
                  <Play className="w-4 h-4" /> Our Story
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Navigation */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 z-10">
          <button onClick={() => setHeroIdx(i => (i - 1 + teaFactBanners.length) % teaFactBanners.length)} className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 border border-white/20 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            {teaFactBanners.map((_, i) => (
              <button key={i} onClick={() => setHeroIdx(i)} className={`transition-all rounded-full ${i === heroIdx ? 'w-8 h-2 bg-amber-400' : 'w-2 h-2 bg-white/30'}`} />
            ))}
          </div>
          <button onClick={() => setHeroIdx(i => (i + 1) % teaFactBanners.length)} className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 border border-white/20 transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-stone-900 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 50, suffix: '+', label: 'Tea Varieties' },
              { value: 12, suffix: '+', label: 'Source Countries' },
              { value: 25000, suffix: '+', label: 'Happy Customers' },
              { value: 8, suffix: '+', label: 'Years of Expertise' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="text-amber-400 font-bold text-4xl md:text-5xl font-serif mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-stone-400 text-sm tracking-wide uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-amber-600 text-sm font-medium tracking-widest uppercase">Discover</span>
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 font-serif mt-2 mb-4">Explore Our Collections</h2>
            <p className="text-stone-500 max-w-xl mx-auto leading-relaxed">From misty mountain greens to bold Assamese blacks, every cup tells a story of its origin.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onNavigate('products', { category: cat.slug })}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer"
              >
                <img
                  src={cat.image_url || 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-semibold text-sm font-serif leading-tight">{cat.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-20 bg-stone-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-amber-600 text-sm font-medium tracking-widest uppercase">Curated for You</span>
                <h2 className="text-4xl md:text-5xl font-bold text-stone-900 font-serif mt-2">Featured Teas</h2>
              </div>
              <button onClick={() => onNavigate('products')} className="hidden md:flex items-center gap-2 text-stone-600 hover:text-amber-600 font-medium transition-colors text-sm">
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map(p => <ProductCard key={p.id} product={p} onNavigate={onNavigate} />)}
            </div>
          </div>
        </section>
      )}

      {/* Brand Story Banner */}
      <section className="relative overflow-hidden bg-stone-900 py-24">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/227908/pexels-photo-227908.jpeg" alt="Tea garden" className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <span className="text-amber-400 text-sm font-medium tracking-widest uppercase">Our Philosophy</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white font-serif mt-4 mb-6 leading-tight">
              Tea is more than a beverage — it is a ceremony of the senses.
            </h2>
            <p className="text-stone-300 text-lg leading-relaxed mb-8">
              Since 2018, we've traveled to the world's most celebrated tea gardens — from the cloud-draped hills of Darjeeling to the ancient forests of Yunnan — to bring you teas of extraordinary character. Each harvest is selected by hand, processed with reverence, and delivered to your door.
            </p>
            <button
              onClick={() => onNavigate('about')}
              className="flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold rounded-full transition-all hover:scale-105"
            >
              Read Our Story <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block">
          <Leaf className="w-96 h-96 text-amber-400 rotate-45" />
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-amber-600 text-sm font-medium tracking-widest uppercase">Just Arrived</span>
                <h2 className="text-4xl md:text-5xl font-bold text-stone-900 font-serif mt-2">New Arrivals</h2>
              </div>
              <button onClick={() => onNavigate('products')} className="hidden md:flex items-center gap-2 text-stone-600 hover:text-amber-600 font-medium transition-colors text-sm">
                See All <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map(p => <ProductCard key={p.id} product={p} onNavigate={onNavigate} />)}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="py-20 bg-amber-50 border-y border-amber-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-amber-600 text-sm font-medium tracking-widest uppercase">The Luminary Promise</span>
            <h2 className="text-4xl font-bold text-stone-900 font-serif mt-2">Why Tea Lovers Choose Us</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Leaf, title: 'Single-Origin Sourcing', desc: 'Every tea is traced back to its exact garden, harvest, and season.' },
              { icon: Shield, title: 'Certified Quality', desc: 'Third-party tested for purity. No additives. No shortcuts.' },
              { icon: Package, title: 'Sustainable Packaging', desc: 'Biodegradable tins and eco-certified outer packaging.' },
              { icon: Wind, title: 'Freshness Guaranteed', desc: 'Direct from source. Sealed for peak freshness. Delivered fast.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-amber-100 text-center hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <item.icon className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="text-stone-900 font-bold text-lg font-serif mb-3">{item.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="py-20 bg-stone-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-amber-600 text-sm font-medium tracking-widest uppercase">Most Loved</span>
                <h2 className="text-4xl md:text-5xl font-bold text-stone-900 font-serif mt-2">Best Sellers</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.map(p => <ProductCard key={p.id} product={p} onNavigate={onNavigate} />)}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-stone-900">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-14">
              <span className="text-amber-400 text-sm font-medium tracking-widest uppercase">What They Say</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white font-serif mt-2">Voices of the Tea Circle</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.map(t => (
                <div key={t.id} className="bg-stone-800/60 border border-stone-700 rounded-2xl p-6 flex flex-col gap-4">
                  <div className="flex">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= t.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-600'}`} />
                    ))}
                  </div>
                  <p className="text-stone-300 text-sm leading-relaxed italic flex-1">"{t.body}"</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-stone-700">
                    <img
                      src={t.author_image || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'}
                      alt={t.author_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-white font-semibold text-sm">{t.author_name}</p>
                      <p className="text-stone-500 text-xs">{t.author_title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900">
        <div className="absolute inset-0 opacity-5">
          {[...Array(20)].map((_, i) => (
            <Leaf key={i} className="absolute text-amber-300" style={{ left: `${(i * 13) % 100}%`, top: `${(i * 17) % 100}%`, width: `${20 + (i % 4) * 10}px`, height: `${20 + (i % 4) * 10}px`, transform: `rotate(${i * 45}deg)` }} />
          ))}
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <span className="text-amber-300 text-sm font-medium tracking-widest uppercase">Start Your Journey</span>
          <h2 className="text-4xl md:text-6xl font-bold text-white font-serif mt-4 mb-6 leading-tight">Find Your Perfect Tea</h2>
          <p className="text-amber-100/80 text-lg mb-10 leading-relaxed">Explore 50+ exceptional teas and discover the one that speaks to your soul.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => onNavigate('products')}
              className="px-10 py-4 bg-white text-stone-900 font-bold rounded-full hover:bg-amber-50 transition-all hover:scale-105 shadow-xl"
            >
              Shop All Teas
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-10 py-4 bg-transparent border-2 border-white/30 text-white font-bold rounded-full hover:bg-white/10 transition-all"
            >
              Get Recommendations
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
