"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { buttonClass } from "@/components/button-styles";
import { ghostClass } from "./ui";

type Props = {
  children: React.ReactNode;
  /** Valor que se envía en el campo `intent` para saber qué botón se pulsó. */
  intent?: string;
  variant?: "primary" | "light" | "ghost" | "danger";
};

/** Botón de envío que se bloquea y avisa mientras el servidor guarda. */
export function SubmitButton({ children, intent, variant = "primary" }: Props) {
  const { pending } = useFormStatus();

  const base =
    variant === "ghost" ? ghostClass : `${buttonClass(variant, "md")} disabled:opacity-60`;

  return (
    <button
      type="submit"
      name={intent ? "intent" : undefined}
      value={intent}
      disabled={pending}
      className={base}
    >
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
