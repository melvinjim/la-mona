"use client";

import { useEffect, useRef, type ReactNode } from "react";

/*
 * Congelar la página de atrás mientras hay una ventana abierta.
 *
 * `overflow: hidden` en el body no frena el scroll táctil en el Safari del iPhone: la página
 * sigue viva detrás y, al abrir el teclado, el propio Safari la desplaza para enseñar el campo,
 * que es cuando se alcanzaba a ver el catálogo moverse por detrás del cajón. Fijando el body
 * deja de poder moverse.
 *
 * Se lleva la cuenta de cuántas ventanas lo pidieron, porque el carrito y la ventana de un plato
 * pueden solaparse y la primera en cerrarse no debe soltar la página. Y se suelta escribiendo
 * los valores vacíos, nunca restaurando una copia: una copia tomada cuando ya estaba congelado
 * dejaría la página trabada para siempre.
 */
let locks = 0;
let frozenAt = 0;

function freezePage() {
  if (locks++ > 0) return;
  frozenAt = window.scrollY;
  const { style } = document.body;
  style.position = "fixed";
  style.top = `-${frozenAt}px`;
  style.insetInline = "0";
  style.width = "100%";
}

function thawPage(backToPlace: boolean) {
  // La red de seguridad: sin ninguna ventana abierta se suelta igual, pase lo que pase.
  if (locks > 0) locks -= 1;
  if (locks > 0 && document.querySelector("dialog[open]")) return;

  locks = 0;
  const { style } = document.body;
  style.position = "";
  style.top = "";
  style.insetInline = "";
  style.width = "";
  // De un tirón: el sitio tiene scroll suave, y animar la vuelta se ve como un salto.
  if (backToPlace) window.scrollTo({ top: frozenAt, behavior: "instant" });
}

function useFrozenPage(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const hashBefore = window.location.hash;
    freezePage();
    return () => {
      // Si se cerró tocando un enlace a una sección (#menu), manda ese enlace.
      thawPage(window.location.hash === hashBefore);
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
  /**
   * Pantalla completa en celular; panel lateral derecho desde md.
   *
   * No cambia de alto cuando sale el teclado: el teclado lo tapa por abajo y el pie con el
   * total se queda donde estaba. Encogerlo dejaba un hueco tan pequeño para escribir que no
   * se veía ni el campo siguiente.
   */
  drawer:
    "anim-drawer inset-y-0 left-auto right-0 m-0 h-dvh max-h-none w-full md:w-[28rem] md:rounded-l-[1.75rem]",
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
  useFrozenPage(open);

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
      {children}
    </dialog>
  );
}
