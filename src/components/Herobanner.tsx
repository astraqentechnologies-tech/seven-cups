import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

/* ─── Types & data ─────────────────────────────────────────────────────────── */

export interface HeroBannerSlide {
  subtitle: string;
  cta: string;
  image: string;
  tag?: string;
  accent: string;
  accentRgb?: string;
}

export const defaultHeroSlides: HeroBannerSlide[] = [
  {
    subtitle: "Sourced from ancient gardens, crafted with centuries of wisdom.",
    cta: "Explore Collection",
    tag: "Seven Cups",
    image: "https://res.cloudinary.com/dlebmdfhr/image/upload/v1781550294/ChatGPT_Image_Jun_16_2026_12_34_23_AM_apzjn7.png",
    accent: "from-stone-900/80 via-stone-900/50 to-transparent",
    accentRgb: "180,83,9",
  },
  
  
];

interface HeroBannerProps {
  slides?: HeroBannerSlide[];
  autoPlayMs?: number;
}

/* ─── Floating ambient orb ─────────────────────────────────────────────────── */

function Orb({ i, accentRgb }: { i: number; accentRgb: string }) {
  const size = 120 + (i % 3) * 80;
  const top = `${15 + (i * 31) % 60}%`;
  const left = `${5 + (i * 37) % 85}%`;
  const dur = 7 + (i % 3) * 3;
  const delay = i * 1.1;
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        top,
        left,
        background: `radial-gradient(circle, rgba(${accentRgb},0.18) 0%, transparent 70%)`,
        filter: "blur(24px)",
      }}
      animate={{
        y: [0, -28, 0],
        x: [0, i % 2 === 0 ? 16 : -16, 0],
        scale: [1, 1.08, 1],
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/* ─── Particle sparks ─────────────────────────────────────────────────────── */

function Spark({ i }: { i: number }) {
  const left = `${8 + (i * 17) % 84}%`;
  const size = 2 + (i % 3);
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left,
        bottom: "8%",
        background: i % 2 === 0 ? "#fbbf24" : "#fff8",
      }}
      animate={{ y: [0, -(80 + (i % 4) * 40)], opacity: [0, 0.9, 0] }}
      transition={{
        duration: 3 + (i % 3),
        delay: (i * 0.6) % 4,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  );
}

/* ─── Diagonal light sweep ─────────────────────────────────────────────────── */

function LightSweep() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        background:
          "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)",
        backgroundSize: "200% 100%",
      }}
      animate={{ backgroundPosition: ["-100% 0%", "300% 0%"] }}
      transition={{ duration: 5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
    />
  );
}

/* ─── Decorative corner lines ──────────────────────────────────────────────── */

function CornerAccents({ accentRgb }: { accentRgb: string }) {
  const color = `rgba(${accentRgb},0.55)`;
  return (
    <>
      <motion.svg
        className="absolute top-6 left-6 z-30 pointer-events-none"
        width="48" height="48" viewBox="0 0 48 48" fill="none"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <motion.path d="M2 24 L2 2 L24 2" stroke={color} strokeWidth="2" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }} />
      </motion.svg>
      <motion.svg
        className="absolute bottom-6 right-6 z-30 pointer-events-none"
        width="48" height="48" viewBox="0 0 48 48" fill="none"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
      >
        <motion.path d="M46 24 L46 46 L24 46" stroke={color} strokeWidth="2" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }} />
      </motion.svg>
    </>
  );
}

/* ─── Slide image with Ken-Burns + mouse parallax ──────────────────────────── */

function SlideImage({
  slide, active, mouseX, mouseY,
}: {
  slide: HeroBannerSlide;
  active: boolean;
  mouseX: ReturnType<typeof useSpring>;
  mouseY: ReturnType<typeof useSpring>;
}) {
  const tx = useTransform(mouseX, [-0.5, 0.5], ["-2%", "2%"]);
  const ty = useTransform(mouseY, [-0.5, 0.5], ["-2%", "2%"]);

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 1.1, ease: "easeInOut" }}
      style={{ zIndex: active ? 2 : 1 }}
    >
      <motion.img
        src={slide.image}
        alt=""
        className="w-full h-full object-cover"
        style={{ x: tx, y: ty }}
        animate={active ? { scale: [1, 1.08] } : { scale: 1 }}
        transition={active ? { duration: 7, ease: "linear" } : { duration: 1 }}
      />
    </motion.div>
  );
}

/* ─── Word-by-word subtitle reveal ────────────────────────────────────────── */

function SubtitleReveal({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 max-w-md">
      {words.map((w, i) => (
        <div key={i} className="overflow-hidden">
          <motion.span
            className="inline-block text-white/80 text-sm md:text-base leading-relaxed"
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{ delay: 0.4 + i * 0.04, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}
          </motion.span>
        </div>
      ))}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */

function HeroBanner({
  slides = defaultHeroSlides,
  autoPlayMs = 5500,
}: HeroBannerProps) {
  const navigate = useNavigate();
  const [activeIdx, setActiveIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  /* mouse parallax */
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mouseX = useSpring(rawX, { stiffness: 60, damping: 20 });
  const mouseY = useSpring(rawY, { stiffness: 60, damping: 20 });

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const r = sectionRef.current!.getBoundingClientRect();
    rawX.set((e.clientX - r.left) / r.width - 0.5);
    rawY.set((e.clientY - r.top) / r.height - 0.5);
  }, [rawX, rawY]);

  /* autoplay */
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

  const goTo = (n: number) => { setActiveIdx((n + slides.length) % slides.length); startAuto(); };

  const slide = slides[activeIdx];
  const accentRgb = slide.accentRgb ?? "180,83,9";

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-[420px] md:h-[500px] overflow-hidden bg-stone-950"
      onMouseMove={onMouseMove}
    >
      {/* ── Background images ────────────────────────────────────── */}
      {slides.map((s, i) => (
        <SlideImage key={i} slide={s} active={i === activeIdx} mouseX={mouseX} mouseY={mouseY} />
      ))}

      {/* ── Layered gradients ────────────────────────────────────── */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)" }} />
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)" }} />

      {/* ── Accent colour wash ───────────────────────────────────── */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none"
        animate={{ background: `radial-gradient(ellipse 70% 80% at 20% 50%, rgba(${accentRgb},0.22) 0%, transparent 65%)` }}
        transition={{ duration: 1.2 }}
      />

      {/* ── Ambient orbs ─────────────────────────────────────────── */}
      {[0, 1, 2].map((i) => <Orb key={i} i={i} accentRgb={accentRgb} />)}

      {/* ── Sparks ───────────────────────────────────────────────── */}
      {Array.from({ length: 12 }).map((_, i) => <Spark key={i} i={i} />)}

      {/* ── Diagonal light sweep ─────────────────────────────────── */}
      <LightSweep />

      {/* ── Corner brackets ──────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <CornerAccents key={activeIdx} accentRgb={accentRgb} />
      </AnimatePresence>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-30 flex flex-col justify-center px-10 md:px-20 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div key={activeIdx} className="flex flex-col gap-5">

            {/* tag pill */}
            {slide.tag && (
              <motion.span
                className="inline-flex items-center gap-2 w-fit px-4 py-1.5 rounded-full text-white text-xs font-bold tracking-[0.22em] uppercase"
                style={{ background: `rgba(${accentRgb},0.85)`, backdropFilter: "blur(8px)" }}
                initial={{ x: -32, opacity: 0, scale: 0.85 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: -24, opacity: 0 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 280, damping: 22 }}
              >
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-white"
                  animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                />
                {slide.tag}
              </motion.span>
            )}

            {/* subtitle word reveal */}
            <SubtitleReveal text={slide.subtitle} />

            {/* divider line */}
            <motion.div
              className="h-px rounded-full"
              style={{ background: `linear-gradient(90deg, rgba(${accentRgb},0.8), transparent)` }}
              initial={{ width: 0 }}
              animate={{ width: 160 }}
              transition={{ delay: 0.55, duration: 0.7, ease: "easeOut" }}
            />

            {/* CTA button */}
            <motion.button
              className="pointer-events-auto w-fit flex items-center gap-2.5 text-white text-sm font-bold px-7 py-3.5 rounded-full relative overflow-hidden"
              style={{ background: `rgba(${accentRgb},0.9)`, backdropFilter: "blur(8px)" }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ delay: 0.65, duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
              whileHover={{ scale: 1.06, boxShadow: `0 12px 36px rgba(${accentRgb},0.55)` }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/products")}
            >
              {slide.cta}
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight size={16} />
              </motion.span>
              {/* shimmer */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.28) 50%, transparent 65%)", backgroundSize: "200% 100%" }}
                animate={{ backgroundPosition: ["-100% 0%", "300% 0%"] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
              />
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Prev / Next arrows ───────────────────────────────────── */}
      {[
        { dir: "prev", icon: <ChevronLeft size={20} />, pos: "left-5", action: () => goTo(activeIdx - 1) },
        { dir: "next", icon: <ChevronRight size={20} />, pos: "right-5", action: () => goTo(activeIdx + 1) },
      ].map(({ dir, icon, pos, action }) => (
        <motion.button
          key={dir}
          aria-label={`${dir} slide`}
          className={`absolute ${pos} top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full flex items-center justify-center text-white`}
          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}
          onClick={action}
          whileHover={{ scale: 1.12, background: `rgba(${accentRgb},0.55)`, borderColor: `rgba(${accentRgb},0.8)` }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          {icon}
        </motion.button>
      ))}

      {/* ── Slide counter ────────────────────────────────────────── */}
      <div className="absolute top-5 right-6 z-40 flex items-center gap-2">
        <motion.span
          key={`cur-${activeIdx}`}
          className="text-white font-bold text-lg tabular-nums"
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {String(activeIdx + 1).padStart(2, "0")}
        </motion.span>
        <div className="w-12 h-px bg-white/30 relative overflow-hidden rounded-full">
          <motion.div
            key={activeIdx}
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: `rgb(${accentRgb})` }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: autoPlayMs / 1000, ease: "linear" }}
          />
        </div>
        <span className="text-white/40 font-medium text-sm tabular-nums">
          {String(slides.length).padStart(2, "0")}
        </span>
      </div>

      {/* ── Progress dots ────────────────────────────────────────── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex gap-2 items-center">
        {slides.map((_, i) => (
          <motion.button
            key={i}
            aria-label={`Slide ${i + 1}`}
            className="rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.25)" }}
            animate={{ width: i === activeIdx ? 36 : 10, height: 6 }}
            transition={{ duration: 0.35 }}
            onClick={() => goTo(i)}
            whileHover={{ scale: 1.15 }}
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

      {/* ── Scroll hint ──────────────────────────────────────────── */}
      <div className="absolute bottom-6 right-8 z-40 flex flex-col items-center gap-1.5 pointer-events-none">
        <motion.div
          className="w-px h-10 rounded-full"
          style={{ background: "rgba(255,255,255,0.25)" }}
          animate={{ scaleY: [0, 1, 0], originY: 0 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="text-white/35 text-[10px] tracking-[0.2em] uppercase rotate-90 translate-x-5">
          Scroll
        </span>
      </div>
    </section>
  );
}

export default HeroBanner;