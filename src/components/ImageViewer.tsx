"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useContext, useState, type ReactNode } from "react";
import { buttonClass } from "./button-styles";
import { CartContext } from "./cart/cart-context";
import { Modal } from "./Modal";
import { Price } from "./Price";

type Props = {
  src: string;
  /** Nombre del plato: título de la foto ampliada y texto para lectores de pantalla. */
  name: string;
  price?: number;
  description?: string;
  soldOut?: boolean;
  /**
   * Si se pasa y estamos en la página de domicilios, la foto ampliada trae un botón para
   * agregar el plato al pedido.
   */
  itemId?: string;
  /** Clases del botón que se toca para ampliar (su tamaño y forma). */
  className?: string;
  /** Lo que se ve antes de ampliar: normalmente la miniatura. */
  children: ReactNode;
};

/**
 * Foto que se amplía al tocarla: sube desde abajo como una tarjeta y se ve el plato completo, sin
 * recortes, con su nombre y precio. Se cierra con la X, tocando fuera o con la tecla Escape.
 */
export function ImageViewer({
  src,
  name,
  price,
  description,
  soldOut = false,
  itemId,
  className = "",
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // Fuera de la página de domicilios no hay carrito: la foto solo se mira.
  const cart = useContext(CartContext);
  const canAdd = Boolean(itemId && cart?.catalog[itemId]?.available);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`Ver la foto de ${name} en grande`}
        className={className}
      >
        {children}
      </button>

      <Modal open={open} onClose={close} label={`Foto de ${name}`} variant="photo">
        {open && (
          <div className="flex min-h-0 flex-auto flex-col">
            <div className="relative min-h-0 flex-auto overflow-y-auto bg-sand">
              <Image
                src={src}
                alt={name}
                width={1200}
                height={900}
                // Se abre a propósito: que la foto cargue ya, no cuando el navegador quiera.
                loading="eager"
                sizes="(min-width: 768px) 736px, 94vw"
                className={`h-auto max-h-[68dvh] w-full object-contain ${soldOut ? "grayscale" : ""}`}
              />
              <button
                type="button"
                onClick={close}
                aria-label="Cerrar la foto"
                className="absolute right-3 top-3 grid size-11 place-items-center rounded-full bg-ink/85 text-white shadow-md transition hover:bg-ink"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="border-t border-line bg-white px-5 pb-5 pt-4 sm:px-7">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-display text-3xl font-extrabold uppercase leading-none">{name}</p>
                {soldOut ? (
                  <span className="rounded-full bg-sand px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-ink-soft">
                    Agotado
                  </span>
                ) : (
                  price !== undefined && (
                    <Price
                      value={price}
                      className="font-display text-3xl font-bold leading-none text-brand-700"
                    />
                  )
                )}
              </div>
              {description && (
                <p className="mt-1.5 text-[0.95rem] leading-snug text-ink-soft">{description}</p>
              )}
              {canAdd && itemId && (
                <button
                  type="button"
                  onClick={() => {
                    close();
                    cart?.openProduct(itemId);
                  }}
                  className={buttonClass("primary", "lg", "mt-4 w-full")}
                >
                  Agregar al pedido
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
