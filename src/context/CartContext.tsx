import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase, CartItem, Product } from '../lib/supabase';
import { useAuth } from './AuthContext';

type CartContextType = {
  items: CartItem[];
  itemCount: number;
  total: number;
  loading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
  localItems: LocalCartItem[];
  addToLocalCart: (product: Product, quantity?: number) => void;
  removeFromLocalCart: (productId: string) => void;
  updateLocalQuantity: (productId: string, quantity: number) => void;
};

type LocalCartItem = { product: Product; quantity: number };

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [localItems, setLocalItems] = useState<LocalCartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('luminary_cart') || '[]');
    } catch { return []; }
  });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('cart_items')
      .select('*, products(*, categories(*))')
      .eq('user_id', user.id);
    setItems((data as CartItem[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) fetchCart();
    else setItems([]);
  }, [user, fetchCart]);

  useEffect(() => {
    localStorage.setItem('luminary_cart', JSON.stringify(localItems));
  }, [localItems]);

  const addToCart = async (product: Product, quantity = 1) => {
    if (!user) {
      addToLocalCart(product, quantity);
      return;
    }
    const existing = items.find(i => i.product_id === product.id);
    if (existing) {
      await supabase.from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
    } else {
      await supabase.from('cart_items')
        .insert({ user_id: user.id, product_id: product.id, quantity });
    }
    await fetchCart();
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) { await removeFromCart(itemId); return; }
    await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
    await fetchCart();
  };

  const removeFromCart = async (itemId: string) => {
    await supabase.from('cart_items').delete().eq('id', itemId);
    await fetchCart();
  };

  const clearCart = async () => {
    if (!user) return;
    await supabase.from('cart_items').delete().eq('user_id', user.id);
    setItems([]);
  };

  const isInCart = (productId: string) => {
    if (user) return items.some(i => i.product_id === productId);
    return localItems.some(i => i.product.id === productId);
  };

  const addToLocalCart = (product: Product, quantity = 1) => {
    setLocalItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      return [...prev, { product, quantity }];
    });
  };

  const removeFromLocalCart = (productId: string) => {
    setLocalItems(prev => prev.filter(i => i.product.id !== productId));
  };

  const updateLocalQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) { removeFromLocalCart(productId); return; }
    setLocalItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
  };

  const itemCount = user
    ? items.reduce((sum, i) => sum + i.quantity, 0)
    : localItems.reduce((sum, i) => sum + i.quantity, 0);

  const total = user
    ? items.reduce((sum, i) => sum + (i.products?.price ?? 0) * i.quantity, 0)
    : localItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

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
