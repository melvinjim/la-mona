"use client";

import { Plus } from "lucide-react";
import { useCart } from "./cart-context";

function Badge({ qty, className }: { qty: number; className: string }) {
  // La key reinicia la animación cada vez que cambia la cantidad.
  return (
    <span
      key={qty}
      aria-hidden="true"
      className={`bump absolute grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[0.7rem] font-bold leading-none text-white ${className}`}
    >
      {qty}
    </span>
  );
}

/** Botón "+" de cada plato de la lista. */
export function AddButton({ itemId }: { itemId: string }) {
  const { catalog, qtyOf, addQuick } = useCart();
  const item = catalog[itemId];
  if (!item || !item.available) return null;
  const qty = qtyOf(itemId);

  return (
    <button
      type="button"
      onClick={() => addQuick(itemId)}
      aria-label={
        qty > 0
          ? `Agregar otro: ${item.orderName} (llevas ${qty})`
          : `Agregar al pedido: ${item.orderName}`
      }
      className="relative grid size-10 shrink-0 self-center place-items-center rounded-full bg-brand-500 text-ink shadow-[0_2px_0_var(--color-brand-800)] transition hover:bg-brand-400 active:translate-y-px"
    >
      <Plus className="size-5" strokeWidth={2.75} aria-hidden="true" />
      {qty > 0 && <Badge qty={qty} className="-right-1.5 -top-1.5" />}
    </button>
  );
}

/** Etiqueta pulsable de los platos que se muestran como chips (ej. sabores de batido). */
export function AddChip({ itemId, name }: { itemId: string; name: string }) {
  const { catalog, qtyOf, addQuick } = useCart();
  const item = catalog[itemId];

  if (!item || !item.available) {
    return (
      <span className="inline-flex rounded-full border border-line bg-sand/60 px-4 py-2 text-[0.95rem] font-semibold text-ink-soft line-through">
        {name}
      </span>
    );
  }

  const qty = qtyOf(itemId);
  return (
    <button
      type="button"
      onClick={() => addQuick(itemId)}
      aria-label={
        qty > 0
          ? `Agregar otro: ${item.orderName} (llevas ${qty})`
          : `Agregar al pedido: ${item.orderName}`
      }
      className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 py-1.5 pl-4 pr-1.5 text-[0.95rem] font-semibold transition hover:border-ink active:translate-y-px"
    >
      {name}
      <span className="relative grid size-7 place-items-center rounded-full bg-brand-500 text-ink">
        <Plus className="size-4" strokeWidth={2.75} aria-hidden="true" />
        {qty > 0 && <Badge qty={qty} className="-right-1.5 -top-1.5" />}
      </span>
    </button>
  );
}
