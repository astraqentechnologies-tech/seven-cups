import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
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

type Page = string;
type NavParams = Record<string, string>;

function AppInner() {
  const [page, setPage] = useState<Page>('home');
  const [params, setParams] = useState<NavParams>({});
  const [cartOpen, setCartOpen] = useState(false);

  const navigate = (p: Page, newParams?: NavParams) => {
    setPage(p);
    setParams(newParams || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const noFooterPages = ['admin'];

  return (
    <div className="font-sans">
      <Header currentPage={page} onNavigate={navigate} />

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} onNavigate={navigate} />

      <main>
        {page === 'home' && <Home onNavigate={navigate} />}
        {page === 'about' && <About onNavigate={navigate} />}
        {page === 'products' && <Products onNavigate={navigate} initialCategory={params.category} initialSearch={params.search} />}
        {page === 'product' && <ProductDetail slug={params.slug || ''} onNavigate={navigate} />}
        {page === 'contact' && <Contact />}
        {page === 'auth' && <Auth onNavigate={navigate} />}
        {page === 'cart' && <Cart onNavigate={navigate} />}
        {page === 'checkout' && <Checkout onNavigate={navigate} />}
        {page === 'account' && <Account onNavigate={navigate} />}
        {page === 'orders' && <Orders onNavigate={navigate} />}
        {page === 'admin' && <Admin onNavigate={navigate} />}
      </main>

      {!noFooterPages.includes(page) && (
        <Footer onNavigate={navigate} />
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
