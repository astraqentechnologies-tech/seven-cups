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

function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false);
  const { src, alt, style, className, ...rest } = props;

  if (didError) {
    return (
      <div
        className={`flex items-center justify-center bg-amber-50 ${className ?? ""}`}
        style={style}
      >
        <img
          src={ERROR_IMG_SRC}
          alt="Error loading image"
          {...rest}
          data-original-url={src}
        />
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
}: {
  category: Category;
  index: number;
  inView: boolean;
}) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const imageSrc =
    category.image_url ||
    "https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg";

  return (
    <motion.div
      className="flex-shrink-0 flex flex-col items-center cursor-pointer"
      style={{ width: 300 }}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: Math.min(index * 0.07, 0.35) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/products?category=${category.slug}`)}
    >
      <div
        style={{
          width: 300,
          height: 360,
          borderRadius: "150px 150px 16px 16px",
          overflow: "hidden",
          background: "#81fa07",
          transform: hovered ? "translateY(-6px)" : "translateY(0)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          boxShadow: hovered
            ? "0 20px 48px rgba(120,70,20,0.22)"
            : "0 4px 16px rgba(120,70,20,0.10)",
          position: "relative",
        }}
      >
        <ImageWithFallback
          src={imageSrc}
          alt={category.name}
          className="w-full h-full object-cover object-top"
          style={{
            transform: hovered ? "scale(1.06)" : "scale(1)",
            transition: "transform 0.4s ease",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(60,30,10,0.18) 0%, transparent 50%)",
            pointerEvents: "none",
          }}
        />
      </div>

      <p
        style={{
          marginTop: 14,
          fontSize: 17,
          fontWeight: 600,
          color: "#2c1f0e",
          textAlign: "center",
          fontFamily: "Georgia, 'Times New Roman', serif",
          letterSpacing: "0.01em",
          lineHeight: 1.3,
        }}
      >
        {category.name}
      </p>

      <div
        style={{
          marginTop: 5,
          height: 2,
          borderRadius: 999,
          background: "#db11fa",
          width: hovered ? 40 : 0,
          transition: "width 0.3s ease",
        }}
      />
    </motion.div>
  );
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
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
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -340 : 340,
      behavior: "smooth",
    });
  };

  const useScrollLayout = categories.length > 3;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ background: "#f5ede0", padding: "4rem 2rem 4.5rem" }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          top: -80, left: -80, width: 360, height: 360,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: -60, right: -60, width: 300, height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(180,83,9,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          className="text-center"
          style={{ marginBottom: "2.75rem" }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <p style={{
            fontSize: 20, fontWeight: 600, letterSpacing: "0.08em",
            fontFamily: "Georgia, 'Times New Roman', serif",
            color: "#7a5c3a", marginBottom: 8,
          }}>
            Something for Everyone
          </p>
          <h2 style={{
            fontSize: 44, fontWeight: 700, color: "#356603",
            lineHeight: 1.1,
            fontFamily: "Georgia, 'Times New Roman', serif",
            margin: 0,
          }}>
            Shop by Category
          </h2>
        </motion.div>

        {useScrollLayout && (
          <div className="flex items-center justify-end gap-2" style={{ marginBottom: "1.25rem" }}>
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              style={{
                width: 36, height: 36, borderRadius: "50%",
                border: `1px solid ${canScrollLeft ? "#b45309" : "#d6c9b8"}`,
                background: canScrollLeft ? "rgba(180,83,9,0.07)" : "transparent",
                color: canScrollLeft ? "#b45309" : "#b8a898",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: canScrollLeft ? "pointer" : "default",
                transition: "all 0.2s",
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              style={{
                width: 36, height: 36, borderRadius: "50%",
                border: `1px solid ${canScrollRight ? "#b45309" : "#d6c9b8"}`,
                background: canScrollRight ? "rgba(180,83,9,0.07)" : "transparent",
                color: canScrollRight ? "#b45309" : "#b8a898",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: canScrollRight ? "pointer" : "default",
                transition: "all 0.2s",
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {useScrollLayout ? (
          <div className="relative">
            <div
              className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none transition-opacity duration-300"
              style={{
                width: 64,
                background: "linear-gradient(to right, #f5ede0, transparent)",
                opacity: canScrollLeft ? 1 : 0,
              }}
            />
            <div
              className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none transition-opacity duration-300"
              style={{
                width: 64,
                background: "linear-gradient(to left, #f5ede0, transparent)",
                opacity: canScrollRight ? 1 : 0,
              }}
            />
            <div
              ref={scrollRef}
              className="flex gap-16 overflow-x-auto pt-2 pb-6 px-1"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
                scrollSnapType: "x mandatory",
              }}
            >
              {categories.map((cat, i) => (
                <ArchCategoryCard key={cat.id} category={cat} index={i} inView={inView} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center" style={{ gap: "4rem" }}>
            {categories.map((cat, i) => (
              <ArchCategoryCard key={cat.id} category={cat} index={i} inView={inView} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}