"use client";

import { Printer } from "lucide-react";
import { buttonClass } from "@/components/button-styles";

/** Abre el diálogo de impresión del navegador (ahí también se puede guardar como PDF). */
export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={buttonClass("dark", "md", "on-dark")}>
      <Printer className="size-5" aria-hidden="true" />
      Imprimir o guardar en PDF
    </button>
  );
}
