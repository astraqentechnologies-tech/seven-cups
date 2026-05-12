import { Leaf, Heart, Globe, Award, ArrowRight } from 'lucide-react';

type Props = {
  onNavigate: (page: string) => void;
};

const timeline = [
  { year: '2018', title: 'The First Journey', desc: 'Our founder, Elena Chen, traveled to Darjeeling on a sabbatical and discovered the transformative power of first-flush teas.' },
  { year: '2019', title: 'The First Harvest', desc: 'Sourced our first 50 kilograms of Silver Needle white tea from a family garden in Fujian Province, China.' },
  { year: '2020', title: 'Opening Online', desc: 'Luminary Fine Teas launched online, connecting tea enthusiasts across North America with exceptional single-origin teas.' },
  { year: '2022', title: 'Expanding Origins', desc: 'Added partnerships with gardens in Japan, Sri Lanka, and Nepal — growing our collection to 30+ varieties.' },
  { year: '2024', title: 'Certified Organic', desc: 'Achieved full organic certification across our premium and wellness lines, reflecting our commitment to purity.' },
  { year: '2026', title: 'A Community of 25,000', desc: 'Today, the Luminary Tea Circle spans 50+ countries. Every cup connects us to something larger than ourselves.' },
];

export default function About({ onNavigate }: Props) {
  return (
    <div className="min-h-screen bg-stone-50 pt-20">
      {/* Hero */}
      <div className="relative overflow-hidden bg-stone-900 py-28">
        <img src="https://images.pexels.com/photos/227908/pexels-photo-227908.jpeg" alt="Tea garden" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 to-transparent" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="text-amber-400 text-sm font-medium tracking-widest uppercase">Our Story</span>
          <h1 className="text-5xl md:text-7xl font-bold text-white font-serif mt-4 mb-6 leading-tight">
            A Love Letter to Tea
          </h1>
          <p className="text-stone-200 text-xl leading-relaxed max-w-2xl mx-auto">
            Luminary was born from a single moment of clarity, standing in a fog-covered Darjeeling garden at dawn, cup in hand, and understanding that tea is one of life's greatest gifts.
          </p>
        </div>
      </div>

      {/* Founder */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-amber-600 text-sm font-medium tracking-widest uppercase">Founder's Message</span>
              <h2 className="text-4xl font-bold text-stone-900 font-serif mt-2 mb-6 leading-tight">
                "I wanted to share the teas that changed how I see the world."
              </h2>
              <p className="text-stone-600 leading-relaxed mb-5">
                My journey began not in a boardroom, but in a small tea house in Wuyishan, China, where an 80-year-old tea master poured me a cup of aged Da Hong Pao with trembling hands and said, "This tea has been here longer than I have."
              </p>
              <p className="text-stone-600 leading-relaxed mb-8">
                I left that day with a new understanding of patience, craftsmanship, and the profound connection between land, climate, and flavor. Luminary exists to honor those values — and to bring the world's finest teas to people who appreciate them.
              </p>
              <div className="flex items-center gap-4">
                <img src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg" alt="Elena Chen" className="w-14 h-14 rounded-full object-cover border-2 border-amber-300" />
                <div>
                  <p className="font-bold text-stone-900">Elena Chen</p>
                  <p className="text-stone-500 text-sm">Founder & Chief Tea Officer</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img src="https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg" alt="Tea sourcing" className="w-full h-[500px] object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-amber-500 rounded-2xl p-6 shadow-xl w-44">
                <p className="text-stone-900 text-4xl font-bold font-serif">8+</p>
                <p className="text-stone-800 text-sm font-medium mt-1">Years Sourcing Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-amber-600 text-sm font-medium tracking-widest uppercase">What Drives Us</span>
            <h2 className="text-4xl font-bold text-stone-900 font-serif mt-2">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Leaf, title: 'Provenance', desc: 'We know the name of every garden, every farmer, and every harvest date. Tea should have a story.', color: 'bg-emerald-100 text-emerald-600' },
              { icon: Heart, title: 'Care', desc: 'Every tea is handled with the reverence it deserves — from picking through packaging and to your cup.', color: 'bg-red-100 text-red-500' },
              { icon: Globe, title: 'Sustainability', desc: 'We partner with gardens committed to ecological farming, fair wages, and long-term land stewardship.', color: 'bg-blue-100 text-blue-600' },
              { icon: Award, title: 'Excellence', desc: 'We select fewer than 3% of teas we taste. Quality is non-negotiable.', color: 'bg-amber-100 text-amber-600' },
            ].map((v, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-stone-100 shadow-sm text-center hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 ${v.color} rounded-full flex items-center justify-center mx-auto mb-5`}>
                  <v.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-stone-900 text-lg font-serif mb-3">{v.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sourcing */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="grid grid-cols-2 gap-4">
              <img src="https://images.pexels.com/photos/3887985/pexels-photo-3887985.jpeg" alt="Japan" className="rounded-2xl h-56 w-full object-cover" />
              <img src="https://images.pexels.com/photos/236525/pexels-photo-236525.jpeg" alt="India" className="rounded-2xl h-56 w-full object-cover mt-8" />
              <img src="https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg" alt="Herbal" className="rounded-2xl h-56 w-full object-cover -mt-8" />
              <img src="https://images.pexels.com/photos/734983/pexels-photo-734983.jpeg" alt="Premium" className="rounded-2xl h-56 w-full object-cover" />
            </div>
            <div>
              <span className="text-amber-600 text-sm font-medium tracking-widest uppercase">How We Source</span>
              <h2 className="text-4xl font-bold text-stone-900 font-serif mt-2 mb-6 leading-tight">
                From Ancient Gardens to Your Cup
              </h2>
              <div className="space-y-5">
                {[
                  { num: '01', title: 'Garden Selection', desc: 'We visit each partner garden personally, evaluating soil, elevation, microclimate, and farming practices.' },
                  { num: '02', title: 'Harvest Approval', desc: 'Our team approves each harvest based on visual, olfactory, and taste evaluations before any purchase.' },
                  { num: '03', title: 'Expert Processing', desc: 'We respect the traditional processing methods of each tea type and region.' },
                  { num: '04', title: 'Freshness-Sealed', desc: 'Teas are vacuum-sealed within 48 hours of processing and air-freighted to maintain peak freshness.' },
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-amber-500 font-bold text-2xl font-serif shrink-0 w-10">{step.num}</span>
                    <div>
                      <h4 className="text-stone-900 font-bold mb-1">{step.title}</h4>
                      <p className="text-stone-500 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-stone-900">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-amber-400 text-sm font-medium tracking-widest uppercase">Our Journey</span>
            <h2 className="text-4xl font-bold text-white font-serif mt-2">The Luminary Story</h2>
          </div>
          <div className="relative">
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-stone-700" />
            <div className="space-y-12">
              {timeline.map((item, i) => (
                <div key={i} className={`relative flex items-start gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="w-16 shrink-0 md:w-1/2 md:flex md:justify-end">
                    <div className={`hidden md:block max-w-sm ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                      <p className="text-amber-400 font-bold text-2xl font-serif mb-1">{item.year}</p>
                      <h4 className="text-white font-bold text-lg mb-2">{item.title}</h4>
                      <p className="text-stone-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  <div className="absolute left-5 md:left-1/2 md:-translate-x-1/2 w-7 h-7 bg-amber-500 rounded-full border-4 border-stone-900 z-10" />
                  <div className="ml-12 md:ml-0 md:w-1/2 md:pl-8">
                    <div className="md:hidden">
                      <p className="text-amber-400 font-bold text-xl font-serif mb-1">{item.year}</p>
                      <h4 className="text-white font-bold mb-1">{item.title}</h4>
                      <p className="text-stone-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                    <div className={`hidden md:block max-w-sm ${i % 2 !== 0 ? 'text-left' : ''}`}>
                      <p className="text-amber-400 font-bold text-2xl font-serif mb-1">{item.year}</p>
                      <h4 className="text-white font-bold text-lg mb-2">{item.title}</h4>
                      <p className="text-stone-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-amber-50 border-y border-amber-100">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-stone-900 font-serif mb-4">Ready to Begin Your Journey?</h2>
          <p className="text-stone-500 leading-relaxed mb-8">Join 25,000 tea lovers who have discovered their perfect cup.</p>
          <button
            onClick={() => onNavigate('products')}
            className="inline-flex items-center gap-2 px-10 py-4 bg-stone-900 hover:bg-amber-600 text-white font-bold rounded-full transition-all hover:scale-105"
          >
            Explore Our Teas <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
