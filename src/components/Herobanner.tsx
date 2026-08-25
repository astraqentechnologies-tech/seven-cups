import { useEffect, useRef, useState, useCallback } from "react";

export interface HeroBannerSlide {
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  tag?: string;
  accent: string;
  accentRgb?: string;
}

export const defaultHeroSlides: HeroBannerSlide[] = [
  {
    title: "Experience Cinematic\nWellness",
    subtitle: "Discover the tranquil power of Body Reset Blue Tea.",
    cta: "Shop Now",
    tag: "Seven Cups",
    image: "https://res.cloudinary.com/dweyshxeh/image/upload/v1783576868/WhatsApp_Image_2026-07-02_at_20.47.11_hzhytp.jpg",
    accent: "from-stone-900/80 via-stone-900/50 to-transparent",
    accentRgb: "180,83,9",
  },
  {
    title: "Elevate Your\nDaily Ritual",
    subtitle: "Sourced from ancient gardens, crafted with centuries of wisdom.",
    cta: "Explore Collection",
    tag: "Seven Cups",
    image: "https://res.cloudinary.com/dweyshxeh/image/upload/v1783576867/WhatsApp_Image_2026-07-02_at_20.47.11_1_bycttp.jpg",
    accent: "from-stone-900/80 via-stone-900/50 to-transparent",
    accentRgb: "180,83,9",
  },
  {
    title: "Pure. Natural.\nAuthentic.",
    subtitle: "Sourced from ancient gardens, crafted with centuries of wisdom.",
    cta: "Explore Collection",
    tag: "Seven Cups",
    image: "https://res.cloudinary.com/dweyshxeh/image/upload/v1783576867/WhatsApp_Image_2026-07-02_at_20.47.13_zmdyim.jpg",
    accent: "from-stone-900/80 via-stone-900/50 to-transparent",
    accentRgb: "180,83,9",
  },
  {
    title: "A Cup of\nSerenity",
    subtitle: "Sourced from ancient gardens, crafted with centuries of wisdom.",
    cta: "Explore Collection",
    tag: "Seven Cups",
    image: "https://res.cloudinary.com/dweyshxeh/image/upload/v1783576867/WhatsApp_Image_2026-07-02_at_20.47.14_w6j9ai.jpg",
    accent: "from-stone-900/80 via-stone-900/50 to-transparent",
    accentRgb: "180,83,9",
  },
  {
    title: "Wellness in\nEvery Sip",
    subtitle: "Sourced from ancient gardens, crafted with centuries of wisdom.",
    cta: "Explore Collection",
    tag: "Seven Cups",
    image: "https://res.cloudinary.com/dweyshxeh/image/upload/v1783576867/WhatsApp_Image_2026-07-02_at_20.47.14_1_kweuls.jpg",
    accent: "from-stone-900/80 via-stone-900/50 to-transparent",
    accentRgb: "180,83,9",
  },
  {
    title: "Ancient Wisdom\nModern Wellness",
    subtitle: "Sourced from ancient gardens, crafted with centuries of wisdom.",
    cta: "Explore Collection",
    tag: "Seven Cups",
    image: "https://res.cloudinary.com/dweyshxeh/image/upload/v1783576867/WhatsApp_Image_2026-07-02_at_20.47.15_uy0gyb.jpg",
    accent: "from-stone-900/80 via-stone-900/50 to-transparent",
    accentRgb: "180,83,9",
  },
  {
    title: "Taste the\nDifference",
    subtitle: "Sourced from ancient gardens, crafted with centuries of wisdom.",
    cta: "Explore Collection",
    tag: "Seven Cups",
    image: "https://res.cloudinary.com/dweyshxeh/image/upload/v1783576867/WhatsApp_Image_2026-07-02_at_20.47.14_2_qzbio3.jpg",
    accent: "from-stone-900/80 via-stone-900/50 to-transparent",
    accentRgb: "180,83,9",
  },
];

interface HeroBannerProps {
  slides?: HeroBannerSlide[];
  autoPlayMs?: number;
}

function HeroBanner({ slides = defaultHeroSlides, autoPlayMs = 5500 }: HeroBannerProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const startAuto = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveIdx((i) => {
        setPrevIdx(i);
        return (i + 1) % slides.length;
      });
    }, autoPlayMs);
  }, [slides.length, autoPlayMs]);

  useEffect(() => {
    startAuto();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startAuto]);

  const goTo = (n: number) => {
    const next = (n + slides.length) % slides.length;
    setPrevIdx(activeIdx);
    setActiveIdx(next);
    startAuto();
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      diff > 0 ? goTo(activeIdx + 1) : goTo(activeIdx - 1);
    }
  };

  return (
    /* Outer wrapper — horizontal padding gives the Blue Tea side gap */
    <div className="w-full px-3 sm:px-4 py-2">
      <div
        className="relative w-full overflow-hidden"
        style={{
          /* 3.2:1 aspect ratio — same as Blue Tea banner */
          aspectRatio: "3.2 / 1",
          borderRadius: "14px",
          background: "#0a0a14",
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* ── Images with CSS cross-fade ── */}
        {slides.map((s, i) => (
          <img
            key={i}
            src={s.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{
              borderRadius: "14px",
              opacity: i === activeIdx ? 1 : 0,
              transition: "opacity 0.8s ease",
              zIndex: i === activeIdx ? 2 : 1,
            }}
          />
        ))}

        {/* ── Dot indicators — bottom center, minimal ── */}
        <div
          className="absolute bottom-2.5 left-1/2 z-10 flex gap-1.5 items-center"
          style={{ transform: "translateX(-50%)" }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Slide ${i + 1}`}
              onClick={() => goTo(i)}
              style={{
                width: i === activeIdx ? 22 : 6,
                height: 5,
                borderRadius: 999,
                background: i === activeIdx ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.35)",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "width 0.3s ease, background 0.3s ease",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default HeroBanner;