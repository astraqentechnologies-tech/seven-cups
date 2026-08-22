import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL
const ADMIN_BASE_URL = 'https://admin.sevencups.in'

export interface Product {
  id: number | string;
  name: string;
  slug: string;
  description: string;
  price: number | string;
  image_url: string | null;
  compare_price?: number | string;
  weight_grams?: number;
}

export interface CartItem {
  id: number | string;
  user_id: number | string;
  product_id: number | string;
  quantity: number;
  created_at?: string;
  products?: Product;
}

type LocalCartItem = { product: Product; quantity: number };

type CartContextType = {
  items: CartItem[];
  itemCount: number;
  total: number;
  loading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number | string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number | string) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: number | string) => boolean;
  localItems: LocalCartItem[];
  addToLocalCart: (product: Product, quantity?: number) => void;
  removeFromLocalCart: (productId: number | string) => void;
  updateLocalQuantity: (productId: number | string, quantity: number) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

// API image URL → full URL
function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${ADMIN_BASE_URL}${url}`;
}

// API product → Cart-compatible Product shape
function normalizeCartProduct(apiProduct: any): Product {
  // Primary image dhundo
  const images: any[] = apiProduct.images ?? [];
  const primary = images.find((i: any) => i.is_primary === 1) ?? images[0];
  const imageUrl = primary ? resolveImageUrl(primary.image_url) : resolveImageUrl(apiProduct.image_url);

  return {
    id: apiProduct.id,
    name: apiProduct.name,
    slug: apiProduct.slug,
    description: apiProduct.description ?? '',
    price: apiProduct.price,
    compare_price: apiProduct.compare_price,
    image_url: imageUrl,
    weight_grams: apiProduct.weight_grams,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [localItems, setLocalItems] = useState<LocalCartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('seven_cups_cart') || '[]');
    } catch { return []; }
  });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        const rawItems: any[] = Array.isArray(data) ? data : (data?.items || data?.data || []);

        // Backend ka product field directly use karo — no static file needed
        const enrichedItems: CartItem[] = rawItems.map((item: any) => ({
          ...item,
          products: item.product
            ? normalizeCartProduct(item.product)
            : item.products ?? undefined,
        }));

        setItems(enrichedItems);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchCart();
    else setItems([]);
  }, [token, fetchCart]);

  useEffect(() => {
    localStorage.setItem('seven_cups_cart', JSON.stringify(localItems));
  }, [localItems]);

  const addToCart = async (product: Product, quantity = 1) => {
    if (!token) {
      addToLocalCart(product, quantity);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ product_id: product.id, quantity })
      });
      if (res.ok) await fetchCart();
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const updateQuantity = async (itemId: number | string, quantity: number) => {
    if (quantity < 1) { await removeFromCart(itemId); return; }
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ quantity })
      });
      if (res.ok) await fetchCart();
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const removeFromCart = async (itemId: number | string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (res.ok) await fetchCart();
    } catch (err) {
      console.error('Error removing from cart:', err);
    }
  };

  const clearCart = async () => {
    if (!token) {
      setLocalItems([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/cart`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (res.ok) setItems([]);
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  const isInCart = (productId: number | string) => {
    if (token) return items.some(i => String(i.product_id) === String(productId));
    return localItems.some(i => String(i.product.id) === String(productId));
  };

  const addToLocalCart = (product: Product, quantity = 1) => {
    setLocalItems(prev => {
      const existing = prev.find(i => String(i.product.id) === String(product.id));
      if (existing) {
        return prev.map(i =>
          String(i.product.id) === String(product.id)
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromLocalCart = (productId: number | string) => {
    setLocalItems(prev => prev.filter(i => String(i.product.id) !== String(productId)));
  };

  const updateLocalQuantity = (productId: number | string, quantity: number) => {
    if (quantity < 1) { removeFromLocalCart(productId); return; }
    setLocalItems(prev =>
      prev.map(i => String(i.product.id) === String(productId) ? { ...i, quantity } : i)
    );
  };

  const itemCount = token
    ? items.reduce((sum, i) => sum + i.quantity, 0)
    : localItems.reduce((sum, i) => sum + i.quantity, 0);

  const total = token
    ? items.reduce((sum, i) => sum + (Number(i.products?.price) || 0) * i.quantity, 0)
    : localItems.reduce((sum, i) => sum + (Number(i.product.price) || 0) * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, itemCount, total, loading,
      addToCart, updateQuantity, removeFromCart, clearCart, isInCart,
      localItems, addToLocalCart, removeFromLocalCart, updateLocalQuantity,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}