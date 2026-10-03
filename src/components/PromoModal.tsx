"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useSyncExternalStore } from "react";
import { promoStore } from "@/lib/local-store";
import type { Promo } from "@/lib/types";
import { buttonClass } from "./button-styles";
import { Modal } from "./Modal";

/**
 * Ventana de promoción: se abre sola la primera vez que el visitante entra.
 * Al cerrarla se recuerda en el navegador (por el `id` de la promoción) y no vuelve a salir
 * hasta que cambie el `id` o el visitante borre los datos del sitio.
 */
export function PromoModal({ promo }: { promo?: Promo }) {
  // En el servidor se considera "ya cerrada", así el HTML inicial no trae la ventana abierta.
  const dismissed = useSyncExternalStore(
    promoStore.subscribe,
    promoStore.getSnapshot,
    () => promo?.id ?? null,
  );

  if (!promo || !promo.active || !promo.image) return null;

  const open = dismissed !== promo.id;
  const close = () => promoStore.set(promo.id);

  return (
    <Modal open={open} onClose={close} label={promo.alt} variant="center">
      {open && (
        <div className="relative min-h-0 flex-auto overflow-y-auto bg-sand">
          <Image
            src={promo.image}
            alt={promo.alt}
            width={1080}
            height={1350}
            sizes="(min-width: 640px) 480px, 92vw"
            className="h-auto max-h-[72dvh] w-full object-contain"
          />
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar promoción"
            className="absolute right-3 top-3 grid size-11 place-items-center rounded-full bg-ink/85 text-white shadow-md transition hover:bg-ink"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
          {promo.cta && (
            <div className="bg-white p-4">
              <a
                href={promo.cta.href}
                onClick={close}
                {...(promo.cta.href.startsWith("#")
                  ? {}
                  : { target: "_blank", rel: "noopener noreferrer" })}
                className={buttonClass("primary", "lg", "w-full")}
              >
                {promo.cta.label}
              </a>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
