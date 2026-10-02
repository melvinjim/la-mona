"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useId, useState, type FormEvent } from "react";
import {
  MAX_NOTE,
  missingGroups,
  pickedOptionIds,
  pickedSurcharge,
  type CatalogItem,
  type Picked,
} from "@/lib/cart";
import { formatCOP } from "@/lib/format";
import type { OptionGroup } from "@/lib/types";
import { buttonClass } from "../button-styles";
import { Modal } from "../Modal";
import { useCart } from "./cart-context";
import { Stepper } from "./Stepper";

type Props = {
  itemId: string | null;
  onClose: () => void;
};

export function ProductDialog({ itemId, onClose }: Props) {
  const { catalog } = useCart();
  const item = itemId ? catalog[itemId] : undefined;

  return (
    <Modal
      open={item !== undefined}
      onClose={onClose}
      label={item ? `Agregar ${item.name} al pedido` : "Agregar al pedido"}
      variant="sheet"
    >
      {item && <ProductForm key={item.id} item={item} onClose={onClose} />}
    </Modal>
  );
}

function ProductForm({
  item,
  onClose,
}: {
  item: CatalogItem;
  onClose: () => void;
}) {
  const { add } = useCart();
  const formId = useId();
  const [picked, setPicked] = useState<Picked>({});
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [tried, setTried] = useState(false);

  const missing = missingGroups(item, picked);
  const unitPrice = item.price + pickedSurcharge(item, picked);

  const choose = (group: OptionGroup, optionId: string) => {
    setPicked((current) => {
      const selected = current[group.id] ?? [];
      if (!group.multiple) return { ...current, [group.id]: [optionId] };
      return {
        ...current,
        [group.id]: selected.includes(optionId)
          ? selected.filter((id) => id !== optionId)
          : [...selected, optionId],
      };
    });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (missing.length > 0) {
      setTried(true);
      document
        .getElementById(`${formId}-${missing[0].id}`)
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    add({
      itemId: item.id,
      optionIds: pickedOptionIds(item, picked),
      note,
      qty,
    });
    onClose();
  };

  return (
    <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute right-3 top-3 z-10 grid size-11 place-items-center rounded-full bg-white/95 text-ink shadow-md ring-1 ring-line transition hover:bg-brand-50"
      >
        <X className="size-5" aria-hidden="true" />
      </button>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {item.image && (
          <div className="relative aspect-[16/9] bg-sand">
            <Image
              src={item.image}
              alt=""
              fill
              sizes="(min-width: 640px) 512px, 100vw"
              className="object-cover"
            />
          </div>
        )}

        <div className="px-5 pb-5 pt-6 sm:px-7">
          <p className="pr-12 text-xs font-bold uppercase tracking-[0.16em] text-ink-soft">
            {item.categoryName}
          </p>
          <h2 className="mt-1 pr-12 font-display text-[2.5rem] font-extrabold uppercase leading-[0.95]">
            {item.name}
          </h2>
          <p className="mt-1 font-display text-2xl font-bold text-brand-700">
            {formatCOP(item.price)}
          </p>
          {item.description && (
            <p className="mt-2 text-[0.95rem] text-ink-soft">{item.description}</p>
          )}

          {item.includes.length > 0 && (
            <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
                Incluye
              </p>
              <p className="mt-1 text-[0.95rem] font-semibold">
                {item.includes.join(" · ")}
              </p>
            </div>
          )}

          {item.options.map((group) => {
            const groupMissing = tried && missing.some((g) => g.id === group.id);
            return (
              <fieldset
                key={group.id}
                id={`${formId}-${group.id}`}
                className="mt-6 min-w-0"
              >
                <legend className="mb-2 flex w-full items-baseline justify-between gap-3">
                  <span className="font-display text-xl font-bold uppercase tracking-wide">
                    {group.title}
                  </span>
                  <span
                    className={`text-sm font-semibold ${groupMissing ? "text-red-700" : "text-ink-soft"}`}
                  >
                    {groupMissing
                      ? "Elige una opción"
                      : group.required
                        ? "Elige una"
                        : "Opcional"}
                  </span>
                </legend>
                <div className="space-y-2">
                  {group.options.map((option) => (
                    <label
                      key={option.id}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-line bg-white px-4 py-3 transition hover:border-ink/40 has-[:checked]:border-ink has-[:checked]:bg-brand-50 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink"
                    >
                      <input
                        type={group.multiple ? "checkbox" : "radio"}
                        name={`${formId}-${group.id}`}
                        checked={picked[group.id]?.includes(option.id) ?? false}
                        onChange={() => choose(group, option.id)}
                        className="size-5 shrink-0 accent-ink"
                      />
                      <span className="text-base font-semibold">{option.name}</span>
                      {(option.price || group.options.some((o) => o.price)) && (
                        <span
                          className={`ml-auto text-sm font-bold ${option.price ? "text-brand-700" : "text-emerald-700"}`}
                        >
                          {option.price ? `+${formatCOP(option.price)}` : "Incluido"}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </fieldset>
            );
          })}

          <label className="mt-6 block">
            <span className="font-display text-xl font-bold uppercase tracking-wide">
              Nota <span className="font-sans text-sm font-semibold normal-case tracking-normal text-ink-soft">(opcional)</span>
            </span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={MAX_NOTE}
              rows={2}
              placeholder={
                item.includes.length > 0
                  ? "Ej: bebida de mora, sin cebolla"
                  : "Ej: sin cebolla, bien asado"
              }
              className="mt-2 w-full resize-none rounded-2xl border-2 border-line bg-white px-4 py-3 text-base outline-none transition placeholder:text-ink-soft/60 focus:border-ink"
            />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line bg-white px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 sm:px-7">
        <Stepper value={qty} onChange={setQty} label={item.name} />
        <button type="submit" className={buttonClass("primary", "lg", "min-w-0 flex-1")}>
          <span className="truncate">Agregar</span>
          <span className="font-display text-2xl leading-none">
            {formatCOP(unitPrice * qty)}
          </span>
        </button>
      </div>
    </form>
  );
}
