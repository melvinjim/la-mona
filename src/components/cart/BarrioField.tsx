"use client";

import { Check, MapPinned, TriangleAlert } from "lucide-react";
import type { ZoneMatch } from "@/lib/barrios";
import { formatCOP } from "@/lib/format";
import type { DeliveryZone } from "@/lib/types";

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  /** El cliente tocó "Validar" (o pulsó Enter). */
  onValidate: () => void;
  /** Eligió uno de los barrios sugeridos. */
  onPick: (zone: DeliveryZone) => void;
  /** Hay lista de barrios: se valida y se cobra el domicilio. Sin lista solo se escribe. */
  hasZones: boolean;
  zones: DeliveryZone[];
  /** Barrio ya validado (su domicilio cuenta en el total), o null. */
  validated: DeliveryZone | null;
  /** Resultado del último intento de validar: dudas o no encontrado. */
  attempt: ZoneMatch | null;
  /** Ya intentó enviar: se marca en rojo lo que falta. */
  showError: boolean;
  inputClass: string;
};

const byName = (a: DeliveryZone, b: DeliveryZone) => a.name.localeCompare(b.name, "es");

/**
 * Barrio de entrega, aparte de la dirección. El cliente lo escribe (aunque sea con errores) y toca
 * "Validar": se reconoce, se muestra el valor del domicilio y recién ahí se suma al total.
 */
export function BarrioField({
  id,
  value,
  onChange,
  onValidate,
  onPick,
  hasZones,
  zones,
  validated,
  attempt,
  showError,
  inputClass,
}: Props) {
  const typedEnough = value.trim().length >= 3;
  const missing = showError && (hasZones ? !validated : !typedEnough);
  const problem = missing || (!validated && attempt?.status === "none");

  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold">
        Barrio
      </label>

      <div className="flex items-start gap-2">
        <input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && hasZones) {
              event.preventDefault();
              onValidate();
            }
          }}
          autoComplete="off"
          autoCapitalize="words"
          spellCheck={false}
          maxLength={80}
          placeholder="Ej: San Isidro"
          aria-invalid={problem}
          aria-describedby={`${id}-estado`}
          className={`${inputClass} min-w-0 flex-1 ${problem ? "border-red-600" : "border-line"}`}
        />
        {hasZones && (
          <button
            type="button"
            onClick={onValidate}
            disabled={validated !== null}
            className={`mt-1.5 inline-flex h-12 shrink-0 items-center gap-1.5 rounded-2xl px-4 font-bold transition ${
              validated
                ? "bg-emerald-100 text-emerald-900"
                : "bg-brand-500 text-ink shadow-[0_3px_0_var(--color-brand-800)] hover:bg-brand-400 active:translate-y-px"
            }`}
          >
            {validated && <Check className="size-4" aria-hidden="true" />}
            {validated ? "Validado" : "Validar"}
          </button>
        )}
      </div>

      <div id={`${id}-estado`} aria-live="polite" className="mt-1.5 text-sm">
        {validated ? (
          <p className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2 font-semibold text-emerald-900">
            <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              {validated.name} · Domicilio {formatCOP(validated.fee)}
            </span>
          </p>
        ) : attempt?.status === "suggest" ? (
          <div className="rounded-xl bg-amber-50 px-3 py-2.5 ring-1 ring-amber-200">
            <p className="flex items-start gap-2 font-semibold text-amber-900">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              ¿Cuál es tu barrio? Toca el correcto:
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {attempt.options.map((zone) => (
                <li key={zone.id}>
                  <button
                    type="button"
                    onClick={() => onPick(zone)}
                    className="rounded-full border-2 border-brand-500 bg-white px-3.5 py-1.5 text-[0.95rem] font-bold transition hover:bg-brand-50"
                  >
                    {zone.name}
                    <span className="ml-1.5 font-semibold text-brand-700">{formatCOP(zone.fee)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : attempt?.status === "none" ? (
          <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 font-semibold text-red-800 ring-1 ring-red-200">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            No encontramos ese barrio en nuestra zona de domicilios. Revisa cómo está escrito o
            mira la lista de abajo.
          </p>
        ) : attempt?.status === "empty" ? (
          <p className="font-semibold text-red-700">Escribe el nombre de tu barrio y toca Validar.</p>
        ) : missing ? (
          <p className="font-semibold text-red-700">
            {hasZones
              ? "Toca Validar para confirmar tu barrio y el valor del domicilio."
              : "Escribe tu barrio."}
          </p>
        ) : (
          <p className="text-ink-soft">
            {hasZones
              ? "Escribe tu barrio y toca Validar: así se suma el valor del domicilio."
              : "Escribe tu barrio. El valor del domicilio te lo confirmamos por WhatsApp."}
          </p>
        )}
      </div>

      {hasZones && (
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
                  onClick={() => onPick(zone)}
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
      )}
    </div>
  );
}
