"use client";

import { Check, MapPinned, TriangleAlert } from "lucide-react";
import type { ZoneMatch } from "@/lib/barrios";
import { formatCOP } from "@/lib/format";
import type { DeliveryZone } from "@/lib/types";

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  match: ZoneMatch;
  zones: DeliveryZone[];
  /** Ya intentó enviar: se marcan en rojo los problemas. */
  showError: boolean;
  inputClass: string;
};

const byName = (a: DeliveryZone, b: DeliveryZone) => a.name.localeCompare(b.name, "es");

/**
 * Barrio de entrega. Reconoce lo que escribe el cliente aunque tenga errores, muestra al instante
 * el barrio entendido y el valor del domicilio, y ofrece opciones para tocar si hay dudas.
 */
export function BarrioField({ id, value, onChange, match, zones, showError, inputClass }: Props) {
  const problem = match.status === "none" || (showError && match.status !== "ok");

  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold">
        Barrio
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        // Al salir del campo, si se entendió el barrio, se deja escrito con su nombre oficial.
        onBlur={() => {
          if (match.status === "ok" && match.zone.name !== value) onChange(match.zone.name);
        }}
        autoComplete="off"
        autoCapitalize="words"
        spellCheck={false}
        maxLength={80}
        placeholder="Ej: San Isidro"
        aria-invalid={problem}
        aria-describedby={`${id}-estado`}
        className={`${inputClass} ${problem ? "border-red-600" : "border-line"}`}
      />

      <div id={`${id}-estado`} aria-live="polite" className="mt-1.5 text-sm">
        {match.status === "empty" && (
          <p className={showError ? "font-semibold text-red-700" : "text-ink-soft"}>
            {showError
              ? "Escribe el barrio de entrega."
              : "Escribe tu barrio y te mostramos el valor del domicilio."}
          </p>
        )}

        {match.status === "ok" && (
          <p className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2 font-semibold text-emerald-900">
            <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              {match.zone.name} · Domicilio {formatCOP(match.zone.fee)}
            </span>
          </p>
        )}

        {match.status === "suggest" && (
          <div className="rounded-xl bg-amber-50 px-3 py-2.5 ring-1 ring-amber-200">
            <p className="flex items-start gap-2 font-semibold text-amber-900">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              ¿Cuál es tu barrio? Toca el correcto:
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {match.options.map((zone) => (
                <li key={zone.id}>
                  <button
                    type="button"
                    onClick={() => onChange(zone.name)}
                    className="rounded-full border-2 border-ink bg-white px-3.5 py-1.5 text-[0.95rem] font-bold transition hover:bg-brand-50"
                  >
                    {zone.name}
                    <span className="ml-1.5 font-semibold text-brand-700">{formatCOP(zone.fee)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {match.status === "none" && (
          <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 font-semibold text-red-800 ring-1 ring-red-200">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            No encontramos ese barrio en nuestra zona de domicilios. Revisa cómo está escrito o
            mira la lista de abajo.
          </p>
        )}
      </div>

      <details className="mt-2 rounded-xl border border-line bg-cream/60 px-3 py-2">
        <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold">
          <MapPinned className="size-4 text-brand-700" aria-hidden="true" />
          Ver barrios con domicilio y su valor
        </summary>
        <ul className="mt-2 max-h-56 divide-y divide-line overflow-y-auto text-sm">
          {[...zones].sort(byName).map((zone) => (
            <li key={zone.id} className="flex items-baseline justify-between gap-3 py-1.5">
              <button
                type="button"
                onClick={() => onChange(zone.name)}
                className="text-left font-semibold underline decoration-ink/25 underline-offset-4 transition hover:text-brand-700"
              >
                {zone.name}
              </button>
              <span className="font-display text-lg font-bold text-brand-700">
                {formatCOP(zone.fee)}
              </span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
