import { motion, AnimatePresence } from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ─── Types (from file 2) ───────────────────────────────────────────────────── */

interface Category {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  description?: string;
  color?: string;
}

interface CategoryGridProps {
  categories: Category[];
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

/* ─── Color palette fallback (cycles through if not provided) ─────────────── */

const COLOR_PALETTE = [
  "#4ade80",
  "#92400e",
  "#a78bfa",
  "#e2e8f0",
  "#fb923c",
  "#f59e0b",
];

/* ─── ImageWithFallback (from file 1) ───────────────────────────────────────── */

const ERROR_IMG_SRC =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==";

function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false);
  const { src, alt, style, className, ...rest } = props;
  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ""}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img
          src={ERROR_IMG_SRC}
          alt="Error loading image"
          {...rest}
          data-original-url={src}
        />
      </div>
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={() => setDidError(true)}
    />
  );
}

/* ─── Droplet SVG (from file 1) ─────────────────────────────────────────────── */

function Droplet({ color }: { color: string }) {
  const id = `dg-${color.replace("#", "")}`;
  return (
    <svg width="48" height="72" viewBox="0 0 48 72" fill="none">
      <defs>
        <radialGradient id={id} cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="50%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor="#b45309" stopOpacity="1" />
        </radialGradient>
      </defs>
      <path
        d="M24 4 C24 4 6 28 6 44 C6 56 14 66 24 66 C34 66 42 56 42 44 C42 28 24 4 24 4Z"
        fill={`url(#${id})`}
        stroke="rgba(180,83,9,0.4)"
        strokeWidth="1"
      />
      <ellipse cx="18" cy="32" rx="5" ry="9" fill="white" opacity="0.28" />
    </svg>
  );
}

/* ─── Ripple rings (from file 1) ─────────────────────────────────────────────── */

function SplashRings({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2"
          style={{ borderColor: color }}
          initial={{ width: 20, height: 20, opacity: 0.9 }}
          animate={{ width: 220, height: 220, opacity: 0 }}
          transition={{ duration: 0.9, delay: i * 0.18, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

/* ─── Individual category card (file 1 animation + file 2 onNavigate) ────────── */

type Phase = "idle" | "dropping" | "splashing" | "revealed";

function CategoryCard({
  category,
  index,
  trigger,
  color,
  onNavigate,
}: {
  category: Category;
  index: number;
  trigger: boolean;
  color: string;
  onNavigate: CategoryGridProps["onNavigate"];
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    const BASE = 600;
    const STEP = 450;
    const t1 = setTimeout(() => setPhase("dropping"), BASE + index * STEP);
    const t2 = setTimeout(
      () => setPhase("splashing"),
      BASE + index * STEP + 900
    );
    const t3 = setTimeout(
      () => setPhase("revealed"),
      BASE + index * STEP + 1350
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [trigger, index]);

  const imageSrc =
    category.image_url ||
    "https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg";

  return (
    <div className="relative" style={{ height: 340, perspective: "800px" }}>
      {/* ── Falling droplet ─────────────────────────────────────── */}
      <AnimatePresence>
        {phase === "dropping" && (
          <motion.div
            key="drop"
            className="absolute inset-0 flex items-start justify-center pointer-events-none z-20"
            initial={{ y: -380, scaleY: 0.7, scaleX: 1.2, opacity: 0 }}
            animate={{ y: 0, scaleY: 1.15, scaleX: 0.88, opacity: 1 }}
            exit={{ opacity: 0, scale: 2.5, transition: { duration: 0.22 } }}
            transition={{ duration: 0.85, ease: [0.2, 0, 0.6, 1] }}
          >
            {/* trailing streak */}
            <motion.div
              className="absolute top-4 left-1/2 -translate-x-1/2 w-1 rounded-full"
              style={{
                background: `linear-gradient(to bottom, transparent, ${color}88)`,
              }}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 160, opacity: 0.55 }}
              transition={{ duration: 0.85, ease: "easeIn" }}
            />
            <Droplet color={color} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Splash rings ────────────────────────────────────────── */}
      {phase === "splashing" && <SplashRings color={color} />}

      {/* ── Category card ───────────────────────────────────────── */}
      <AnimatePresence>
        {(phase === "splashing" || phase === "revealed") && (
          <motion.div
            key="card"
            className="absolute inset-0 rounded-2xl overflow-hidden cursor-pointer"
            style={{
              boxShadow: hovered
                ? `0 24px 60px ${color}55, 0 8px 24px rgba(0,0,0,0.18)`
                : `0 4px 20px rgba(0,0,0,0.10)`,
              transition: "box-shadow 0.4s ease",
            }}
            initial={{ scale: 0.15, opacity: 0, rotateX: 30 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => onNavigate("products", { category: category.slug })}
          >
            {/* image */}
            <motion.div
              className="absolute inset-0"
              animate={{ scale: hovered ? 1.08 : 1 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            >
              <ImageWithFallback
                src={imageSrc}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* liquid-colour overlay tint */}
            <div
              className="absolute inset-0 transition-opacity duration-500"
              style={{
                background: `radial-gradient(ellipse at 60% 40%, ${color}44 0%, transparent 70%)`,
                opacity: hovered ? 1 : 0.35,
              }}
            />

            {/* dark gradient for text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

            {/* content */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              {/* accent line */}
              <motion.div
                className="h-0.5 rounded-full mb-3"
                style={{ background: color }}
                initial={{ width: 0 }}
                animate={{ width: hovered ? "60%" : "28%" }}
                transition={{ duration: 0.4 }}
              />
              <h3
                className="text-white mb-1"
                style={{ fontSize: 20, fontWeight: 700 }}
              >
                {category.name}
              </h3>
              {category.description && (
                <p className="text-white/75 text-sm leading-snug mb-3">
                  {category.description}
                </p>
              )}

              <motion.button
                className="px-5 py-1.5 rounded-full text-sm font-semibold text-white border border-white/30 backdrop-blur-sm"
                style={{ background: `${color}88` }}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.06, background: color }}
                whileTap={{ scale: 0.95 }}
              >
                Explore →
              </motion.button>
            </div>

            {/* shimmer sweep on hover */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
                backgroundSize: "200% 100%",
              }}
              animate={{ backgroundPosition: hovered ? "200% 0" : "-100% 0" }}
              transition={{ duration: 0.65 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Placeholder skeleton while idle ─────────────────────── */}
      {phase === "idle" && (
        <div className="absolute inset-0 rounded-2xl bg-amber-50/60 border border-amber-100" />
      )}
    </div>
  );
}

/* ─── Tea Cup SVG (from file 1, unchanged) ───────────────────────────────────── */

function TeaCup() {
  return (
    <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
      <defs>
        <radialGradient id="teaSurface" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#b45309" stopOpacity="1" />
        </radialGradient>
        <linearGradient id="cupBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fefce8" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
        <filter id="cupGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Steam wisps */}
      {[
        { path: "M 52 38 Q 46 26 52 18 Q 58 10 52 2", delay: 0 },
        { path: "M 72 36 Q 66 24 72 16 Q 78 8 72 0", delay: 0.35 },
        { path: "M 92 38 Q 86 26 92 18 Q 98 10 92 2", delay: 0.7 },
      ].map((s, i) => (
        <motion.path
          key={i}
          d={s.path}
          stroke="#94a3b8"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0.7, 0.7, 0] }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            delay: s.delay,
            ease: "easeInOut",
            times: [0, 0.4, 0.7, 1],
          }}
        />
      ))}

      {/* Saucer */}
      <ellipse
        cx="80"
        cy="148"
        rx="52"
        ry="8"
        fill="#e7d5b3"
        stroke="#c9a96e"
        strokeWidth="1.5"
      />
      <ellipse
        cx="80"
        cy="145"
        rx="44"
        ry="5"
        fill="#f5e6c8"
        stroke="#c9a96e"
        strokeWidth="1"
      />

      {/* Cup body */}
      <path
        d="M 36 60 L 42 128 Q 43 136 50 136 L 110 136 Q 117 136 118 128 L 124 60 Z"
        fill="url(#cupBody)"
        stroke="#c9a96e"
        strokeWidth="2"
        filter="url(#cupGlow)"
      />

      {/* Tea liquid */}
      <motion.path
        d="M 38 65 L 44 126 Q 45 133 50 133 L 110 133 Q 115 133 116 126 L 122 65 Z"
        fill="url(#teaSurface)"
        animate={{ opacity: [0.75, 0.9, 0.75] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Rim ellipse */}
      <ellipse
        cx="80"
        cy="60"
        rx="44"
        ry="9"
        fill="#fefce8"
        stroke="#c9a96e"
        strokeWidth="1.5"
      />

      {/* Tea surface shimmer */}
      <motion.ellipse
        cx="80"
        cy="60"
        rx="38"
        ry="6"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="1.5"
        strokeOpacity="0.6"
        animate={{ scaleX: [1, 1.04, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Handle */}
      <path
        d="M 124 80 Q 148 80 148 100 Q 148 122 124 122"
        fill="none"
        stroke="#c9a96e"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Handle inner highlight */}
      <path
        d="M 124 88 Q 140 88 140 100 Q 140 114 124 114"
        fill="none"
        stroke="#e7d5b3"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Cup decorative stripe */}
      <path
        d="M 42 85 L 118 85"
        stroke="#d97706"
        strokeWidth="0.8"
        strokeOpacity="0.4"
        strokeDasharray="4 6"
      />
    </svg>
  );
}

/* ─── Falling stream from cup (from file 1) ──────────────────────────────────── */

function FallingStream({
  active,
  color,
}: {
  active: boolean;
  color: string;
}) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-1 rounded-full pointer-events-none z-30"
          style={{
            background: `linear-gradient(to bottom, ${color}cc, transparent)`,
          }}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 80, opacity: 0.6 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      )}
    </AnimatePresence>
  );
}

/* ─── Main component — file 1 layout + file 2 props/scroll/navigation ────────── */

export default function CategoryGrid({
  categories,
  onNavigate,
}: CategoryGridProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [trigger, setTrigger] = useState(false);
  // Increments each time the section enters view — used as key to remount cards
  const [resetKey, setResetKey] = useState(0);

  // Replay animation every time section enters viewport (no disconnect = stays active)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Reset states so cards remount from idle phase
          setTrigger(false);
          setInView(false);
          setResetKey((k) => k + 1);
          // Small tick so React flushes the reset before setting inView true
          setTimeout(() => setInView(true), 50);
        } else {
          // Section left viewport — clear trigger so next entry starts fresh
          setTrigger(false);
          setInView(false);
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const [activeStream, setActiveStream] = useState<number | null>(null);

  // Scroll state (from file 2)
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(
      el.scrollLeft + el.clientWidth < el.scrollWidth - 10
    );
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
    return () => el.removeEventListener("scroll", checkScroll);
  }, [categories]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -440 : 440, behavior: "smooth" });
  };

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setTrigger(true), 200);
    return () => clearTimeout(t);
  }, [inView]);

  /* light stream flashes from cup while drops are being released */
  useEffect(() => {
    if (!trigger) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    categories.forEach((_, i) => {
      timers.push(
        setTimeout(() => setActiveStream(i), 600 + i * 450)
      );
      timers.push(
        setTimeout(() => setActiveStream(null), 600 + i * 450 + 500)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [trigger, categories]);

  // Determine if the grid needs horizontal scrolling (more than 3 categories)
  const useScrollLayout = categories.length > 3;

  return (
    <section
      ref={sectionRef}
      className="relative py-28 px-6 overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #fffbeb 0%, #fef3c7 35%, #fde68a22 65%, #f5f5f0 100%)",
      }}
    >
      {/* Ambient blobs */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, #fbbf24, transparent)",
        }}
      />
      <div
        className="absolute -bottom-24 -right-20 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, #d97706, transparent)",
        }}
      />

      <style>{`
        @keyframes teaPulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        .cat-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="relative max-w-6xl mx-auto">

        {/* ── Section heading ────────────────────────────────────── */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="text-amber-600 text-sm font-semibold tracking-[0.22em] uppercase mb-2">
            Our Collection
          </p>

          {/* Title with scroll arrows (from file 2) integrated into heading row */}
          <div className="flex items-center justify-center gap-4 mb-3">
            {useScrollLayout && (
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label="Scroll left"
                className="w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-300"
                style={{
                  borderColor: canScrollLeft ? "#d97706" : "#d6d3d1",
                  color: canScrollLeft ? "#d97706" : "#a8a29e",
                  background: canScrollLeft
                    ? "rgba(217,119,6,0.06)"
                    : "transparent",
                }}
              >
                <ChevronLeft size={16} />
              </button>
            )}

            <h2
              className="text-stone-900"
              style={{
                fontSize: 40,
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              Explore Tea Categories
            </h2>

            {useScrollLayout && (
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Scroll right"
                className="w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-300"
                style={{
                  borderColor: canScrollRight ? "#d97706" : "#d6d3d1",
                  color: canScrollRight ? "#d97706" : "#a8a29e",
                  background: canScrollRight
                    ? "rgba(217,119,6,0.06)"
                    : "transparent",
                }}
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-16 bg-amber-300" />
            <span className="text-amber-500 text-lg">✦</span>
            <span className="h-px w-16 bg-amber-300" />
          </div>
        </motion.div>

        {/* ── Tea Cup ─────────────────────────────────────────────── */}
        <div className="flex justify-center mb-6 relative">
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.8 }}
            animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.34, 1.3, 0.64, 1] }}
            className="relative"
          >
            {/* glow halo under cup */}
            <motion.div
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-6 rounded-full blur-2xl"
              style={{ background: "#fbbf24" }}
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
            <TeaCup />

            {/* stream falls from cup bottom */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              <FallingStream
                active={activeStream !== null}
                color={
                  activeStream !== null
                    ? (categories[activeStream]?.color ||
                        COLOR_PALETTE[activeStream % COLOR_PALETTE.length])
                    : "#fbbf24"
                }
              />
            </div>
          </motion.div>
        </div>

        {/* ── Sub-label ───────────────────────────────────────────── */}
        <motion.p
          className="text-center text-stone-500 text-sm mb-14"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Watch each drop transform into a unique tea world
        </motion.p>

        {/* ── Category grid / scroll row ───────────────────────────── */}
        {useScrollLayout ? (
          /* Scrollable row when many categories (file 2 pattern) */
          <div className="relative overflow-visible">
            {/* Left fade mask */}
            <div
              className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none transition-opacity duration-300"
              style={{
                background:
                  "linear-gradient(to right, #fffbeb, transparent)",
                opacity: canScrollLeft ? 1 : 0,
              }}
            />
            {/* Right fade mask */}
            <div
              className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none transition-opacity duration-300"
              style={{
                background: "linear-gradient(to left, #fffbeb, transparent)",
                opacity: canScrollRight ? 1 : 0,
              }}
            />
            <div
              ref={scrollRef}
              className="cat-scroll flex gap-6 overflow-x-auto pt-2 pb-4 px-2"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {categories.map((cat, i) => (
                <div key={`${cat.id}-${resetKey}`} className="flex-shrink-0" style={{ width: 320 }}>
                  <CategoryCard
                    category={cat}
                    index={i}
                    trigger={trigger}
                    color={
                      cat.color || COLOR_PALETTE[i % COLOR_PALETTE.length]
                    }
                    onNavigate={onNavigate}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Standard grid for 3 or fewer categories */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <CategoryCard
                key={`${cat.id}-${resetKey}`}
                category={cat}
                index={i}
                trigger={trigger}
                color={cat.color || COLOR_PALETTE[i % COLOR_PALETTE.length]}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}

        {/* ── Bottom CTA ──────────────────────────────────────────── */}
        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{
            delay: categories.length * 0.45 + 1.2,
            duration: 0.6,
          }}
        >
          <motion.button
            className="px-9 py-3.5 rounded-full font-semibold text-white"
            style={{
              background:
                "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)",
              boxShadow: "0 8px 32px rgba(180,83,9,0.35)",
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 12px 40px rgba(180,83,9,0.45)",
            }}
            whileTap={{ scale: 0.96 }}
          >
            View All Teas
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}