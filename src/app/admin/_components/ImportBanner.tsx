"use client";

import { Database } from "lucide-react";
import { useActionState } from "react";
import { importFromFiles, type FormState } from "../actions";
import { SubmitButton } from "./SubmitButton";
import { Alert } from "./ui";

/**
 * Se muestra mientras Supabase esté vacío: el sitio está usando los archivos de
 * `src/data` y hace falta copiarlos una primera vez para poder editarlos.
 */
export function ImportBanner() {
  const [state, action] = useActionState<FormState, FormData>(
    () => importFromFiles(),
    {},
  );

  return (
    <div className="rounded-2xl border-2 border-brand-200 bg-brand-50 p-4 sm:p-5">
      <h2 className="flex items-center gap-2 font-display text-xl font-extrabold uppercase tracking-wide">
        <Database className="size-5 text-brand-700" aria-hidden="true" />
        Todavía no hay nada guardado en Supabase
      </h2>
      <p className="mt-1.5 text-sm text-ink-soft">
        Por ahora el sitio muestra el menú de los archivos del proyecto. Cópialo a
        Supabase una sola vez y a partir de ahí podrás editarlo desde aquí.
      </p>

      <form action={action} className="mt-3 space-y-3">
        <Alert state={state} />
        <SubmitButton>Copiar el menú actual a Supabase</SubmitButton>
      </form>
    </div>
  );
}
