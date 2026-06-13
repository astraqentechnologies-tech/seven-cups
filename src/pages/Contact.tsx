import { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send, Clock } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`${API_BASE_URL}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form)
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-20">
      {/* Header */}
      <div className="relative bg-stone-900 overflow-hidden py-20">
        <img src="https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg" alt="Contact" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="text-amber-400 text-sm font-medium tracking-widest uppercase">Get In Touch</span>
          <h1 className="text-5xl font-bold text-white font-serif mt-3 mb-4">We'd Love to Hear From You</h1>
          <p className="text-stone-300 text-lg max-w-xl mx-auto">Whether you have a question about our teas, need a recommendation, or simply want to chat about your next brew — we're here.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-stone-900 font-serif mb-2">Contact Information</h2>
              <p className="text-stone-500 text-sm leading-relaxed">Our team of tea experts is ready to assist you.</p>
            </div>

            {[
              { icon: Mail, label: 'Email Us', value: 'hello@luminarytea.com', sub: 'We reply within 24 hours' },
              { icon: Phone, label: 'Call Us', value: '+1 (555) 234-5678', sub: 'Mon–Fri, 9am–6pm PST' },
              { icon: MapPin, label: 'Visit Us', value: '42 Garden Lane', sub: 'San Francisco, CA 94102' },
              { icon: Clock, label: 'Business Hours', value: 'Mon–Fri: 9am–6pm', sub: 'Sat: 10am–4pm PST' },
            ].map((info, i) => (
              <div key={i} className="flex items-start gap-4 bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
                <div className="w-11 h-11 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                  <info.icon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-stone-500 text-xs uppercase tracking-wide font-medium mb-0.5">{info.label}</p>
                  <p className="text-stone-900 font-semibold text-sm">{info.value}</p>
                  <p className="text-stone-400 text-xs mt-0.5">{info.sub}</p>
                </div>
              </div>
            ))}

            <a
              href="https://wa.me/15552345678"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-4 rounded-2xl font-semibold transition-all w-full justify-center shadow-lg shadow-emerald-500/20"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </a>

            <div>
              <p className="text-stone-500 text-xs uppercase tracking-wide font-medium mb-3">Follow Our Journey</p>
              <div className="flex gap-3">
                {['Instagram', 'Facebook', 'Twitter'].map(s => (
                  <a key={s} href="#" className="px-4 py-2 bg-white border border-stone-200 rounded-full text-xs font-medium text-stone-600 hover:border-amber-400 hover:text-amber-600 transition-all">
                    {s}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 md:p-10">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Send className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-stone-900 font-serif mb-3">Message Sent!</h3>
                  <p className="text-stone-500 leading-relaxed">Thank you for reaching out. Our tea specialists will get back to you within 24 hours.</p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-stone-900 font-serif mb-7">Send Us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-stone-600 text-sm font-medium mb-2">Full Name *</label>
                        <input
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="Elena Chen"
                          className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm outline-none focus:border-amber-400 focus:bg-white transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-stone-600 text-sm font-medium mb-2">Email Address *</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          placeholder="you@example.com"
                          className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm outline-none focus:border-amber-400 focus:bg-white transition-all"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-stone-600 text-sm font-medium mb-2">Phone (optional)</label>
                        <input
                          value={form.phone}
                          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                          placeholder="+1 555 000 0000"
                          className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm outline-none focus:border-amber-400 focus:bg-white transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-600 text-sm font-medium mb-2">Subject</label>
                        <select
                          value={form.subject}
                          onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                          className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm outline-none focus:border-amber-400 focus:bg-white transition-all appearance-none"
                        >
                          <option value="">Select a topic</option>
                          <option>Product Inquiry</option>
                          <option>Order Support</option>
                          <option>Wholesale / Trade</option>
                          <option>Tea Recommendation</option>
                          <option>Feedback</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-stone-600 text-sm font-medium mb-2">Message *</label>
                      <textarea
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        placeholder="Tell us about your inquiry, or ask for a tea recommendation..."
                        rows={6}
                        className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm outline-none focus:border-amber-400 focus:bg-white transition-all resize-none"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-stone-900 hover:bg-amber-600 text-white font-bold rounded-xl transition-all text-sm"
                    >
                      <Send className="w-4 h-4" />
                      {submitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Map placeholder */}
        <div className="mt-16 bg-white rounded-3xl border border-stone-100 overflow-hidden shadow-sm h-72 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <p className="text-stone-600 font-semibold">42 Garden Lane, San Francisco, CA 94102</p>
            <p className="text-stone-400 text-sm mt-1">Near Union Square, open Mon–Sat</p>
          </div>
        </div>
      </div>
    </div>
  );
}