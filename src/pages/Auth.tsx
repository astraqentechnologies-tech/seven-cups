import { useState } from 'react';
import { Leaf, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Props = {
  onNavigate: (page: string) => void;
};

export default function Auth({ onNavigate }: Props) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'register' && form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    if (mode === 'login') {
      const { error } = await signIn(form.email, form.password);
      if (error) setError(error.message);
      else onNavigate('home');
    } else {
      const { error } = await signUp(form.email, form.password, form.name);
      if (error) setError(error.message);
      else onNavigate('home');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-20 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 font-serif">
            {mode === 'login' ? 'Welcome Back' : 'Join Luminary'}
          </h1>
          <p className="text-stone-500 text-sm mt-2">
            {mode === 'login' ? 'Sign in to your tea account' : 'Create your account to start your tea journey'}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8">
          {/* Tabs */}
          <div className="flex bg-stone-100 rounded-xl p-1 mb-7">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all capitalize ${
                  mode === m ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-stone-600 text-sm font-medium mb-2">Full Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your full name"
                  className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm outline-none focus:border-amber-400 focus:bg-white transition-all"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-stone-600 text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm outline-none focus:border-amber-400 focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-stone-600 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm outline-none focus:border-amber-400 focus:bg-white transition-all pr-12"
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-stone-600 text-sm font-medium mb-2">Confirm Password</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm outline-none focus:border-amber-400 focus:bg-white transition-all"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-stone-900 hover:bg-amber-600 text-white font-bold rounded-xl transition-all text-sm mt-2"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-center text-stone-500 text-sm mt-6">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            {' '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-amber-600 font-semibold hover:text-amber-700 transition-colors"
            >
              {mode === 'login' ? 'Register' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
