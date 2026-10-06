"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { MAX_QTY } from "@/lib/cart";

type Props = {
  value: number;
  onChange: (value: number) => void;
  /** Con min=0, bajar de 1 quita el producto. */
  min?: number;
  max?: number;
  label: string;
  className?: string;
  /** Permite escribir la cantidad (ej. 15) en vez de tocar + muchas veces. */
  editable?: boolean;
};

const buttonClass =
  "grid size-11 place-items-center rounded-full transition hover:bg-brand-50 disabled:opacity-35";

export function Stepper({
  value,
  onChange,
  min = 1,
  max = MAX_QTY,
  label,
  className = "",
  editable = false,
}: Props) {
  // Texto que se está escribiendo; null = mostrar el valor actual.
  const [typed, setTyped] = useState<string | null>(null);

  const type = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 3);
    setTyped(digits);
    if (digits !== "") onChange(Math.min(max, Math.max(min, Number(digits))));
  };

  return (
    <div
      role="group"
      aria-label={label}
      className={`inline-flex h-12 items-center rounded-full border-2 border-line bg-white ${className}`}
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Quitar uno: ${label}`}
        className={buttonClass}
      >
        <Minus className="size-5" aria-hidden="true" />
      </button>
      {editable ? (
        <input
          inputMode="numeric"
          aria-label={`Cantidad: ${label}`}
          value={typed ?? String(value)}
          onFocus={(event) => event.target.select()}
          onChange={(event) => type(event.target.value)}
          onBlur={() => setTyped(null)}
          className="h-10 w-11 rounded-lg bg-transparent text-center font-display text-2xl font-bold tabular-nums outline-none focus:bg-brand-50"
        />
      ) : (
        <output
          aria-live="polite"
          className="min-w-8 text-center font-display text-2xl font-bold tabular-nums"
        >
          {value}
        </output>
      )}
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Agregar uno: ${label}`}
        className={buttonClass}
      >
        <Plus className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}
