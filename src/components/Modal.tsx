"use client";

import { useEffect, useRef, type ReactNode } from "react";

const variants = {
  /** Hoja que sube desde abajo en celular; ventana centrada desde sm. */
  sheet:
    "anim-sheet mx-auto mb-0 mt-auto max-h-[92dvh] w-full rounded-t-[1.75rem] sm:m-auto sm:max-w-lg sm:rounded-[1.75rem]",
  /** Pantalla completa en celular; panel lateral derecho desde md. */
  drawer:
    "anim-drawer my-0 ml-auto mr-0 h-dvh max-h-none w-full md:max-w-md md:rounded-l-[1.75rem]",
  /** Ventana centrada. */
  center:
    "anim-pop m-auto max-h-[94dvh] w-[min(92vw,30rem)] rounded-[1.75rem]",
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
 */
export function Modal({ open, onClose, label, variant, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onClick={(event) => {
        // Un clic sobre el fondo oscuro llega al <dialog> mismo, no a su contenido.
        if (event.target === event.currentTarget) onClose();
      }}
      className={`max-w-none overflow-hidden bg-white p-0 text-ink shadow-pop open:flex open:flex-col ${variants[variant]}`}
    >
      {children}
    </dialog>
  );
}
