"use client";

import { createContext, useContext } from "react";
import type { Catalog, NewLine, ResolvedLine } from "@/lib/cart";
import type { SiteSettings } from "@/lib/types";

/** Datos que necesita el carrito para armar y enviar el pedido. */
export type CheckoutConfig = {
  /** Solo dígitos; vacío si todavía no hay número configurado. */
  whatsapp: string;
  /** Enlace al chat de Instagram, para pegar el pedido cuando no hay WhatsApp. */
  instagramUrl?: string;
  delivery: boolean;
  payments: string[];
  hours: SiteSettings["hours"];
  timeZone: string;
};

export type CartContextValue = {
  catalog: Catalog;
  checkout: CheckoutConfig;
  lines: ResolvedLine[];
  /** Cantidad de productos y total, sin contar lo agotado. */
  count: number;
  total: number;
  /** Cuántas unidades de un plato hay en el pedido (todas sus variantes). */
  qtyOf: (itemId: string) => number;
  add: (line: NewLine) => void;
  /** Agrega 1 directamente, o abre la ventana de opciones si el plato tiene qué elegir. */
  addQuick: (itemId: string) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  openCart: () => void;
};

export const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return value;
}
