import { useState } from 'react';
import { User, Package, Settings, Save, CreditCard as Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

type Props = {
  onNavigate: (page: string) => void;
};

export default function Account({ onNavigate }: Props) {
  const { user, profile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    country: profile?.country || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-500 mb-4">Please sign in to view your account.</p>
          <button onClick={() => onNavigate('auth')} className="px-6 py-3 bg-stone-900 text-white font-bold rounded-full hover:bg-amber-600 transition-all">Sign In</button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('profiles').update(form).eq('id', user.id);
    await refreshProfile();
    setSaved(true);
    setEditing(false);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-20">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-stone-900 font-serif">{profile?.full_name || 'My Account'}</h1>
            <p className="text-stone-500 text-sm">{profile?.email}</p>
          </div>
        </div>

        {/* Nav tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { icon: User, label: 'Profile', page: 'account' },
            { icon: Package, label: 'My Orders', page: 'orders' },
            { icon: Settings, label: 'Settings', page: 'account' },
          ].map((tab, i) => (
            <button
              key={i}
              onClick={() => tab.page !== 'account' && onNavigate(tab.page)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                i === 0 ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-400 hover:text-amber-700'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-7">
            <h2 className="text-xl font-bold text-stone-900 font-serif">Personal Information</h2>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-600 bg-amber-50 rounded-full hover:bg-amber-100 transition-colors">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
            ) : null}
          </div>

          {saved && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm mb-5">
              Profile updated successfully!
            </div>
          )}

          {editing ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  { label: 'Full Name', key: 'full_name', placeholder: 'Your full name' },
                  { label: 'Phone', key: 'phone', placeholder: '+1 555 000 0000' },
                  { label: 'Street Address', key: 'address', placeholder: '123 Garden St', span: 2 },
                  { label: 'City', key: 'city', placeholder: 'San Francisco' },
                  { label: 'Country', key: 'country', placeholder: 'United States' },
                ].map(field => (
                  <div key={field.key} className={field.span === 2 ? 'sm:col-span-2' : ''}>
                    <label className="block text-stone-600 text-sm font-medium mb-2">{field.label}</label>
                    <input
                      value={(form as Record<string, string>)[field.key]}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm outline-none focus:border-amber-400 focus:bg-white transition-all"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-amber-600 text-white font-semibold rounded-full text-sm transition-all">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setEditing(false)} className="px-6 py-3 border border-stone-200 text-stone-600 font-semibold rounded-full text-sm hover:border-stone-300 transition-all">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: 'Full Name', value: profile?.full_name || '—' },
                { label: 'Email', value: profile?.email || '—' },
                { label: 'Phone', value: profile?.phone || '—' },
                { label: 'City', value: profile?.city || '—' },
                { label: 'Address', value: profile?.address || '—', span: true },
                { label: 'Country', value: profile?.country || '—' },
                { label: 'Member Since', value: new Date(profile?.created_at || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) },
              ].map((field, i) => (
                <div key={i} className={field.span ? 'sm:col-span-2' : ''}>
                  <p className="text-stone-400 text-xs uppercase tracking-wide font-medium mb-1">{field.label}</p>
                  <p className="text-stone-800 font-medium">{field.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
