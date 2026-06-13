import { useState } from 'react'

export default function OurStory() {
  const [showFull, setShowFull] = useState(false)

  if (showFull) return <FullStoryPage onBack={() => setShowFull(false)} />

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ost-section {
          background: #f5efe3;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }
        .ost-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 5rem 3rem;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 4rem;
          align-items: center;
        }
        @media (max-width: 768px) {
          .ost-inner { grid-template-columns: 1fr; padding: 3rem 1.5rem; gap: 2.5rem; }
        }
        .ost-eyebrow {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #8b6914;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }
        .ost-title {
          font-family: 'Archivo Black', Georgia, serif;
          font-size: clamp(36px, 5vw, 58px);
          font-weight: 900;
          color: #8b6914;
          line-height: 1.05;
          margin-bottom: 1.5rem;
          letter-spacing: -0.01em;
        }
        .ost-body {
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 400;
          color: #3a2e1e;
          line-height: 1.85;
          margin-bottom: 0.75rem;
          max-width: 540px;
        }
        .ost-body-gold {
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 300;
          color: #8b6914;
          line-height: 1.85;
          font-style: italic;
          margin-bottom: 2.25rem;
          max-width: 540px;
        }
        .ost-btn {
          display: inline-block;
          background: #8b6914;
          color: #f5efe3;
          font-family: 'Archivo Black', Georgia, serif;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 14px 30px;
          border: none;
          border-radius: 2px;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .ost-btn:hover { background: #6e5210; }
        .ost-right {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.85rem;
          min-width: 200px;
        }
        .ost-avatar {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #d4b87a;
          background: #e8dcc8;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ost-avatar img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
        .ost-sig {
          font-family: 'Archivo Black', Georgia, serif;
          font-size: 22px;
          font-weight: 900;
          color: #8b6914;
          line-height: 1;
          text-align: center;
          letter-spacing: 0.04em;
        }
        .ost-sig-line { width: 56px; height: 1px; background: #c9a84c; }
        .ost-founder-name {
          font-family: 'Archivo Black', Georgia, serif;
          font-size: 14px;
          font-weight: 900;
          color: #3a2e1e;
          text-align: center;
        }
        .ost-founder-role {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 300;
          color: #7a6a58;
          text-align: center;
          line-height: 1.55;
        }
      `}</style>

      <section className="ost-section">
        <div className="ost-inner">
          <div>
            <p className="ost-eyebrow">A Legacy of Pure Wellness</p>
            <h2 className="ost-title">Our Story</h2>
            <p className="ost-body">
              Seven Cups was founded on a vision to reimagine the everyday cup of tea as a luxurious
              wellness experience. We began crafting purposeful blends — each designed to address a
              specific modern need, from detoxification and relaxation to vitality, hormonal balance,
              and inner radiance.
            </p>
            <p className="ost-body-gold">
              "Seven Cups — Where Wellness Meets Every Cup." A quiet sanctuary in a world that
              never seems to slow down.
            </p>
            <button className="ost-btn" onClick={() => setShowFull(true)}>
              Read Our Entire Story
            </button>
          </div>

          <div className="ost-right">
            <div className="ost-avatar">
              {/* Replace with: <img src={founderImg} alt="Founder" /> */}
              <svg width="70" height="70" viewBox="0 0 70 70" fill="none">
                <circle cx="35" cy="28" r="14" fill="#b8932a" opacity="0.4" />
                <path d="M10 62c0-13.8 11.2-25 25-25s25 11.2 25 25" fill="#b8932a" opacity="0.4" />
              </svg>
            </div>
            <div className="ost-sig">S S Enterprise</div>
            <div className="ost-sig-line" />
            <p className="ost-founder-name">Founder, Seven Cups</p>
            <p className="ost-founder-role">West Bengal, India<br />Botanical Wellness Pioneer</p>
          </div>
        </div>
      </section>
    </>
  )
}

function FullStoryPage({ onBack }: { onBack: () => void }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .fs-page {
          background: #fdf6d3;
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Hero ── */
        .fs-hero {
          background: #1c1208;
          padding: 3rem 3rem 4rem;
          position: relative;
          overflow: hidden;
        }
        .fs-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 70% 50%, rgba(184,147,42,0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .fs-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #c9a84c;
          background: none;
          border: 1px solid rgba(201,168,76,0.3);
          border-radius: 6px;
          padding: 8px 16px;
          cursor: pointer;
          margin-bottom: 2.5rem;
          transition: border-color 0.2s, background 0.2s;
          letter-spacing: 0.04em;
        }
        .fs-back:hover { border-color: #c9a84c; background: rgba(201,168,76,0.08); }
        .fs-hero-eyebrow {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          color: #c9a84c;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .fs-hero-eyebrow::before {
          content: '';
          width: 28px; height: 1.5px;
          background: #c9a84c;
          border-radius: 99px;
        }
        .fs-hero-title {
          font-family: 'Archivo Black', Georgia, serif;
          font-size: clamp(32px, 5vw, 64px);
          font-weight: 900;
          color: #fdf6d3;
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin-bottom: 1.25rem;
          max-width: 700px;
        }
        .fs-hero-title span { color: #c9a84c; }
        .fs-hero-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 16px;
          font-weight: 300;
          color: #c8b890;
          line-height: 1.8;
          max-width: 560px;
        }

        /* ── Body content ── */
        .fs-body {
          max-width: 860px;
          margin: 0 auto;
          padding: 4rem 3rem 5rem;
        }
        @media (max-width: 640px) {
          .fs-hero { padding: 2rem 1.5rem 3rem; }
          .fs-body { padding: 2.5rem 1.5rem; }
          .fs-hero-title { font-size: 30px; }
        }

        /* ── Pull quote ── */
        .fs-pull-quote {
          border-left: 4px solid #b8932a;
          border-radius: 0 12px 12px 0;
          padding: 1.5rem 2rem;
          background: rgba(184,147,42,0.07);
          margin: 2.5rem 0;
        }
        .fs-pull-quote p {
          font-family: 'Archivo Black', Georgia, serif;
          font-size: clamp(17px, 2.5vw, 22px);
          font-weight: 900;
          color: #1c1208;
          line-height: 1.55;
          margin-bottom: 0.5rem;
        }
        .fs-pull-quote cite {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          color: #b8932a;
          font-style: normal;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        /* ── Sections ── */
        .fs-section { margin-bottom: 3rem; }
        .fs-section-label {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1rem;
        }
        .fs-section-num {
          font-family: 'Archivo Black', Georgia, serif;
          font-size: 11px;
          font-weight: 900;
          color: #b8932a;
          letter-spacing: 0.15em;
          background: rgba(184,147,42,0.1);
          border: 1px solid rgba(184,147,42,0.25);
          border-radius: 4px;
          padding: 3px 8px;
        }
        .fs-section-title {
          font-family: 'Archivo Black', Georgia, serif;
          font-size: 20px;
          font-weight: 900;
          color: #1c1208;
          letter-spacing: -0.01em;
        }
        .fs-section-divider {
          width: 100%;
          height: 1px;
          background: #e0cdb0;
          margin-bottom: 1.25rem;
        }
        .fs-para {
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 300;
          color: #4a3a28;
          line-height: 1.9;
          margin-bottom: 1rem;
        }
        .fs-para strong {
          font-weight: 600;
          color: #1c1208;
        }

        /* ── Philosophy cards ── */
        .fs-philosophy-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: #e0cdb0;
          border-radius: 14px;
          overflow: hidden;
          margin: 1.5rem 0;
        }
        @media (max-width: 560px) {
          .fs-philosophy-grid { grid-template-columns: 1fr; }
        }
        .fs-phil-card {
          background: #fffdf0;
          padding: 1.5rem;
        }
        .fs-phil-card-title {
          font-family: 'Archivo Black', Georgia, serif;
          font-size: 14px;
          font-weight: 900;
          color: #b8932a;
          margin-bottom: 0.5rem;
          letter-spacing: 0.02em;
        }
        .fs-phil-card-body {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 300;
          color: #6b5c46;
          line-height: 1.75;
        }

        /* ── Milestones ── */
        .fs-milestones {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: #e0cdb0;
          border-radius: 14px;
          overflow: hidden;
          margin: 2rem 0;
        }
        @media (max-width: 560px) {
          .fs-milestones { grid-template-columns: repeat(2, 1fr); }
        }
        .fs-mile {
          background: #fffdf0;
          padding: 1.5rem 1rem;
          text-align: center;
        }
        .fs-mile-val {
          font-family: 'Archivo Black', Georgia, serif;
          font-size: 32px;
          font-weight: 900;
          color: #b8932a;
          line-height: 1;
          margin-bottom: 6px;
        }
        .fs-mile-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 300;
          color: #7a6a58;
          line-height: 1.5;
        }

        /* ── Info card ── */
        .fs-info-card {
          background: #1c1208;
          border-radius: 14px;
          padding: 2rem 2.5rem;
          margin-top: 3rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        @media (max-width: 560px) {
          .fs-info-card { grid-template-columns: 1fr; padding: 1.5rem; }
        }
        .fs-info-title {
          font-family: 'Archivo Black', Georgia, serif;
          font-size: 18px;
          font-weight: 900;
          color: #fdf6d3;
          margin-bottom: 1.25rem;
          grid-column: 1 / -1;
        }
        .fs-info-group {}
        .fs-info-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 600;
          color: #c9a84c;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .fs-info-val {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 300;
          color: #c8b890;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        /* ── Badges ── */
        .fs-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin: 1.5rem 0;
        }
        .fs-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          font-family: 'Archivo Black', Georgia, serif;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.04em;
        }
      `}</style>

      <div className="fs-page">

        {/* Hero */}
        <div className="fs-hero">
          <button className="fs-back" onClick={onBack}>
            ← Back
          </button>
          <p className="fs-hero-eyebrow">Our Full Story</p>
          <h1 className="fs-hero-title">
            Where Wellness<br />Meets <span>Every Cup</span>
          </h1>
          <p className="fs-hero-sub">
            Seven Cups is a quiet sanctuary — born for people who believe every cup tells a story.
            In a world that never seems to slow down, we created Seven Cups as a reminder that the
            most meaningful transformations begin with the simplest daily rituals.
          </p>
        </div>

        {/* Body */}
        <div className="fs-body">

          {/* Pull quote */}
          <div className="fs-pull-quote">
            <p>"Modern life is full of long hours, digital overload, and restless schedules. Yet somewhere within all that noise, people still crave calm, connection, and care. That is precisely where Seven Cups steps in."</p>
            <cite>— Seven Cups, Brand Philosophy</cite>
          </div>

          {/* 01 Welcome */}
          <div className="fs-section">
            <div className="fs-section-label">
              <span className="fs-section-num">01</span>
              <span className="fs-section-title">Welcome to Seven Cups</span>
            </div>
            <div className="fs-section-divider" />
            <p className="fs-para">
              Welcome to Seven Cups — a tea brand born for people who believe every cup tells a story.
              We created Seven Cups as a <strong>quiet sanctuary</strong> — a reminder that the most meaningful
              transformations begin with the simplest daily rituals.
            </p>
            <p className="fs-para">
              Modern life is full of long hours, digital overload, and restless schedules. Yet somewhere
              within all that noise, people still crave calm, connection, and care. That is precisely
              where Seven Cups steps in.
            </p>
          </div>

          {/* 02 Our Story */}
          <div className="fs-section">
            <div className="fs-section-label">
              <span className="fs-section-num">02</span>
              <span className="fs-section-title">Our Story</span>
            </div>
            <div className="fs-section-divider" />
            <p className="fs-para">
              Seven Cups was founded on a vision to <strong>reimagine the everyday cup of tea</strong> as a
              luxurious wellness experience. Our founders noticed that today's generation wasn't just
              looking for a warm drink — they were searching for something more meaningful: something
              that nourished the body, soothed the mind, and honoured the age-old wisdom of nature.
            </p>
            <p className="fs-para">
              Inspired by the therapeutic power of natural herbs, botanicals, and ancient wellness
              traditions, we began crafting purposeful blends — each designed to address a specific
              modern need, from detoxification and relaxation to vitality, hormonal balance, and
              inner radiance.
            </p>

            <div className="fs-milestones">
              {[
                { val: '7', label: 'Purposeful wellness blends' },
                { val: '0', label: 'Artificial colours or allergens' },
                { val: '75g', label: 'Per pouch, sealed fresh' },
                { val: '∞', label: 'Cups of daily wellness' },
              ].map((m) => (
                <div key={m.val} className="fs-mile">
                  <div className="fs-mile-val">{m.val}</div>
                  <div className="fs-mile-label">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 03 Philosophy */}
          <div className="fs-section">
            <div className="fs-section-label">
              <span className="fs-section-num">03</span>
              <span className="fs-section-title">Our Philosophy</span>
            </div>
            <div className="fs-section-divider" />
            <p className="fs-para">
              At Seven Cups, we believe a healthy lifestyle begins with <strong>simple, beautiful daily habits</strong>.
              We carefully source premium tea leaves, herbs, spices, and botanical ingredients celebrated
              for their refreshing and health-supporting qualities.
            </p>
            <p className="fs-para">
              Every blend is thoughtfully imagined not just as a tea, but as a wellness ritual —
              something you look forward to, morning after morning.
            </p>

            <div className="fs-philosophy-grid">
              {[
                { title: 'Ancient Wisdom', body: 'Every ingredient is rooted in centuries of Ayurvedic and botanical tradition — Haritaki, Saffron, Chamomile, Blue Pea Flower, and more.' },
                { title: 'Modern Purpose', body: 'Each blend is crafted for a specific contemporary need — liver detox, energy, hormonal balance, skin health, stress relief, and more.' },
                { title: 'Pure & Honest', body: 'No artificial colours. No allergens. No shortcuts. Zero calories. What you see is what you get — nature, nothing else.' },
                { title: 'Sealed Fresh', body: 'Every 75g pouch includes a moisture and oxygen absorber. Resealable. Stored best in a cool, dry place. Fresh from our hands to your cup.' },
              ].map((c) => (
                <div key={c.title} className="fs-phil-card">
                  <p className="fs-phil-card-title">{c.title}</p>
                  <p className="fs-phil-card-body">{c.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 04 Promise */}
          <div className="fs-section">
            <div className="fs-section-label">
              <span className="fs-section-num">04</span>
              <span className="fs-section-title">Our Promise to You</span>
            </div>
            <div className="fs-section-divider" />
            <p className="fs-para">
              With elegant packaging, mindfully curated ingredients, and flavours crafted for
              contemporary wellness needs, Seven Cups is where <strong>ancient botanical wisdom meets
              modern living</strong>. We make healthy feel effortless, indulgent, and truly worth
              savouring — one cup at a time.
            </p>

            <div className="fs-badges">
              {[
                { label: 'No Allergen', bg: '#f0faf0', color: '#1c5c1c' },
                { label: 'No Artificial Colours', bg: '#fff8e1', color: '#7a5c00' },
                { label: 'Zero Calories', bg: '#e8f4f8', color: '#0a4a6e' },
                { label: 'Made in India', bg: '#fff3e0', color: '#7a3500' },
                { label: 'Sealed Fresh', bg: '#f3e8ff', color: '#5b1f8a' },
              ].map((b) => (
                <span key={b.label} className="fs-badge" style={{ background: b.bg, color: b.color }}>
                  ✓ {b.label}
                </span>
              ))}
            </div>
          </div>

          {/* Company info card */}
          <div className="fs-info-card">
            <p className="fs-info-title">Get in Touch with Seven Cups</p>
            <div className="fs-info-group">
              <p className="fs-info-label">Email</p>
              <p className="fs-info-val">sevencupsofficial@gmail.com</p>
              <p className="fs-info-label">Phone</p>
              <p className="fs-info-val">+91 7980505146</p>
              <p className="fs-info-label">Instagram</p>
              <p className="fs-info-val">@sevencups_official</p>
            </div>
            <div className="fs-info-group">
              <p className="fs-info-label">Manufactured By</p>
              <p className="fs-info-val">S S Enterprise<br />100, Dewangazi Road<br />Bally – Howrah, West Bengal 711201<br />India</p>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}