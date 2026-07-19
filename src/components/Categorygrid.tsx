import { motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";
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

function useCardSize() {
  const [cardWidth, setCardWidth] = useState(160);

  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      if (vw < 480) {
        // Mobile: 3 cards per row
        const available = vw - 32; // 16px padding each side
        const gaps = 12 * 2; // 2 gaps between 3 cards
        setCardWidth(Math.floor((available - gaps) / 3));
      } else if (vw < 768) {
        // Small tablet: 3 cards per row
        const available = vw - 48;
        const gaps = 16 * 2;
        setCardWidth(Math.floor((available - gaps) / 3));
      } else if (vw < 1024) {
        // Tablet: 4 cards per row
        const available = vw - 64;
        const gaps = 24 * 3;
        setCardWidth(Math.floor((available - gaps) / 4));
      } else {
        // Desktop: 4 cards per row, max-width 1152px
        const available = Math.min(vw, 1152) - 64;
        const gaps = 40 * 3;
        setCardWidth(Math.floor((available - gaps) / 4));
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

function CircleCategoryCard({
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

  const circleSize = cardWidth;
  const fontSize = circleSize < 90 ? 11 : circleSize < 140 ? 12 : 14;
  const ringSize = circleSize + 8;

  return (
    <motion.div
      className="flex flex-col items-center cursor-pointer"
      style={{ width: cardWidth }}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.08, 0.5),
        ease: "easeOut",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/products?category=${category.slug}`)}
    >
      {/* Outer animated ring */}
      <div style={{ position: "relative", width: ringSize, height: ringSize }}>
        {/* Ring */}
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: ringSize,
            height: ringSize,
            borderRadius: "50%",
            border: "2px solid #b45309",
            boxSizing: "border-box",
          }}
          animate={{
            opacity: hovered ? 1 : 0,
            scale: hovered ? 1 : 0.88,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />

        {/* Circle image */}
        <motion.div
          style={{
            position: "absolute",
            top: 4,
            left: 4,
            width: circleSize,
            height: circleSize,
            borderRadius: "50%",
            overflow: "hidden",
            background: "#f0e6d3",
          }}
          animate={{
            y: hovered ? -4 : 0,
            boxShadow: hovered
              ? "0 16px 40px rgba(120,70,20,0.28)"
              : "0 4px 16px rgba(120,70,20,0.12)",
          }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <motion.div
            className="w-full h-full"
            animate={{ scale: hovered ? 1.08 : 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <ImageWithFallback
              src={imageSrc}
              alt={category.name}
              className="w-full h-full object-cover object-center"
            />
          </motion.div>

          {/* Overlay gradient */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 50% 100%, rgba(60,30,10,0.22) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />
        </motion.div>
      </div>

      {/* Category name */}
      <motion.p
        style={{
          marginTop: circleSize < 90 ? 8 : 12,
          fontSize,
          fontWeight: 600,
          color: "#2c1f0e",
          textAlign: "center",
          fontFamily: "Georgia, 'Times New Roman', serif",
          letterSpacing: "0.01em",
          lineHeight: 1.3,
          maxWidth: cardWidth + 8,
        }}
        animate={{ color: hovered ? "#b45309" : "#2c1f0e" }}
        transition={{ duration: 0.25 }}
      >
        {category.name}
      </motion.p>

      {/* Underline */}
      <motion.div
        style={{
          marginTop: 4,
          height: 2,
          borderRadius: 999,
          background: "#b45309",
          originX: 0.5,
        }}
        animate={{ width: hovered ? 28 : 0 }}
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
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Responsive values
  const isMobile = cardWidth < 100;
  const isSmallTablet = cardWidth < 140;
  const padding = isMobile
    ? "2rem 1rem 2.5rem"
    : isSmallTablet
    ? "3rem 1.5rem 3.5rem"
    : "4rem 2rem 4.5rem";

  // Gap between cards
  const gap = isMobile ? 16 : isSmallTablet ? 16 : cardWidth < 180 ? 24 : 40;

  // Row gap (vertical spacing between rows)
  const rowGap = isMobile ? 24 : 40;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{
        background: "#f5ede0",
        padding,
      }}
    >
      {/* Background blobs */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: -80,
          left: -80,
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: -60,
          right: -60,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(180,83,9,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div
          className="text-center"
          style={{ marginBottom: isMobile ? "1.75rem" : "2.75rem" }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <p
            style={{
              fontSize: isMobile ? 13 : 18,
              fontWeight: 600,
              letterSpacing: "0.08em",
              fontFamily: "Georgia, 'Times New Roman', serif",
              color: "#7a5c3a",
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            Something for Everyone
          </p>
          <h2
            style={{
              fontSize: isMobile ? 26 : 42,
              fontWeight: 700,
              color: "#356603",
              lineHeight: 1.1,
              fontFamily: "Georgia, 'Times New Roman', serif",
              margin: 0,
            }}
          >
            Shop by Category
          </h2>
        </motion.div>

        {/* Grid — 4 cards per row, wraps to next row automatically */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isSmallTablet
              ? "repeat(3, 1fr)"          // mobile + small tablet: 3 per row
              : "repeat(4, 1fr)",         // tablet+desktop: 4 per row
            gap: `${rowGap}px ${gap}px`,
            justifyItems: "center",
          }}
        >
          {categories.map((cat, i) => (
            <CircleCategoryCard
              key={cat.id}
              category={cat}
              index={i}
              inView={inView}
              cardWidth={cardWidth}
            />
          ))}
        </div>
      </div>
    </section>
  );
}