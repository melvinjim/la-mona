"use client";

import { useState, type ReactNode } from "react";
import { SubmitButton } from "./SubmitButton";
import { ghostClass } from "./ui";

type Props = {
  /** Lo que se pregunta antes de hacerlo. Va en la misma página, no en una ventana del navegador. */
  question: string;
  /** Texto del botón que confirma. Dice qué va a pasar, no "Aceptar". */
  confirmLabel: string;
  /** Contenido del botón que abre la pregunta. */
  children: ReactNode;
  /** Nombre para lectores de pantalla cuando el botón es solo un ícono. */
  label?: string;
  /** Estilo del botón que abre la pregunta. */
  className?: string;
  /** Guarda en el servidor: envía el formulario con este `intent`. */
  intent?: string;
  /** O se resuelve aquí mismo, sin guardar (ej. quitar un grupo del editor). */
  onConfirm?: () => void;
};

/**
 * Confirmación para lo que no se puede deshacer (eliminar un plato, una categoría, un grupo).
 *
 * El botón se reemplaza por la pregunta y dos botones, dentro de la misma página: la ventana del
 * navegador ("la-mona.vercel.app dice…") no se puede diseñar, sale fuera de contexto y no dice
 * de qué se está hablando. El foco empieza en Cancelar, así que un Enter de más no borra nada.
 */
export function ConfirmAction({
  question,
  confirmLabel,
  children,
  label,
  className = ghostClass,
  intent,
  onConfirm,
}: Props) {
  const [asking, setAsking] = useState(false);

  if (!asking) {
    return (
      <button
        type="button"
        aria-label={label}
        onClick={() => setAsking(true)}
        className={className}
      >
        {children}
      </button>
    );
  }

  return (
    <span
      role="group"
      aria-label={question}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          setAsking(false);
        }
      }}
      className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-3 py-2"
    >
      <span className="text-sm font-bold text-red-900">{question}</span>

      {intent ? (
        <SubmitButton intent={intent} variant="danger">
          {confirmLabel}
        </SubmitButton>
      ) : (
        <button
          type="button"
          onClick={() => {
            setAsking(false);
            onConfirm?.();
          }}
          className="h-11 rounded-full bg-red-700 px-5 text-[0.95rem] font-bold text-white shadow-[0_3px_0_rgb(127_29_29)] transition hover:bg-red-800 active:translate-y-px"
        >
          {confirmLabel}
        </button>
      )}

      <button
        type="button"
        autoFocus
        onClick={() => setAsking(false)}
        className="h-11 rounded-full bg-white px-5 text-[0.95rem] font-bold text-ink ring-2 ring-line transition hover:ring-ink/30"
      >
        Cancelar
      </button>
    </span>
  );
}
