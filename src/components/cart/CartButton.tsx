"use client";

import { ShoppingBag } from "lucide-react";
import { formatCOP } from "@/lib/format";
import { buttonClass } from "../button-styles";
import { useCart } from "./cart-context";

/** Botón "Mi pedido" del encabezado (escritorio). */
export function CartButton() {
  const { count, total, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={
        count > 0
          ? `Mi pedido: ${count} ${count === 1 ? "producto" : "productos"}, total ${formatCOP(total)}`
          : "Mi pedido (vacío)"
      }
      className={buttonClass("dark", "md", "on-dark")}
    >
      <ShoppingBag className="size-5" aria-hidden="true" />
      Mi pedido
      {count > 0 && (
        <>
          <span
            key={count}
            aria-hidden="true"
            className="bump grid h-6 min-w-6 place-items-center rounded-full bg-brand-500 px-1.5 text-sm font-bold leading-none text-ink"
          >
            {count}
          </span>
          <span aria-hidden="true" className="font-display text-xl leading-none text-brand-400">
            {formatCOP(total)}
          </span>
        </>
      )}
    </button>
  );
}
