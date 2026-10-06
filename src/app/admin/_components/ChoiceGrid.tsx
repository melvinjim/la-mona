"use client";

import type { ReactNode } from "react";
import { labelClass } from "./ui";

export type Choice<T extends string> = {
  value: T;
  label: string;
  hint?: string;
  icon?: ReactNode;
};

type Props<T extends string> = {
  /** Nombre del campo del formulario. */
  name: string;
  legend: string;
  hint?: string;
  choices: Choice<T>[];
  /**
   * "tiles": mosaico de 4 columnas con el dibujo arriba (íconos).
   * "cards": una tarjeta por opción, con su explicación.
   */
  variant?: "tiles" | "cards";
  /** Controlado: el padre lleva el valor. */
  value?: T;
  onChange?: (value: T) => void;
  /** Sin controlar: valor inicial; el formulario lleva la cuenta. */
  defaultValue?: T;
};

const cardBase =
  "relative flex cursor-pointer rounded-xl border-2 border-line bg-white transition hover:border-ink/40 has-[:checked]:border-ink has-[:checked]:bg-brand-50 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink";

/**
 * Elegir una opción tocándola, en vez de abrir una lista desplegable. Son botones de radio
 * de verdad (se manejan con el teclado y viajan en el formulario con su `name`).
 */
export function ChoiceGrid<T extends string>({
  name,
  legend,
  hint,
  choices,
  variant = "cards",
  value,
  onChange,
  defaultValue,
}: Props<T>) {
  const controlled = value !== undefined;

  return (
    <fieldset className="min-w-0">
      <legend className={labelClass}>{legend}</legend>
      {hint && <p className="mt-0.5 text-xs text-ink-soft">{hint}</p>}

      <div className={`mt-1.5 grid gap-2 ${variant === "tiles" ? "grid-cols-4" : ""}`}>
        {choices.map((choice) => (
          <label
            key={choice.value}
            className={`${cardBase} ${
              variant === "tiles"
                ? "flex-col items-center gap-1.5 px-1 py-3 text-center"
                : "items-start gap-3 px-3.5 py-3"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={choice.value}
              className="peer sr-only"
              {...(controlled
                ? { checked: value === choice.value, onChange: () => onChange?.(choice.value) }
                : { defaultChecked: defaultValue === choice.value })}
            />

            {variant === "tiles" ? (
              <>
                {choice.icon}
                <span className="text-xs font-bold leading-tight">{choice.label}</span>
              </>
            ) : (
              <>
                <span
                  aria-hidden="true"
                  className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 border-ink/40 bg-white after:size-2.5 after:rounded-full after:bg-ink after:opacity-0 after:content-[''] peer-checked:border-ink peer-checked:after:opacity-100"
                />
                <span className="min-w-0">
                  <span className="block text-[0.95rem] font-bold leading-snug">{choice.label}</span>
                  {choice.hint && (
                    <span className="mt-0.5 block text-xs text-ink-soft">{choice.hint}</span>
                  )}
                </span>
              </>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
