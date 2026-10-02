"use client";

import { Minus, Plus } from "lucide-react";
import { MAX_QTY } from "@/lib/cart";

type Props = {
  value: number;
  onChange: (value: number) => void;
  /** Con min=0, bajar de 1 quita el producto. */
  min?: number;
  label: string;
  className?: string;
};

export function Stepper({ value, onChange, min = 1, label, className = "" }: Props) {
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
        className="grid size-11 place-items-center rounded-full transition hover:bg-brand-50 disabled:opacity-35"
      >
        <Minus className="size-5" aria-hidden="true" />
      </button>
      <output
        aria-live="polite"
        className="min-w-8 text-center font-display text-2xl font-bold tabular-nums"
      >
        {value}
      </output>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QTY}
        aria-label={`Agregar uno: ${label}`}
        className="grid size-11 place-items-center rounded-full transition hover:bg-brand-50 disabled:opacity-35"
      >
        <Plus className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}
