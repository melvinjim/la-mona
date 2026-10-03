"use client";

import { Check } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  addLine,
  cartSummary,
  parseCart,
  removeLine,
  resolveCart,
  setLineQty,
  type Catalog,
  type NewLine,
  type StoredLine,
} from "@/lib/cart";
import { cartStore } from "@/lib/local-store";
import { CartDrawer } from "./CartDrawer";
import { CartContext, type CartContextValue, type CheckoutConfig } from "./cart-context";
import { ProductDialog } from "./ProductDialog";

type Props = {
  catalog: Catalog;
  checkout: CheckoutConfig;
  children: ReactNode;
};

const save = (lines: StoredLine[]) => cartStore.set(JSON.stringify(lines));
const current = () => parseCart(cartStore.getSnapshot());

/**
 * Estado del pedido. Se guarda en el navegador (solo qué plato, opciones y cantidad);
 * los precios siempre se calculan con el menú vigente.
 */
export function CartProvider({ catalog, checkout, children }: Props) {
  const raw = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot,
  );
  const lines = useMemo(() => resolveCart(parseCart(raw), catalog), [raw, catalog]);
  const { count, total } = useMemo(() => cartSummary(lines), [lines]);

  const [productId, setProductId] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const announce = (text: string) => {
    window.clearTimeout(toastTimer.current);
    setToast(text);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const add = (line: NewLine) => {
    save(addLine(current(), line));
    const item = catalog[line.itemId];
    if (item) announce(`${item.name} agregado al pedido`);
  };

  const value: CartContextValue = {
    catalog,
    checkout,
    lines,
    count,
    total,
    qtyOf: (itemId) =>
      lines.reduce(
        (sum, line) =>
          line.item.id === itemId && line.status === "ok" ? sum + line.qty : sum,
        0,
      ),
    add,
    openProduct: (itemId) => {
      const item = catalog[itemId];
      if (!item || !item.available) return;
      setProductId(itemId);
    },
    setQty: (key, qty) => save(setLineQty(current(), key, qty)),
    remove: (key) => save(removeLine(current(), key)),
    clear: () => save([]),
    openCart: () => setCartOpen(true),
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      <ProductDialog itemId={productId} onClose={() => setProductId(null)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-[60] flex justify-center px-4 lg:bottom-6"
      >
        {toast && (
          <p className="anim-pop on-dark flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white shadow-pop">
            <Check className="size-4 text-emerald-400" aria-hidden="true" />
            {toast}
          </p>
        )}
      </div>
    </CartContext.Provider>
  );
}
