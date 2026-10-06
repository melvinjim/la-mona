"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { inputClass } from "./ui";

type Props = {
  /** Nombre del campo del formulario; viaja solo con los dígitos. */
  name: string;
  /** Nombre del plato, para los lectores de pantalla. */
  label: string;
  defaultValue?: string | number;
  placeholder?: string;
  /** Precio del que parten los botones si el campo está vacío (ej. el de la categoría). */
  startFrom?: number;
  step?: number;
};

const button =
  "grid size-11 shrink-0 place-items-center rounded-full border-2 border-line bg-white transition hover:border-ink disabled:opacity-35";

/** Precio que se puede escribir o subir y bajar con los botones (de a $500 por defecto). */
export function PriceField({
  name,
  label,
  defaultValue = "",
  placeholder = "0",
  startFrom = 0,
  step = 500,
}: Props) {
  const [digits, setDigits] = useState(String(defaultValue ?? "").replace(/\D/g, ""));

  const current = digits === "" ? startFrom : Number(digits);
  const bump = (delta: number) => setDigits(String(Math.max(0, current + delta)));

  return (
    <div className="flex items-center gap-1.5" role="group" aria-label={`Precio: ${label}`}>
      <button
        type="button"
        className={button}
        disabled={current <= 0}
        aria-label={`Bajar $${step}: ${label}`}
        onClick={() => bump(-step)}
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <input
        name={name}
        inputMode="numeric"
        value={digits}
        placeholder={placeholder}
        aria-label={`Precio de ${label}`}
        onFocus={(event) => event.target.select()}
        onChange={(event) => setDigits(event.target.value.replace(/\D/g, "").slice(0, 7))}
        className={`${inputClass} min-w-0 text-center font-bold tabular-nums`}
      />
      <button
        type="button"
        className={button}
        aria-label={`Subir $${step}: ${label}`}
        onClick={() => bump(step)}
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
