"use client";

import { useActionState } from "react";
import { importZones, type FormState } from "../actions";
import { SubmitButton } from "./SubmitButton";
import { Alert, inputClass, restore } from "./ui";

/**
 * Cargar muchos barrios de una vez pegando la lista.
 *
 * Va escondido en un desplegable porque es cosa de una vez cada tanto; el día a día es la tabla.
 * Y a diferencia de antes, **no borra nada**: lo que no venga en la lista se queda como estaba.
 */
export function ZonesImport() {
  const [state, action] = useActionState<FormState, FormData>(importZones, {});
  const old = restore(state.values);

  return (
    <details className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-6">
      <summary className="cursor-pointer text-sm font-bold text-ink-soft">
        Cargar muchos barrios de una vez
      </summary>

      <form action={action} key={state.ok} className="mt-4 space-y-3">
        <p className="text-sm text-ink-soft">
          Uno por línea: el barrio, un guion y el valor del domicilio. Puedes pegar la lista
          completa o copiarla de Excel. Los barrios que ya tengas se actualizan con el valor
          nuevo, y <strong className="text-ink">los que no estén en la lista se quedan como
          están</strong>: esto no borra nada.
        </p>
        <textarea
          name="zones"
          rows={10}
          spellCheck={false}
          defaultValue={old.text("zones", "")}
          placeholder={"San Isidro - 5000\nRebolo - 4500\nLas Nieves - 6000"}
          className={`${inputClass} font-mono text-sm`}
        />
        <Alert state={state} />
        <SubmitButton>Cargar la lista</SubmitButton>
      </form>
    </details>
  );
}
