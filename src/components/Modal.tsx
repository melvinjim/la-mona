"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Alto de lo que de verdad se ve, medido con la "ventana visual" del navegador.
 *
 * Al abrir el teclado, Safari en el iPhone no encoge la página: encoge esa ventana y deja su
 * propia barra translúcida abajo. Un cajón de alto `dvh` termina antes de esa barra y por la
 * franja que queda se alcanza a ver el menú de atrás. Midiendo aquí, el cajón ocupa exactamente
 * lo visible y el <dialog> puede cubrir toda la pantalla por debajo.
 */
function useVisibleHeight(active: boolean) {
  useEffect(() => {
    const view = window.visualViewport;
    if (!active || !view) return;

    const root = document.documentElement;
    const apply = () => {
      root.style.setProperty("--ventana", `${Math.round(view.height)}px`);
      root.style.setProperty("--ventana-top", `${Math.round(view.offsetTop)}px`);
    };

    apply();
    view.addEventListener("resize", apply);
    view.addEventListener("scroll", apply);
    return () => {
      view.removeEventListener("resize", apply);
      view.removeEventListener("scroll", apply);
      root.style.removeProperty("--ventana");
      root.style.removeProperty("--ventana-top");
    };
  }, [active]);
}

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
    "anim-drawer inset-y-0 left-auto right-0 m-0 h-lvh max-h-none w-full md:w-[28rem] md:rounded-l-[1.75rem]",
  /** Ventana centrada. */
  center:
    "anim-pop inset-0 m-auto h-fit max-h-[94dvh] w-[min(92vw,30rem)] rounded-[1.75rem]",
  /** Tarjeta que sube desde abajo en celular (como "sheet"); más ancha desde sm, para fotos grandes. */
  photo:
    "anim-sheet inset-x-0 bottom-0 top-auto m-0 max-h-[92dvh] w-full rounded-t-[1.75rem] sm:inset-0 sm:m-auto sm:h-fit sm:max-w-2xl sm:rounded-[1.75rem]",
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
  // Solo el cajón del pedido, que es el que llega hasta abajo y lleva campos para escribir.
  const fitsKeyboard = variant === "drawer";
  useVisibleHeight(open && fitsKeyboard);

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
      // El foco queda en la ventana y no en su primer botón: así no se dibuja un marco al abrir.
      dialog.focus({ preventScroll: true });
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
      tabIndex={-1}
      aria-label={label}
      onClose={onClose}
      onClick={(event) => {
        // Un clic sobre el fondo oscuro llega al <dialog> mismo, no a su contenido.
        if (event.target === event.currentTarget) onClose();
      }}
      className={`fixed max-w-none overflow-hidden bg-white p-0 text-ink shadow-pop ${variants[variant]}`}
    >
      {fitsKeyboard ? (
        <div
          className="flex min-h-0 w-full flex-col"
          style={{
            height: "var(--ventana, 100dvh)",
            marginTop: "var(--ventana-top, 0px)",
          }}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </dialog>
  );
}
