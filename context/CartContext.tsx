'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import toast from 'react-hot-toast';

interface CartItem {
  id: string;
  bienTheId?: string | null;
  ten: string;
  anh: string;
  gia: number;
  giaKhuyenMai: number;
  slug: string;
  danhMucSlug: string;
  quantity: number;
  [key: string]: any;
}

interface CartContextType {
  cartItems: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  addToCart: (product: any) => void;
  removeFromCart: (id: string, bienTheId: string | null) => void;
  updateQuantity: (id: string, bienTheId: string | null, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) setCartItems(JSON.parse(stored));
  }, []);

  function persist(items: CartItem[]) {
    localStorage.setItem('cart', JSON.stringify(items));
    setCartItems(items);
  }

  function addToCart(product: any) {
    setCartItems(prev => {
      const exists = prev.find(p => p.id === product.id && p.bienTheId === product.bienTheId);
      let next: CartItem[];
      if (exists) {
        next = prev.map(p =>
          p.id === product.id && p.bienTheId === product.bienTheId
            ? { ...p, quantity: p.quantity + (product.quantity || 1) }
            : p
        );
      } else {
        next = [...prev, { ...product, quantity: product.quantity || 1 }];
      }
      localStorage.setItem('cart', JSON.stringify(next));
      return next;
    });
    toast.success('Đã thêm vào giỏ hàng');
  }

  function removeFromCart(id: string, bienTheId: string | null) {
    setCartItems(prev => {
      const next = prev.filter(p => !(p.id === id && p.bienTheId === bienTheId));
      localStorage.setItem('cart', JSON.stringify(next));
      return next;
    });
    toast.success('Đã xóa khỏi giỏ hàng');
  }

  function updateQuantity(id: string, bienTheId: string | null, quantity: number) {
    setCartItems(prev => {
      const next = prev.map(p =>
        p.id === id && p.bienTheId === bienTheId ? { ...p, quantity } : p
      );
      localStorage.setItem('cart', JSON.stringify(next));
      return next;
    });
  }

  function clearCart() {
    persist([]);
    toast.success('Đã xóa hết giỏ hàng');
  }

  const totalQuantity = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, i) => sum + (i.giaKhuyenMai > 0 ? i.giaKhuyenMai : i.gia) * i.quantity,
    0
  );

  return (
    <CartContext.Provider value={{ cartItems, totalQuantity, totalPrice, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}