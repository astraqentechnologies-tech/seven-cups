import {
  motion,
  AnimatePresence,
} from "motion/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

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

function SlideImage({ slide, active }: { slide: HeroBannerSlide; active: boolean }) {
  return (
    <div
      className="absolute inset-0 transition-opacity duration-1000"
      style={{ opacity: active ? 1 : 0, zIndex: active ? 2 : 1 }}
    >
      <img
        src={slide.image}
        alt=""
        className="w-full h-full object-cover"
        style={{ objectPosition: "center center" }}
      />
    </div>
  );
}

function HeroBanner({ slides = defaultHeroSlides, autoPlayMs = 5500 }: HeroBannerProps) {
  const navigate = useNavigate();
  const [activeIdx, setActiveIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const startAuto = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(
      () => setActiveIdx((i) => (i + 1) % slides.length),
      autoPlayMs
    );
  }, [slides.length, autoPlayMs]);

  useEffect(() => {
    startAuto();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startAuto]);

  const goTo = (n: number) => {
    setActiveIdx((n + slides.length) % slides.length);
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

  const slide = slides[activeIdx];
  const accentRgb = slide.accentRgb ?? "180,83,9";

  return (
    <section
  className="relative w-full overflow-hidden bg-stone-950"
  style={{
   height: "46vw",        // mobile pe width ka 56% = landscape ratio maintain
  maxHeight: "500px",
  minHeight: "200px",
  }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Background images ── */}
      {slides.map((s, i) => (
        <SlideImage key={i} slide={s} active={i === activeIdx} />
      ))}

      {/* ── Left-to-right dark gradient ── */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.10) 100%)" }}
      />
      {/* ── Bottom dark gradient ── */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)" }}
      />

      {/* ── Content ── */}
      <div className="absolute inset-0 z-30 flex flex-col justify-center pb-10 px-4 sm:px-8 md:px-16 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            className="flex flex-col gap-2 sm:gap-3 max-w-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* tag pill */}
            {/* {slide.tag && (
              <span
                className="inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-white font-bold tracking-widest uppercase"
                style={{
                  fontSize: "clamp(8px, 1.8vw, 11px)",
                  background: `rgba(${accentRgb},0.85)`,
                  backdropFilter: "blur(8px)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                {slide.tag}
              </span>
            )} */}

            {/* ── TITLE (naya) ── */}
            {/* <h1
              className="text-white font-bold leading-tight"
              style={{
                fontSize: "clamp(20px, 5.5vw, 52px)",
                whiteSpace: "pre-line",
                textShadow: "0 2px 12px rgba(0,0,0,0.5)",
              }}
            >
              {slide.title}
            </h1> */}

            {/* subtitle */}
            {/* <p
              className="text-white/80 leading-snug"
              style={{ fontSize: "clamp(11px, 2.8vw, 16px)", maxWidth: "34ch" }}
            >
              {slide.subtitle}
            </p> */}

            {/* divider */}
            <div
              className="h-px rounded-full"
              style={{
                width: "clamp(60px, 15vw, 120px)",
                background: `linear-gradient(90deg, rgba(${accentRgb},0.85), transparent)`,
              }}
            />

            {/* CTA */}
            <motion.button
              className="pointer-events-auto w-fit flex items-center gap-2 text-white font-bold rounded-full"
              style={{
                background: `rgba(${accentRgb},0.92)`,
                backdropFilter: "blur(8px)",
                fontSize: "clamp(11px, 2.8vw, 14px)",
                padding: "clamp(7px, 1.8vw, 13px) clamp(14px, 3.5vw, 26px)",
              }}
              whileHover={{ scale: 1.05, boxShadow: `0 8px 24px rgba(${accentRgb},0.5)` }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15 }}
              onClick={() => navigate("/products")}
            >
              {slide.cta}
              <ArrowRight size={13} />
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Prev / Next (hidden on mobile) ── */}
      <button
        aria-label="prev slide"
        className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-40 w-9 h-9 rounded-full items-center justify-center text-white"
        style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(6px)" }}
        onClick={() => goTo(activeIdx - 1)}
      >
        <ChevronLeft size={18} />
      </button>
      <button
        aria-label="next slide"
        className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-40 w-9 h-9 rounded-full items-center justify-center text-white"
        style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(6px)" }}
        onClick={() => goTo(activeIdx + 1)}
      >
        <ChevronRight size={18} />
      </button>

      {/* ── Slide counter (top-right) ── */}
      <div className="absolute top-3 right-4 z-40 flex items-center gap-1.5">
        <span className="text-white font-bold tabular-nums" style={{ fontSize: "clamp(12px, 3vw, 18px)" }}>
          {String(activeIdx + 1).padStart(2, "0")}
        </span>
        <div className="w-8 sm:w-12 h-px bg-white/30 relative overflow-hidden rounded-full">
          <motion.div
            key={activeIdx}
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: `rgb(${accentRgb})` }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: autoPlayMs / 1000, ease: "linear" }}
          />
        </div>
        <span className="text-white/40 font-medium tabular-nums" style={{ fontSize: "clamp(10px, 2.2vw, 14px)" }}>
          {String(slides.length).padStart(2, "0")}
        </span>
      </div>

      {/* ── Progress dots (bottom center) ── */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 flex gap-1.5 items-center">
        {slides.map((_, i) => (
          <motion.button
            key={i}
            aria-label={`Slide ${i + 1}`}
            className="rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.28)", height: 4 }}
            animate={{ width: i === activeIdx ? 26 : 7 }}
            transition={{ duration: 0.3 }}
            onClick={() => goTo(i)}
          >
            {i === activeIdx && (
              <motion.div
                key={activeIdx}
                className="h-full rounded-full"
                style={{ background: `rgb(${accentRgb})`, originX: 0 }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: autoPlayMs / 1000, ease: "linear" }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </section>
  );
}

export default HeroBanner;