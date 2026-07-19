import { Leaf, Instagram, Facebook, Twitter, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/logo.png"; // top pe add karo


export default function Footer() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // await supabase.from('newsletter_subscribers').insert({ email }).select();
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="bg-stone-950 text-stone-300 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Newsletter */}
        <div className="relative bg-gradient-to-r from-amber-900/40 to-stone-800/60 border border-amber-800/30 rounded-3xl p-8 md:p-12 mb-16 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-amber-400 text-sm tracking-widest uppercase font-medium mb-2">Stay Connected</p>
              <h3 className="text-3xl font-bold text-white font-serif mb-3">Join the Tea Circle</h3>
              <p className="text-stone-400 leading-relaxed">Receive seasonal picks, exclusive offers, and the art of brewing delivered to your inbox.</p>
            </div>
            <div>
              {subscribed ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center">
                  <p className="text-emerald-400 font-semibold text-lg">You're subscribed!</p>
                  <p className="text-stone-400 text-sm mt-1">Watch for our first letter in your inbox.</p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="flex-1 bg-stone-800 border border-stone-600 rounded-full px-5 py-3.5 text-white placeholder-stone-500 text-sm outline-none focus:border-amber-500 transition-colors"
                    required
                  />
                  <button type="submit" className="flex items-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold rounded-full text-sm transition-all shrink-0">
                    Subscribe <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <img src={logo} alt="sevencups logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-white font-bold text-xl tracking-wide font-serif">sevencups</span>

            </button>
            <p className="text-stone-500 text-sm leading-relaxed mb-6">
              Sourcing the world's finest teas from ancient gardens and bringing them to your cup with reverence and care.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-stone-800 hover:bg-amber-500 rounded-full flex items-center justify-center transition-all group">
                  <Icon className="w-4 h-4 text-stone-400 group-hover:text-stone-900 transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm tracking-wide uppercase">Explore</h4>
            <ul className="flex flex-col gap-3">
              {[
                { label: 'All Products', path: '/products' },
                { label: 'New Arrivals', path: '/products' },
                { label: 'Best Sellers', path: '/products' },
                { label: 'About Us', path: '/about' },
                { label: 'Contact', path: '/contact' },
              ].map(link => (
                <li key={link.label}>
                  <button onClick={() => navigate(link.path)} className="text-stone-500 hover:text-amber-400 text-sm transition-colors">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm tracking-wide uppercase">Tea Types</h4>
            <ul className="flex flex-col gap-3">
              {['Green Tea', 'Black Tea', 'Herbal Tea', 'Organic Tea', 'Wellness Tea', 'Premium'].map(cat => (
                <li key={cat}>
                  <button onClick={() => navigate('/products')} className="text-stone-500 hover:text-amber-400 text-sm transition-colors">
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm tracking-wide uppercase">Contact</h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <span className="text-stone-500 text-sm">hello@luminarytea.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <span className="text-stone-500 text-sm">+1 (555) 234-5678</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <span className="text-stone-500 text-sm">42 Garden Lane, San Francisco, CA 94102</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-stone-600 text-sm">© 2026 Luminary Fine Teas. All rights reserved.</p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Shipping Policy'].map(item => (
              <button key={item} className="text-stone-600 hover:text-stone-400 text-xs transition-colors">
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}