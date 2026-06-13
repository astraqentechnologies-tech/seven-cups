import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import farmerImg from '../assets/img1.jpg'

const FEATURES = [
  {
    id: 1,
    icon: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
        <path d="M20 6C14 10 8 15 8 22a12 12 0 0024 0c0-7-6-12-12-16z" fill="#fdf3e7" stroke="#b8932a" strokeWidth="1.8"/>
        <path d="M20 34V20" stroke="#b8932a" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M20 26c0 0 4-4 6-7" stroke="#b8932a" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M20 22c0 0-3-3-5-5" stroke="#b8932a" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Premium Botanicals, Purposefully Blended',
    body: 'Every Seven Cups blend is crafted from carefully sourced herbs, spices, and botanical ingredients — Haritaki, Saffron, Blue Pea Flower, Chamomile, Lavender, and more — each chosen for their proven wellness benefits.',
  },
  {
    id: 2,
    icon: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
        <circle cx="20" cy="20" r="13" fill="#fdf3e7" stroke="#b8932a" strokeWidth="1.8"/>
        <path d="M14 20l4 4 8-8" stroke="#b8932a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'No Allergen. No Artificial Colours. Always.',
    body: 'We believe wellness should be pure and honest. Every Seven Cups blend is completely free from artificial colours, allergens, and unnecessary additives — just nature, nothing else.',
  },
  {
    id: 3,
    icon: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
        <rect x="8" y="10" width="24" height="20" rx="3" fill="#fdf3e7" stroke="#b8932a" strokeWidth="1.8"/>
        <path d="M14 10V8a6 6 0 0112 0v2" stroke="#b8932a" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="20" cy="22" r="3" fill="#b8932a"/>
        <path d="M20 25v3" stroke="#b8932a" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Sealed Fresh. Delivered Safe.',
    body: 'Each 75g pouch includes a moisture and oxygen absorber to lock in freshness. Resealable, stored best in a cool dry place — every cup tastes as fresh as the first.',
  },
  {
    id: 4,
    icon: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
        <path d="M10 32l4-8 6 4 6-10 4 6" stroke="#b8932a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="20" cy="14" r="6" fill="#fdf3e7" stroke="#b8932a" strokeWidth="1.8"/>
        <path d="M17 14l2 2 4-4" stroke="#b8932a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Crafted for Modern Wellness Needs',
    body: 'From liver detox and energy boost to hormonal balance, skin health, and stress relief — Seven Cups offers 7 purposeful blends, each addressing a specific modern lifestyle need.',
  },
  {
    id: 5,
    icon: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
        <path d="M20 8l2.5 7.5H30l-6.5 4.5 2.5 7.5L20 23l-6 4.5 2.5-7.5L10 15.5h7.5z" fill="#fdf3e7" stroke="#b8932a" strokeWidth="1.8" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Made in India. Made with Pride.',
    body: 'Packed and manufactured in West Bengal by S S Enterprise, Seven Cups celebrates India\'s rich botanical heritage — bringing ancient wellness wisdom to every modern cup.',
  },
]

const BADGES = [
  {
    label: 'No Allergen',
    sub: 'Certified Safe',
    bg: '#f0faf0',
    textColor: '#1c5c1c',
    icon: (
      <svg viewBox="0 0 36 36" fill="none" width="26" height="26">
        <circle cx="18" cy="18" r="13" stroke="#2e7d32" strokeWidth="2" fill="#e8f5e9"/>
        <path d="M12 18l4 4 8-8" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'No Artificial Colours',
    sub: '100% Natural',
    bg: '#fff8e1',
    textColor: '#7a5c00',
    icon: (
      <svg viewBox="0 0 36 36" fill="none" width="26" height="26">
        <circle cx="18" cy="18" r="13" stroke="#f9a825" strokeWidth="2" fill="#fff9e6"/>
        <path d="M18 10v8l5 3" stroke="#f9a825" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Zero Calories',
    sub: 'Pure Wellness',
    bg: '#e8f4f8',
    textColor: '#0a4a6e',
    icon: (
      <svg viewBox="0 0 36 36" fill="none" width="26" height="26">
        <circle cx="18" cy="18" r="13" stroke="#1565c0" strokeWidth="2" fill="#e3f2fd"/>
        <path d="M14 18c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" stroke="#1565c0" strokeWidth="1.5"/>
        <path d="M12 12l12 12" stroke="#1565c0" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Made in India',
    sub: 'West Bengal',
    bg: '#fff3e0',
    textColor: '#7a3500',
    icon: (
      <svg viewBox="0 0 36 36" fill="none" width="26" height="26">
        <circle cx="18" cy="18" r="13" stroke="#e65100" strokeWidth="2" fill="#fff3e0"/>
        <circle cx="18" cy="18" r="4" stroke="#1565c0" strokeWidth="1.5"/>
        <path d="M18 8v3M18 25v3M8 18h3M25 18h3" stroke="#e65100" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function WhyChooseUs() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section
      ref={ref}
      style={{
        background: '#fdf6d3',
        fontFamily: "'DM Sans', ui-sans-serif, system-ui, sans-serif",
        overflow: 'hidden',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Section wrapper ── */
        .wcu-section-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 5rem 2.5rem;
        }

        /* ── Centered top header ── */
        .wcu-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        .wcu-eyebrow {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          color: #b8932a;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 0.6rem;
        }
        .wcu-eyebrow::before,
        .wcu-eyebrow::after {
          content: '';
          width: 28px;
          height: 1.5px;
          background: #b8932a;
          border-radius: 999px;
          display: inline-block;
        }
        .wcu-title {
          font-family: 'Archivo Black', Georgia, serif;
          font-size: clamp(28px, 3.8vw, 46px);
          font-weight: 900;
          color: #1d662f;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 0.75rem;
        }
        .wcu-title span { color: #b8932a; }
        .wcu-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 300;
          color: #7a6a58;
          line-height: 1.75;
          max-width: 520px;
          margin: 0 auto;
        }

        /* ── Two-column body ── */
        .wcu-body {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 3rem;
          align-items: start;
        }
        @media (max-width: 900px) {
          .wcu-body {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .wcu-image-col {
            display: flex;
            justify-content: center;
          }
        }

        /* ── Arch image ── */
        .wcu-arch {
          width: 100%;
          max-width: 300px;
          aspect-ratio: 4 / 5;
          border-radius: 9999px 9999px 0 0;
          overflow: hidden;
          position: relative;
          box-shadow: 0 20px 56px rgba(180, 147, 42, 0.16);
        }
        .wcu-arch img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
        }
        .wcu-arch-tag {
          position: absolute;
          bottom: 18px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(253, 246, 211, 0.92);
          border: 1px solid #e0cdb0;
          border-radius: 999px;
          padding: 5px 18px;
          font-family: 'Archivo Black', Georgia, serif;
          font-size: 12px;
          font-weight: 900;
          color: #b8932a;
          letter-spacing: 0.08em;
          white-space: nowrap;
          backdrop-filter: blur(4px);
        }

        /* ── Feature list ── */
        .wcu-features {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .wcu-feature {
          display: grid;
          grid-template-columns: 44px 1fr;
          gap: 0.9rem;
          align-items: start;
          padding: 0.9rem 1rem;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid #ede0c8;
          transition: background 0.2s ease, border-color 0.2s ease;
          cursor: default;
        }
        .wcu-feature:hover {
          background: rgba(255, 255, 255, 0.88);
          border-color: #d9c09a;
        }
        .wcu-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: #fff7ed;
          border: 1px solid #f0d4aa;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .wcu-feature-title {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #1c1208;
          margin-bottom: 3px;
          line-height: 1.3;
        }
        .wcu-feature-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 300;
          color: #6b5c46;
          line-height: 1.65;
        }

        /* ── Badges ── */
        .wcu-divider {
          border: none;
          border-top: 1px solid #e0cdb0;
          margin: 1.25rem 0 1rem;
        }
        .wcu-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .wcu-badge {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 6px 12px;
          border-radius: 9px;
          border: 1px solid rgba(0, 0, 0, 0.07);
          transition: transform 0.2s ease;
        }
        .wcu-badge:hover { transform: translateY(-2px); }
        .wcu-badge-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 700;
          line-height: 1.2;
          display: block;
        }
        .wcu-badge-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 400;
          opacity: 0.6;
          display: block;
          line-height: 1.2;
        }

        @media (max-width: 480px) {
          .wcu-section-inner { padding: 3rem 1.25rem; }
          .wcu-title { font-size: 26px; }
          .wcu-feature { padding: 0.75rem; }
        }
      `}</style>

      <div className="wcu-section-inner">

        {/* ── Centered header ── */}
        <motion.div
          className="wcu-header"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h2 className="wcu-title">
            We Care For Every Cup<br />
          </h2>
          
        </motion.div>

        {/* ── Two-column body ── */}
        <div className="wcu-body">

          {/* Left: Arch image */}
          <motion.div
            className="wcu-image-col"
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          >
            <div className="wcu-arch">
              <img src={farmerImg} alt="Seven Cups — Where Wellness Meets Every Cup" />
              <div className="wcu-arch-tag">Seven Cups</div>
            </div>
          </motion.div>

          {/* Right: Features + badges */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          >
            <div className="wcu-features">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.id}
                  className="wcu-feature"
                  initial={{ opacity: 0, y: 10 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.35, delay: 0.2 + i * 0.07, ease: 'easeOut' }}
                >
                  <div className="wcu-icon-wrap">{f.icon}</div>
                  <div>
                    <p className="wcu-feature-title">{f.title}</p>
                    <p className="wcu-feature-text">{f.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <hr className="wcu-divider" />
              <div className="wcu-badges">
                {BADGES.map((b) => (
                  <div key={b.label} className="wcu-badge" style={{ background: b.bg }}>
                    {b.icon}
                    <div>
                      <span className="wcu-badge-label" style={{ color: b.textColor }}>{b.label}</span>
                      <span className="wcu-badge-sub" style={{ color: b.textColor }}>{b.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}