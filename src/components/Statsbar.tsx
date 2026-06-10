import { motion, useAnimationFrame, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState, useCallback } from "react";

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface StatItem {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  icon: string;
}

/* ─── Data ──────────────────────────────────────────────────────────────── */

const STATS: StatItem[] = [
  { value: 50,    suffix: "+", label: "Tea Varieties",       icon: "🍃" },
  { value: 12,    suffix: "+", label: "Source Countries",    icon: "🌍" },
  { value: 25000, suffix: "+", label: "Happy Customers",     icon: "☕" },
  { value: 8,     suffix: "+", label: "Years of Expertise",  icon: "✨" },
  { value: 4.9,               label: "Average Rating",      icon: "⭐" },
  { value: 100,   suffix: "%", label: "Natural Ingredients", icon: "🌱" },
  { value: 200,   suffix: "+", label: "Five-Star Reviews",   icon: "🏆" },
];

/* ─── Animated counter (counts up when hovered) ─────────────────────────── */

function Counter({ value, suffix = "", prefix = "", active }: {
  value: number; suffix?: string; prefix?: string; active: boolean;
}) {
  const [display, setDisplay] = useState(value);
  const formatted = (v: number) =>
    v >= 1000 ? Math.round(v).toLocaleString() : v % 1 !== 0 ? v.toFixed(1) : String(Math.round(v));

  useEffect(() => {
    if (!active) { setDisplay(value); return; }
    const start = value * 0.4;
    const dur = 900;
    const t0 = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(start + (value - start) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, value]);

  return (
    <span className="tabular-nums">
      {prefix}{formatted(display)}{suffix}
    </span>
  );
}

/* ─── Single stat chip ───────────────────────────────────────────────────── */

function StatChip({ stat, spotlit }: { stat: StatItem; spotlit: boolean }) {
  const [hovered, setHovered] = useState(false);
  const active = hovered || spotlit;

  return (
    <motion.span
      className="inline-flex items-center gap-3 flex-shrink-0 whitespace-nowrap relative px-5 py-2 rounded-full cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{
        background: active ? "rgba(217,119,6,0.12)" : "rgba(255,255,255,0)",
        boxShadow: active
          ? "0 0 28px rgba(251,191,36,0.22), inset 0 0 0 1px rgba(251,191,36,0.22)"
          : "0 0 0 rgba(0,0,0,0)",
        scale: active ? 1.08 : 1,
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* icon */}
      <motion.span
        className="text-xl"
        animate={{ rotate: active ? [0, -12, 12, 0] : 0, scale: active ? 1.2 : 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {stat.icon}
      </motion.span>

      {/* value */}
      <motion.span
        className="font-serif font-bold text-xl tracking-wide"
        animate={{ color: active ? "#fbbf24" : "#f59e0b" }}
        transition={{ duration: 0.3 }}
      >
        <Counter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} active={active} />
      </motion.span>

      {/* label */}
      <motion.span
        className="text-base tracking-[0.1em] font-medium"
        animate={{ color: active ? "#fde68a" : "#a8a29e" }}
        transition={{ duration: 0.3 }}
      >
        {stat.label}
      </motion.span>

      {/* glow dot at bottom when active */}
      <AnimatedDot active={active} color="#fbbf24" />
    </motion.span>
  );
}

function AnimatedDot({ active, color }: { active: boolean; color: string }) {
  return (
    <motion.span
      className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
      style={{ background: color }}
      animate={{ width: active ? 24 : 4, height: 3, opacity: active ? 1 : 0 }}
      transition={{ duration: 0.35 }}
    />
  );
}

/* ─── Separator dot ─────────────────────────────────────────────────────── */

function Sep({ pulse }: { pulse: boolean }) {
  return (
    <motion.span
      aria-hidden
      className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 mx-6"
      animate={{
        background: pulse ? "#fbbf24" : "#78350f",
        scale: pulse ? 1.6 : 1,
        boxShadow: pulse ? "0 0 8px #fbbf24" : "none",
      }}
      transition={{ duration: 0.4 }}
    />
  );
}

/* ─── Scanning beam that sweeps across ──────────────────────────────────── */

function ScanBeam({ paused }: { paused: boolean }) {
  return (
    <motion.div
      className="absolute inset-y-0 w-40 pointer-events-none z-20"
      style={{
        background: "linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.07) 40%, rgba(251,191,36,0.14) 50%, rgba(251,191,36,0.07) 60%, transparent 100%)",
      }}
      animate={paused ? { x: "0%" } : { x: ["−20%", "120%"] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "linear", repeatDelay: 0.8 }}
    />
  );
}

/* ─── Ambient floating sparks ───────────────────────────────────────────── */

function Spark({ i }: { i: number }) {
  const left = `${10 + (i * 13) % 80}%`;
  const size = 2 + (i % 3);
  const dur = 3 + (i % 3) * 1.2;
  const delay = (i * 0.55) % 3;
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, left, bottom: 0, background: i % 2 === 0 ? "#fbbf24" : "#d97706" }}
      animate={{ y: [0, -(45 + (i % 3) * 20)], opacity: [0, 0.8, 0] }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: "easeOut" }}
    />
  );
}

/* ─── Spotlight tracker: which chip index is "center-stage" ─────────────── */

function useSpotlightIndex(count: number, paused: boolean, intervalMs = 2200) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx(p => (p + 1) % count), intervalMs);
    return () => clearInterval(t);
  }, [count, paused, intervalMs]);
  return idx;
}

/* ─── Marquee track (pure rAF, pause-on-hover) ───────────────────────────── */

function MarqueeTrack({ children, paused }: { children: React.ReactNode; paused: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const xRef = useRef(0);
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useAnimationFrame((_, delta) => {
    if (pausedRef.current) return;
    const el = trackRef.current;
    if (!el) return;
    const half = el.scrollWidth / 2;
    xRef.current = (xRef.current - delta * 0.042) % -half;
    el.style.transform = `translateX(${xRef.current}px)`;
  });

  return (
    <div ref={trackRef} className="flex items-center w-max will-change-transform">
      {children}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */

 function StatsBar() {
  const [paused, setPaused] = useState(false);
  const spotIdx = useSpotlightIndex(STATS.length, paused);

  const buildSet = (prefix: string) =>
    STATS.flatMap((stat, i) => [
      <StatChip key={`${prefix}-${i}`} stat={stat} spotlit={!paused && spotIdx === i} />,
      <Sep key={`${prefix}-sep-${i}`} pulse={!paused && spotIdx === i} />,
    ]);

  return (
    <section
      className="relative overflow-hidden select-none"
      style={{ background: "linear-gradient(180deg, #120d04 0%, #1c1108 50%, #120d04 100%)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* gold shimmer borders */}
      <motion.div
        className="absolute top-0 inset-x-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #d97706, #fbbf24, #d97706, transparent)" }}
        animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-0 inset-x-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #92400e, #d97706, #92400e, transparent)" }}
        animate={{ backgroundPosition: ["200% 0%", "0% 0%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />

      {/* ambient sparks */}
      {Array.from({ length: 10 }).map((_, i) => <Spark key={i} i={i} />)}

      {/* scanning beam */}
      <ScanBeam paused={paused} />

      {/* edge fade masks */}
      <div className="absolute inset-y-0 left-0 w-28 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, #120d04, transparent)" }} />
      <div className="absolute inset-y-0 right-0 w-28 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, #120d04, transparent)" }} />

      {/* pause hint */}
      <motion.div
        className="absolute top-2 right-32 z-20 text-amber-600/70 text-xs font-medium tracking-widest pointer-events-none"
        animate={{ opacity: paused ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        ⏸ PAUSED — HOVER A STAT
      </motion.div>

      {/* scrolling content */}
      <div className="py-8 overflow-hidden">
        <MarqueeTrack paused={paused}>
          {buildSet("a")}
          {buildSet("b")}
        </MarqueeTrack>
      </div>

      {/* warm inner glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 100% at 50% 50%, rgba(180,83,9,0.07), transparent)" }} />
    </section>
  );
}


export default StatsBar