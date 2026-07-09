"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  productId: string;
  productSlug: string;
  productName: string;
  imageUrl?: string | null;
  price: number;
  variantId?: string;
  variantInfo?: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function cartKey(shopSlug: string) {
  return `instacrm-cart-${shopSlug}`;
}

function itemKey(productId: string, variantId?: string) {
  return `${productId}:${variantId ?? "default"}`;
}

export function CartProvider({
  shopSlug,
  children,
}: {
  shopSlug: string;
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(cartKey(shopSlug));
      if (raw) setItems(JSON.parse(raw));
    } catch {
      setItems([]);
    }
    setLoaded(true);
  }, [shopSlug]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(cartKey(shopSlug), JSON.stringify(items));
  }, [items, shopSlug, loaded]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      setItems((prev) => {
        const key = itemKey(item.productId, item.variantId);
        const existing = prev.find(
          (i) => itemKey(i.productId, i.variantId) === key
        );
        if (existing) {
          return prev.map((i) =>
            itemKey(i.productId, i.variantId) === key
              ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
              : i
          );
        }
        return [...prev, { ...item, quantity: item.quantity ?? 1 }];
      });
    },
    []
  );

  const removeItem = useCallback((productId: string, variantId?: string) => {
    const key = itemKey(productId, variantId);
    setItems((prev) => prev.filter((i) => itemKey(i.productId, i.variantId) !== key));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, variantId: string | undefined, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId, variantId);
        return;
      }
      const key = itemKey(productId, variantId);
      setItems((prev) =>
        prev.map((i) =>
          itemKey(i.productId, i.variantId) === key ? { ...i, quantity } : i
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const total = useMemo(
    () => items.reduce((s, i) => s + i.price * i.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, count, total, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
