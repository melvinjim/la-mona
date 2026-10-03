"use client";

import { useEffect, useRef, type ReactNode } from "react";

/*
 * La posición se escribe entera, sin depender de los márgenes automáticos que cada
 * navegador le pone al <dialog> modal: Safari en iOS no los resuelve igual que Chrome
 * y la ventana terminaba fuera de la pantalla.
 */
const variants = {
  /** Hoja que sube desde abajo en celular; ventana centrada desde sm. */
  sheet:
    "anim-sheet inset-x-0 bottom-0 top-auto m-0 max-h-[92dvh] w-full rounded-t-[1.75rem] sm:inset-0 sm:m-auto sm:h-fit sm:max-w-lg sm:rounded-[1.75rem]",
  /** Pantalla completa en celular; panel lateral derecho desde md. */
  drawer:
    "anim-drawer inset-y-0 left-auto right-0 m-0 h-dvh max-h-none w-full md:w-[28rem] md:rounded-l-[1.75rem]",
  /** Ventana centrada. */
  center:
    "anim-pop inset-0 m-auto h-fit max-h-[94dvh] w-[min(92vw,30rem)] rounded-[1.75rem]",
} as const;

type Props = {
  open: boolean;
  onClose: () => void;
  label: string;
  variant: keyof typeof variants;
  children: ReactNode;
};

/**
 * Ventana modal sobre el <dialog> nativo: el navegador se encarga del foco,
 * de la tecla Escape y de bloquear el resto de la página.
 *
 * Si el navegador no admite ventanas modales nativas (Safari antiguo), se abre
 * igual como capa fija (`data-fallback`) en vez de quedarse sin abrir.
 */
export function Modal({ open, onClose, label, variant, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open) {
      if (dialog.open) return;
      try {
        dialog.showModal();
      } catch {
        dialog.dataset.fallback = "";
        dialog.setAttribute("open", "");
      }
    } else if (dialog.open) {
      try {
        dialog.close();
      } catch {
        dialog.removeAttribute("open");
      }
      delete dialog.dataset.fallback;
    }
  }, [open]);

  // En el modo de respaldo el navegador no cierra con Escape; se hace a mano.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && ref.current?.dataset.fallback !== undefined) {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onClick={(event) => {
        // Un clic sobre el fondo oscuro llega al <dialog> mismo, no a su contenido.
        if (event.target === event.currentTarget) onClose();
      }}
      className={`fixed max-w-none overflow-hidden bg-white p-0 text-ink shadow-pop ${variants[variant]}`}
    >
      {children}
    </dialog>
  );
}
