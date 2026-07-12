import { motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
}

const ERROR_IMG_SRC =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==";

// Mobile pe card width calculate karo — 3 cards fit ho
function useCardSize() {
  const [cardWidth, setCardWidth] = useState(300);

  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      if (vw < 640) {
        // Mobile: 3 cards visible, gap 12px, padding 16px each side
        const available = vw - 32; // 16px padding dono side
        const gap = 12 * 2; // 2 gaps for 3 cards
        setCardWidth(Math.floor((available - gap) / 3));
      } else if (vw < 1024) {
        setCardWidth(200);
      } else {
        setCardWidth(300);
      }
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  return cardWidth;
}

function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false);
  const { src, alt, style, className, ...rest } = props;

  if (didError) {
    return (
      <div
        className={`flex items-center justify-center bg-amber-50 ${className ?? ""}`}
        style={style}
      >
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      loading="lazy"
      onError={() => setDidError(true)}
    />
  );
}

function ArchCategoryCard({
  category,
  index,
  inView,
  cardWidth,
}: {
  category: Category;
  index: number;
  inView: boolean;
  cardWidth: number;
}) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const imageSrc =
    category.image_url ||
    "https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg";

  // Card height proportional to width
  const cardHeight = Math.round(cardWidth * 1.2);
  const borderRadius = Math.round(cardWidth / 2);
  const fontSize = cardWidth < 120 ? 11 : cardWidth < 200 ? 13 : 17;

  return (
    <motion.div
      className="flex-shrink-0 flex flex-col items-center cursor-pointer"
      style={{ width: cardWidth }}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.1, 0.4),
        ease: "easeOut",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/products?category=${category.slug}`)}
    >
      {/* Arch image container */}
      <motion.div
        style={{
          width: cardWidth,
          height: cardHeight,
          borderRadius: `${borderRadius}px ${borderRadius}px 12px 12px`,
          overflow: "hidden",
          background: "#f0e6d3",
          position: "relative",
        }}
        animate={{
          y: hovered ? -6 : 0,
          boxShadow: hovered
            ? "0 20px 44px rgba(120,70,20,0.22)"
            : "0 4px 14px rgba(120,70,20,0.10)",
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <motion.div
          className="w-full h-full"
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <ImageWithFallback
            src={imageSrc}
            alt={category.name}
            className="w-full h-full object-cover object-top"
          />
        </motion.div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(60,30,10,0.18) 0%, transparent 50%)",
            pointerEvents: "none",
          }}
        />
      </motion.div>

      {/* Category name */}
      <motion.p
        style={{
          marginTop: cardWidth < 120 ? 8 : 14,
          fontSize,
          fontWeight: 600,
          color: "#2c1f0e",
          textAlign: "center",
          fontFamily: "Georgia, 'Times New Roman', serif",
          letterSpacing: "0.01em",
          lineHeight: 1.3,
        }}
        animate={{ color: hovered ? "#b45309" : "#2c1f0e" }}
        transition={{ duration: 0.25 }}
      >
        {category.name}
      </motion.p>

      {/* Underline */}
      <motion.div
        style={{
          marginTop: 5,
          height: 2,
          borderRadius: 999,
          background: "#b45309",
          originX: 0,
        }}
        animate={{ width: hovered ? 32 : 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </motion.div>
  );
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const cardWidth = useCardSize();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setInView(true); io.disconnect(); }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
    return () => el.removeEventListener("scroll", checkScroll);
  }, [categories]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
  };

  const useScrollLayout = categories.length > 3;
  // Mobile pe gap bhi chhota
  const isMobile = cardWidth < 150;
  const gap = isMobile ? 12 : cardWidth < 250 ? 16 : 64;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ background: "#f5ede0", padding: isMobile ? "2.5rem 1rem 3rem" : "4rem 2rem 4.5rem" }}
    >
      {/* Background blobs */}
      <div className="absolute pointer-events-none" style={{
        top: -80, left: -80, width: 360, height: 360, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 70%)",
        filter: "blur(40px)",
      }} />
      <div className="absolute pointer-events-none" style={{
        bottom: -60, right: -60, width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(180,83,9,0.12) 0%, transparent 70%)",
        filter: "blur(40px)",
      }} />

      <div className="relative max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div
          className="text-center"
          style={{ marginBottom: isMobile ? "1.75rem" : "2.75rem" }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <p style={{
            fontSize: isMobile ? 14 : 20, fontWeight: 600, letterSpacing: "0.08em",
            fontFamily: "Georgia, 'Times New Roman', serif",
            color: "#7a5c3a", marginBottom: 8,
          }}>
            Something for Everyone
          </p>
          <h2 style={{
            fontSize: isMobile ? 28 : 44, fontWeight: 700, color: "#356603",
            lineHeight: 1.1, fontFamily: "Georgia, 'Times New Roman', serif", margin: 0,
          }}>
            Shop by Category
          </h2>
        </motion.div>

        {/* Scroll buttons — desktop only */}
        {useScrollLayout && !isMobile && (
          <div className="flex items-center justify-end gap-2" style={{ marginBottom: "1.25rem" }}>
            {[{ dir: "left" as const, can: canScrollLeft }, { dir: "right" as const, can: canScrollRight }].map(({ dir, can }) => (
              <button
                key={dir}
                onClick={() => scroll(dir)}
                disabled={!can}
                aria-label={`Scroll ${dir}`}
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  border: `1px solid ${can ? "#b45309" : "#d6c9b8"}`,
                  background: can ? "rgba(180,83,9,0.07)" : "transparent",
                  color: can ? "#b45309" : "#b8a898",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: can ? "pointer" : "default", transition: "all 0.2s",
                }}
              >
                {dir === "left" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </button>
            ))}
          </div>
        )}

        {/* Cards */}
        {useScrollLayout ? (
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none transition-opacity duration-300"
              style={{ width: 32, background: "linear-gradient(to right, #f5ede0, transparent)", opacity: canScrollLeft ? 1 : 0 }} />
            <div className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none transition-opacity duration-300"
              style={{ width: 32, background: "linear-gradient(to left, #f5ede0, transparent)", opacity: canScrollRight ? 1 : 0 }} />

            <div
              ref={scrollRef}
              className="flex overflow-x-auto pt-2 pb-6 px-1"
              style={{
                gap,
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
                scrollSnapType: "x mandatory",
              }}
            >
              {categories.map((cat, i) => (
                <ArchCategoryCard key={cat.id} category={cat} index={i} inView={inView} cardWidth={cardWidth} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center" style={{ gap }}>
            {categories.map((cat, i) => (
              <ArchCategoryCard key={cat.id} category={cat} index={i} inView={inView} cardWidth={cardWidth} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}