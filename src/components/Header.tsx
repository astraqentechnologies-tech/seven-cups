import {
  motion,
  AnimatePresence,
} from "motion/react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Search,
  Heart,
  ChevronDown,
  LogOut,
  Package,
  Settings,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

// ─── Nav links ────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Bestseller",        path: "/bestseller"                        },
  { label: "Sampler Pack",      path: "/sampler"                           },
  { label: "Wellness",          path: "/wellness",  hasDropdown: true      },
  { label: "New Arrivals",      path: "/products"                          },
  { label: "Combo",             path: "/combo"                             },
  { label: "Corporate Gifting", path: "/corporate"                         },
  { label: "About Us",          path: "/about"                             },
  { label: "Blog",              path: "/blog"                              },
  { label: "Contact",           path: "/contact"                           },
];

// ─── Promo messages ───────────────────────────────────────────────────────────
const PROMOS = [
  "🎁  Free shipping on orders over ₹40",
  "🎉  New Spring harvest just arrived",
  "☕  Use code FIRSTCUP for 15% off",
  "🌿  100% organic, ethically sourced",
];

// ─── Promo Bar (continuous marquee) ──────────────────────────────────────────
function PromoBar() {
  const items = [...PROMOS, ...PROMOS, ...PROMOS];

  return (
    <div
      className="w-full overflow-hidden py-4 relative"
      style={{
        background: "linear-gradient(90deg, #1c1108, #2d1a0a, #1c1108)",
        color: "#fde68a",
      }}
    >
      <motion.div
        className="flex whitespace-nowrap gap-8 text-[18px] font-medium tracking-widest"
        animate={{ x: ["0%", "-33.33%"] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
      >
        {items.map((promo, i) => (
          <span key={i} className="flex-shrink-0 flex items-center gap-3">
            {promo}
            <span className="opacity-40 mx-1">•</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo({ size = "default" }) {
  const isSmall = size === "small";
  return (
    <div className="flex items-center gap-2 cursor-pointer flex-shrink-0">
      <img
        src={logo}
        alt="sevencups logo"
        className={isSmall ? "w-10 h-10 object-contain" : "w-14 h-14 object-contain"}
      />
      <span
        className="font-serif font-bold tracking-wide"
        style={{
          fontSize: isSmall ? 20 : 26,
          color: "#1c1917",
        }}
      >
        sevencups
      </span>
    </div>
  );
}

// ─── Icon Button ──────────────────────────────────────────────────────────────
function IconBtn({
  onClick,
  label,
  children,
  badge,
  active,
}) {
  const [hov, setHov] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      aria-label={label}
      className="relative p-2 flex items-center justify-center"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      whileTap={{ scale: 0.88 }}
    >
      <motion.span
        className="absolute inset-0 rounded-full"
        animate={{
          background: active || hov ? "rgba(217,119,6,0.1)" : "transparent",
          scale: hov ? 1 : 0.7,
          opacity: hov || active ? 1 : 0,
        }}
        transition={{ duration: 0.25 }}
      />
      <motion.span
        className="relative"
        animate={{ color: active ? "#d97706" : hov ? "#1c1917" : "#44403c" }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.span>
      {badge !== undefined && (
        <motion.span
          key={badge}
          initial={{ scale: 1.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-0.5 right-0 min-w-[16px] h-[16px] flex items-center justify-center rounded-full text-[9px] font-bold text-white px-0.5"
          style={{ background: badge > 0 ? "#d97706" : "#a8a29e" }}
        >
          {badge > 9 ? "9+" : badge}
        </motion.span>
      )}
    </motion.button>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
function BottomNav({ links }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [shopHovered, setShopHovered] = useState(null);

  const isActive = (path) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  return (
    <div className="hidden lg:flex items-center justify-center w-full border-t border-stone-100">
      {links.map((link) => {
        const active = isActive(link.path);
        return (
          <div
            key={link.path}
            className="relative"
            onMouseEnter={() => link.hasDropdown && setShopHovered(link.path)}
            onMouseLeave={() => setShopHovered(null)}
          >
            <motion.button
              onClick={() => navigate(link.path)}
              className="relative flex items-center gap-0.5 px-4 py-3.5 text-[11.5px] font-semibold tracking-widest uppercase"
              animate={{ color: active ? "#d97706" : "#44403c" }}
              whileHover={{ color: "#d97706" }}
              transition={{ duration: 0.18 }}
            >
              {link.label}
              {link.hasDropdown && (
                <motion.span
                  animate={{ rotate: shopHovered === link.path ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ChevronDown className="w-3 h-3 mt-px opacity-60" />
                </motion.span>
              )}
              {/* Amber underline on active */}
              <motion.span
                className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                style={{ background: "#d97706" }}
                initial={false}
                animate={{ scaleX: active ? 1 : 0, opacity: active ? 1 : 0 }}
                transition={{ duration: 0.25 }}
              />
            </motion.button>

            {link.hasDropdown && (
              <AnimatePresence>
                {shopHovered === link.path && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-52 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden z-50 p-2"
                  >
                    {/* Add dropdown items here */}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Search Overlay ───────────────────────────────────────────────────────────
function SearchOverlay({ open, onClose }) {
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(28,17,8,0.55)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-28 left-1/2 z-50 w-full max-w-xl px-4"
            style={{ translateX: "-50%" }}
            initial={{ y: -24, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -16, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <div className="flex items-center gap-3 bg-white rounded-2xl shadow-2xl px-4 py-3.5 border border-amber-100">
              <Search className="w-5 h-5 text-amber-500 flex-shrink-0" strokeWidth={1.75} />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && q.trim()) onClose(); }}
                placeholder="Search teas, blends, origins…"
                className="flex-1 bg-transparent text-stone-900 placeholder-stone-400 text-sm outline-none"
              />
              {q && (
                <motion.button
                  type="button"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => setQ("")}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X size={15} />
                </motion.button>
              )}
              <motion.button
                onClick={() => { if (q.trim()) onClose(); }}
                className="px-4 py-1.5 rounded-xl text-sm font-semibold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Search
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── User Menu ────────────────────────────────────────────────────────────────
function UserMenu({ user }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <IconBtn onClick={() => navigate("/auth")} label="Login">
        <User className="w-[20px] h-[20px]" strokeWidth={1.6} />
      </IconBtn>
    );
  }

  return (
    <div className="relative">
      <IconBtn onClick={() => setOpen((p) => !p)} label="Account" active={open}>
        <div className="flex items-center gap-1">
          <User className="w-[20px] h-[20px]" strokeWidth={1.6} />
          <span className="text-[12px] font-medium hidden md:block">
            {user.name.split(" ")[0]}
          </span>
        </div>
      </IconBtn>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              className="absolute right-0 top-full mt-2 w-52 bg-white border border-stone-100 rounded-2xl shadow-2xl overflow-hidden z-50"
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">
                <p className="text-sm font-bold text-stone-800">{user.name}</p>
                <p className="text-xs text-amber-600">Tea Enthusiast</p>
              </div>
              {[
                { label: "My Account", path: "/account",  Icon: User     },
                { label: "My Orders",  path: "/orders",   Icon: Package  },
                { label: "Settings",   path: "/settings", Icon: Settings },
              ].map(({ label, path, Icon }) => (
                <motion.button
                  key={path}
                  onClick={() => { navigate(path); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 hover:text-amber-600 transition-colors"
                  whileHover={{ x: 3 }}
                >
                  <Icon size={14} className="opacity-60" />
                  {label}
                </motion.button>
              ))}
              <div className="border-t border-stone-100" />
              <motion.button
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                whileHover={{ x: 3 }}
              >
                <LogOut size={14} className="opacity-70" />
                Sign Out
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Mobile Drawer ────────────────────────────────────────────────────────────
function MobileDrawer({ open, onClose, user }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const go = (path) => { navigate(path); onClose(); };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(28,17,8,0.5)", backdropFilter: "blur(3px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-0 right-0 h-full w-72 z-50 bg-white shadow-2xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <span className="font-serif font-bold text-stone-900 text-lg">Menu</span>
              <motion.button
                onClick={onClose}
                whileTap={{ scale: 0.85, rotate: 90 }}
                transition={{ duration: 0.2 }}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X size={18} />
              </motion.button>
            </div>

            <nav className="flex flex-col px-4 py-4 gap-1 flex-1 overflow-y-auto">
              {NAV_LINKS.map((link, i) => {
                const active =
                  link.path === "/" ? pathname === "/" : pathname.startsWith(link.path);
                return (
                  <motion.button
                    key={link.path}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.08 }}
                    onClick={() => go(link.path)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors text-left"
                    style={{
                      background: active ? "rgba(217,119,6,0.08)" : "transparent",
                      color: active ? "#d97706" : "#44403c",
                    }}
                    whileHover={{ background: "rgba(217,119,6,0.06)", color: "#d97706", x: 4 }}
                  >
                    {link.label}
                    {active && (
                      <motion.span
                        layoutId="drawer-active"
                        className="w-1.5 h-1.5 rounded-full bg-amber-500"
                      />
                    )}
                  </motion.button>
                );
              })}

              <div className="my-3 h-px bg-stone-100" />

              {user ? (
                <>
                  {[
                    { label: "My Account", path: "/account", Icon: User    },
                    { label: "My Orders",  path: "/orders",  Icon: Package },
                  ].map(({ label, path, Icon }, i) => (
                    <motion.button
                      key={path}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (NAV_LINKS.length + i) * 0.05 + 0.08 }}
                      onClick={() => go(path)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-stone-600 hover:bg-stone-50 hover:text-amber-600 transition-colors"
                      whileHover={{ x: 4 }}
                    >
                      <Icon size={15} />
                      {label}
                    </motion.button>
                  ))}
                  <motion.button
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    <LogOut size={15} />
                    Sign Out
                  </motion.button>
                </>
              ) : (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  onClick={() => go("/auth")}
                  className="mt-2 px-4 py-3 rounded-xl text-sm font-bold text-white text-center"
                  style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Sign In / Register
                </motion.button>
              )}
            </nav>

            <div className="px-5 py-4 border-t border-stone-100">
              <p className="text-xs text-stone-400 tracking-widest text-center">
                🍃 Ethically sourced since 2016
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main Header ──────────────────────────────────────────────────────────────
export default function Header() {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { user } = useAuth();

  const [menuOpen, setMenuOpen]     = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [wishPulse, setWishPulse]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleWish = () => {
    setWishPulse(true);
    setTimeout(() => setWishPulse(false), 600);
  };

  const displayUser = user ? { name: user.email?.split("@")[0] || "User" } : null;

  return (
    <>
      {/* Row 1 — Promo marquee */}
      <PromoBar />

      <motion.header
        className="w-full sticky top-0 z-50 bg-white"
        animate={{
          boxShadow: scrolled
            ? "0 2px 24px rgba(120,53,15,0.10), 0 1px 0 rgba(217,119,6,0.10)"
            : "0 1px 0 rgba(0,0,0,0.06)",
        }}
        transition={{ duration: 0.3 }}
      >
        {/* ── Mobile Row: Hamburger | Logo (centered) | Icons ── */}
        <div className="lg:hidden relative flex items-center w-full px-3 py-3">

          {/* Left — hamburger, fixed width to balance right side */}
          <div className="flex items-center" style={{ minWidth: 44 }}>
            <IconBtn onClick={() => setMenuOpen(true)} label="Menu">
              <motion.span
                animate={{ rotate: menuOpen ? 90 : 0 }}
                transition={{ duration: 0.25 }}
              >
                <Menu className="w-[20px] h-[20px]" strokeWidth={1.75} />
              </motion.span>
            </IconBtn>
          </div>

          {/* Center — Logo absolutely centered in viewport */}
          <div
            onClick={() => navigate("/")}
            className="absolute left-1/2 -translate-x-1/2 cursor-pointer"
          >
            <Logo size="small" />
          </div>

          {/* Right — search + cart icons, fixed width to balance left side */}
          <div className="flex items-center gap-0.5 ml-auto">
            <IconBtn onClick={() => setSearchOpen(true)} label="Search" active={searchOpen}>
              <Search className="w-[20px] h-[20px]" strokeWidth={1.6} />
            </IconBtn>
            <UserMenu user={displayUser} />
            <IconBtn onClick={() => navigate("/cart")} label="Cart" badge={itemCount}>
              <ShoppingCart className="w-[20px] h-[20px]" strokeWidth={1.6} />
            </IconBtn>
          </div>
        </div>

        {/* ── Desktop Row: Logo center, icons right ── */}
        <div className="hidden lg:flex relative items-center w-full px-10 py-4">

          {/* Left spacer */}
          <div className="flex-1" />

          {/* Center — Logo absolutely centered */}
          <div
            onClick={() => navigate("/")}
            className="absolute left-1/2 -translate-x-1/2 cursor-pointer"
          >
            <Logo />
          </div>

          {/* Right — action icons */}
          <div className="flex items-center gap-1 ml-auto">
            <IconBtn onClick={() => setSearchOpen(true)} label="Search" active={searchOpen}>
              <Search className="w-[22px] h-[22px]" strokeWidth={1.6} />
            </IconBtn>

            <UserMenu user={displayUser} />

            <IconBtn onClick={handleWish} label="Wishlist">
              <motion.span
                animate={wishPulse ? { scale: [1, 1.4, 1] } : {}}
                transition={{ duration: 0.4 }}
              >
                <Heart
                  className="w-[22px] h-[22px]"
                  strokeWidth={1.6}
                  style={{
                    fill: wishPulse ? "#f87171" : "none",
                    color: wishPulse ? "#f87171" : undefined,
                  }}
                />
              </motion.span>
            </IconBtn>

            <IconBtn onClick={() => navigate("/cart")} label="Cart" badge={itemCount}>
              <ShoppingCart className="w-[22px] h-[22px]" strokeWidth={1.6} />
            </IconBtn>
          </div>
        </div>

        {/* Row 3 — Full-width nav (desktop only) */}
        <BottomNav links={NAV_LINKS} />
      </motion.header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} user={displayUser} />
    </>
  );
}