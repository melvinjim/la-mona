"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { buttonClass } from "@/components/button-styles";

type Props = {
  children: React.ReactNode;
  /** Valor que se envía en el campo `intent` para saber qué botón se pulsó. */
  intent?: string;
  variant?: "primary" | "light" | "ghost";
  confirm?: string;
};

/** Botón de envío que se bloquea y avisa mientras el servidor guarda. */
export function SubmitButton({
  children,
  intent,
  variant = "primary",
  confirm,
}: Props) {
  const { pending } = useFormStatus();

  const base =
    variant === "ghost"
      ? "inline-flex items-center justify-center gap-2 rounded-full border-2 border-line px-4 py-2 text-sm font-bold transition hover:border-ink disabled:opacity-50"
      : `${buttonClass(variant === "light" ? "light" : "primary", "md")} disabled:opacity-60`;

  return (
    <button
      type="submit"
      name={intent ? "intent" : undefined}
      value={intent}
      disabled={pending}
      onClick={(event) => {
        if (confirm && !window.confirm(confirm)) event.preventDefault();
      }}
      className={base}
    >
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
