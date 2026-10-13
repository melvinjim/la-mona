"use client";

import { useActionState } from "react";
import { restoreMenu, type FormState } from "../actions";
import { SubmitButton } from "./SubmitButton";
import { Alert } from "./ui";

/**
 * Vuelve a cargar en la base de datos el menú que viene en el código del proyecto
 * (src/data/menu.ts). Está escondido porque reemplaza todo lo que se haya editado en el panel.
 */
export function RestoreMenu() {
  const [state, action] = useActionState<FormState, FormData>(restoreMenu, {});

  return (
    <details className="rounded-2xl border border-line bg-white p-4 shadow-card">
      <summary className="cursor-pointer text-sm font-bold text-ink-soft">
        Avanzado: volver a cargar el menú original
      </summary>
      <form action={action} className="mt-3 space-y-3">
        <p className="text-sm text-ink-soft">
          Reemplaza <strong className="text-ink">todo el menú actual</strong> (platos, precios,
          opciones y las fotos de los platos) por el que viene en el código del proyecto. Úsalo solo si
          el menú del código se actualizó y quieres cargarlo completo; los cambios hechos desde este
          panel se pierden. Los barrios y los ajustes no se tocan.
        </p>
        <Alert state={state} />
        <SubmitButton
          variant="ghost"
          confirm="¿Reemplazar TODO el menú actual por el del código? Se pierden los cambios hechos desde el panel."
        >
          Reemplazar el menú por el del código
        </SubmitButton>
      </form>
    </details>
  );
}
