import {
  motion,
  AnimatePresence,
} from "motion/react";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
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
  Leaf,
  Sparkles,
  Flame,
  Wind,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";


const NAV_LINKS = [
  { label: "Home",    path: "/"         },
  { label: "Shop",    path: "/products", hasDropdown: true },
  { label: "About",   path: "/about"    },
  { label: "Contact", path: "/contact"  },
];


const PROMOS = [
  "🍃  Free shipping on orders over ₹40",
  "✨  New Spring harvest just arrived",
  "☕  Use code FIRSTCUP for 15% off",
  "🌿  100% organic, ethically sourced",
];

function PromoBar() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(p => (p + 1) % PROMOS.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="w-full overflow-hidden text-center py-2 text-xs font-medium tracking-widest relative"
      style={{ background: "linear-gradient(90deg, #1c1108, #2d1a0a, #1c1108)", color: "#fde68a" }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="block"
        >
          {PROMOS[idx]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function Logo({ scrolled }: { scrolled: boolean }) {
  return (
    <div className="flex items-center gap-2.5 group cursor-pointer flex-shrink-0 pl-4 pr-6">
      <motion.div
        className="relative w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
        whileHover={{ scale: 1.12, rotate: -6 }}
        transition={{ type: "spring", stiffness: 350, damping: 18 }}
      >
        {[0, 1].map(i => (
          <motion.div
            key={i}
            className="absolute -top-2.5 rounded-full pointer-events-none"
            style={{
              width: 2,
              left: i === 0 ? "30%" : "58%",
              background: scrolled ? "#d97706aa" : "#94a3b8aa",
            }}
            animate={{ height: [4, 10, 4], opacity: [0.3, 0.7, 0.3], y: [0, -5, 0] }}
            transition={{ duration: 1.8 + i * 0.4, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
          />
        ))}
        <img
  src={logo}
  alt="sevencups logo"
  className="w-full h-full object-contain"
/>
      </motion.div>

      <div className="flex flex-col leading-none gap-0.5 overflow-hidden">
        <motion.span
          className="font-serif font-bold tracking-wide"
          style={{ fontSize: 22, color: "#1c1917" }}
          whileHover={{ letterSpacing: "0.04em" }}
          transition={{ duration: 0.3 }}
        >
          sevencups
        </motion.span>
        
      </div>
    </div>
  );
}

function NavPill({ links }: { links: typeof NAV_LINKS }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const [shopHovered, setShopHovered] = useState(false);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useLayoutEffect(() => {
    const idx = links.findIndex(l => l.path === pathname || (l.path !== "/" && pathname.startsWith(l.path)));
    if (idx < 0) { setPillStyle({ left: 0, width: 0 }); return; }
    const btn = btnRefs.current[idx];
    const cont = containerRef.current;
    if (!btn || !cont) return;
    const br = btn.getBoundingClientRect();
    const cr = cont.getBoundingClientRect();
    setPillStyle({ left: br.left - cr.left, width: br.width });
  }, [pathname, links]);

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  return (
    <div ref={containerRef} className="hidden lg:flex flex-1 items-center justify-center gap-0 relative">
      <motion.div
        className="absolute h-8 rounded-full pointer-events-none"
        style={{ background: "rgba(217,119,6,0.1)", border: "1px solid rgba(217,119,6,0.25)" }}
        animate={{ left: pillStyle.left, width: pillStyle.width, opacity: pillStyle.width ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      />

      {links.map((link, i) => {
        const active = isActive(link.path);
        return (
          <div
            key={link.path}
            className="relative"
            onMouseEnter={() => link.hasDropdown && setShopHovered(true)}
            onMouseLeave={() => setShopHovered(false)}
          >
            <motion.button
              ref={el => { btnRefs.current[i] = el; }}
              onClick={() => navigate(link.path)}
              className="flex items-center gap-0.5 px-5 py-2 text-[13px] font-semibold tracking-widest uppercase relative z-10"
              animate={{ color: active ? "#d97706" : "#78716c" }}
              whileHover={{ color: "#1c1917" }}
              transition={{ duration: 0.2 }}
            >
              {link.label}
              {link.hasDropdown && (
                <motion.span animate={{ rotate: shopHovered ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  <ChevronDown className="w-3 h-3 mt-px opacity-70" />
                </motion.span>
              )}
            </motion.button>

            {link.hasDropdown && (
              <AnimatePresence>
                {shopHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden z-50 p-2"
                  >
                    
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

function IconBtn({
  onClick,
  label,
  children,
  badge,
  active,
}: {
  onClick?: () => void;
  label: string;
  children: React.ReactNode;
  badge?: number;
  active?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      aria-label={label}
      className="relative p-2.5 flex items-center justify-center"
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
        animate={{ color: active ? "#d97706" : hov ? "#1c1917" : "#78716c" }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.span>
      {badge !== undefined && (
        <motion.span
          key={badge}
          initial={{ scale: 1.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-1 right-0.5 min-w-[17px] h-[17px] flex items-center justify-center rounded-full text-[10px] font-bold text-white px-0.5"
          style={{ background: badge > 0 ? "#d97706" : "#a8a29e" }}
        >
          {badge > 9 ? "9+" : badge}
        </motion.span>
      )}
    </motion.button>
  );
}

function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");

  // ← FIX: close hote hi q clear ho jata hai
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
            className="fixed top-20 left-1/2 z-50 w-full max-w-xl px-4"
            style={{ translateX: "-50%" }}
            initial={{ y: -24, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -16, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <div
              className="flex items-center gap-3 bg-white rounded-2xl shadow-2xl px-5 py-4 border border-amber-100"
            >
              <Search className="w-5 h-5 text-amber-500 flex-shrink-0" strokeWidth={1.75} />
              <input
                autoFocus
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && q.trim()) onClose(); }}
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

function MobileDrawer({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: () => void;
  user: { name: string } | null;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const go = (path: string) => { navigate(path); onClose(); };

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
            <div className="flex items-center justify-between px-5 py-5 border-b border-stone-100">
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
                const active = link.path === "/" ? pathname === "/" : pathname.startsWith(link.path);
                return (
                  <motion.button
                    key={link.path}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 + 0.1 }}
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
                    { label: "My Account", path: "/account", Icon: User },
                    { label: "My Orders",  path: "/orders",  Icon: Package },
                  ].map(({ label, path, Icon }, i) => (
                    <motion.button
                      key={path}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (NAV_LINKS.length + i) * 0.07 + 0.1 }}
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
                    transition={{ delay: 0.42 }}
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

function UserMenu({ user }: { user: { name: string } | null }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <IconBtn onClick={() => navigate("/auth")} label="Login">
        <User className="w-[26px] h-[26px]" strokeWidth={1.6} />
      </IconBtn>
    );
  }

  return (
    <div className="relative hidden sm:block">
      <IconBtn onClick={() => setOpen(p => !p)} label="Account" active={open}>
        <div className="flex items-center gap-1">
          <User className="w-5 h-5" strokeWidth={1.6} />
          <span className="text-[13px] font-medium hidden md:block">{user.name.split(" ")[0]}</span>
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
                { label: "My Account", path: "/account", Icon: User },
                { label: "My Orders",  path: "/orders",  Icon: Package },
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
      <PromoBar />

      <motion.header
        className="w-full sticky top-0 z-50"
        animate={{
          background: scrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,1)",
          backdropFilter: scrolled ? "blur(14px)" : "blur(0px)",
          boxShadow: scrolled
            ? "0 2px 32px rgba(120,53,15,0.10), 0 1px 0 rgba(217,119,6,0.12)"
            : "0 1px 0 rgba(0,0,0,0.06)",
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] rounded-full pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, #f59e0b, #d97706, transparent)" }}
          animate={{ right: scrolled ? "0%" : "100%", opacity: scrolled ? 1 : 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />

        <div className="flex items-center h-[70px] w-full">
          <motion.div onClick={() => navigate("/")} whileTap={{ scale: 0.97 }} className="cursor-pointer">
            <Logo scrolled={scrolled} />
          </motion.div>

          <NavPill links={NAV_LINKS} />

          <div className="flex items-center gap-0 ml-auto pr-3">
            <IconBtn onClick={() => setSearchOpen(true)} label="Search" active={searchOpen}>
              <Search className="w-[26px] h-[26px]" strokeWidth={1.6} />
            </IconBtn>

            <div className="hidden sm:block">
              <UserMenu user={displayUser} />
            </div>

            <div className="hidden sm:block">
              <IconBtn onClick={handleWish} label="Wishlist">
                <motion.span
                  animate={wishPulse ? { scale: [1, 1.4, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <Heart
                    className="w-[26px] h-[26px]"
                    strokeWidth={1.6}
                    style={{ fill: wishPulse ? "#f87171" : "none", color: wishPulse ? "#f87171" : undefined }}
                  />
                </motion.span>
              </IconBtn>
            </div>

            <IconBtn onClick={() => navigate("/cart")} label="Cart" badge={itemCount}>
              <ShoppingCart className="w-[26px] h-[26px]" strokeWidth={1.6} />
            </IconBtn>

            <div className="lg:hidden">
              <IconBtn onClick={() => setMenuOpen(true)} label="Menu">
                <motion.span animate={{ rotate: menuOpen ? 90 : 0 }} transition={{ duration: 0.25 }}>
                  <Menu className="w-[22px] h-[22px]" strokeWidth={1.75} />
                </motion.span>
              </IconBtn>
            </div>
          </div>
        </div>
      </motion.header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} user={displayUser} />
    </>
  );
}