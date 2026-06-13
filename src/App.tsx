import { useState } from 'react';
import { Routes, Route, useLocation, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ScrollToTop from './components/Scrolltotop';
import Header from './components/Header';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Contact from './pages/Contact';
import Auth from './pages/Auth';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import Orders from './pages/Orders';
import Admin from './pages/Admin';

function ProductDetailWrapper() {
  const { slug } = useParams<{ slug: string }>();
  return <ProductDetail slug={slug!} />;
}

function AppInner() {
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();

  const noFooterPages = ['/admin'];

  return (
    <div className="font-sans">
      <ScrollToTop />

      <Header currentPage={location.pathname} />

      <CartSidebar
        open={cartOpen}
        onClose={() => setCartOpen(false)}
      />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:slug" element={<ProductDetailWrapper />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/account" element={<Account />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      {!noFooterPages.includes(location.pathname) && (
        <Footer />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppInner />
      </CartProvider>
    </AuthProvider>
  );
}