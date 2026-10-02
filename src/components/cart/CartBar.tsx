"use client";

import { ShoppingBag } from "lucide-react";
import { formatCOP } from "@/lib/format";
import { useCart } from "./cart-context";

/** Barra inferior para celular y tablet: aparece al agregar el primer plato. */
export function CartBar() {
  const { count, total, openCart } = useCart();
  const visible = count > 0;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden">
      <button
        type="button"
        onClick={openCart}
        aria-label={`Ver mi pedido: ${count} ${count === 1 ? "producto" : "productos"}, total ${formatCOP(total)}`}
        className={`on-dark pointer-events-auto flex h-14 w-full items-center gap-3 rounded-full bg-ink pl-2 pr-5 text-white shadow-pop ring-2 ring-white/90 transition duration-300 ${
          visible ? "translate-y-0 opacity-100" : "invisible translate-y-6 opacity-0"
        }`}
      >
        <span className="relative grid size-10 place-items-center rounded-full bg-brand-500 text-ink">
          <ShoppingBag className="size-5" aria-hidden="true" />
          <span
            key={count}
            aria-hidden="true"
            className="bump absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[0.7rem] font-bold leading-none text-ink ring-2 ring-ink"
          >
            {count}
          </span>
        </span>
        <span className="text-base font-bold">Ver mi pedido</span>
        <span className="ml-auto font-display text-2xl font-bold text-brand-400">
          {formatCOP(total)}
        </span>
      </button>
    </div>
  );
}
