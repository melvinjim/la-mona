"use client";

import { Check, TriangleAlert } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { searchZones } from "@/lib/barrios";
import { formatCOP } from "@/lib/format";
import type { DeliveryZone } from "@/lib/types";

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  /** Tocó un barrio de la lista: desde ahí se cobra su domicilio. */
  onPick: (zone: DeliveryZone) => void;
  /** Hay lista de barrios: se elige de la lista. Sin lista solo se escribe. */
  hasZones: boolean;
  zones: DeliveryZone[];
  /** Barrio ya elegido (su domicilio cuenta en el total), o null. */
  validated: DeliveryZone | null;
  /** Ya intentó enviar: se marca en rojo lo que falta. */
  showError: boolean;
  /** Intentó enviar con un barrio que no está en la zona de domicilios. */
  notFound: boolean;
  inputClass: string;
};

/**
 * Barrio de entrega, aparte de la dirección.
 *
 * El cliente escribe y la lista se va filtrando debajo; toca el suyo y en ese momento se suma el
 * domicilio al total. No hay botón de validar: el barrio queda elegido al tocarlo. Se reconoce
 * aunque lo escriba "como sea", porque se compara por cómo suena en español.
 *
 * La lista va en el flujo de la página, no flotando: dentro del carrito, que ya tiene su propio
 * scroll, una capa flotante se recorta por abajo justo donde está el teclado del celular.
 */
export function BarrioField({
  id,
  value,
  onChange,
  onPick,
  hasZones,
  zones,
  validated,
  showError,
  notFound,
  inputClass,
}: Props) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const matches = useMemo(
    () => (hasZones && !validated ? searchZones(value, zones) : []),
    [hasZones, validated, value, zones],
  );

  const showList = open && matches.length > 0;
  const typed = value.trim().length;
  // Sin resultados se avisa recién con 2 letras: con una sola todavía no quiere decir nada.
  const nothingFound = hasZones && !validated && open && typed >= 2 && matches.length === 0;
  const problem = nothingFound || notFound || (showError && !validated && hasZones);

  const choose = (zone: DeliveryZone) => {
    setOpen(false);
    setActive(0);
    onPick(zone);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "Enter") {
      // Enter no envía el pedido desde aquí: elige el barrio resaltado.
      if (showList) {
        event.preventDefault();
        choose(matches[active]);
      }
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    event.preventDefault();
    if (!showList) {
      setOpen(true);
      return;
    }
    const step = event.key === "ArrowDown" ? 1 : -1;
    setActive((current) => (current + step + matches.length) % matches.length);
  };

  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold">
        Barrio
      </label>

      <input
        id={id}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        role={hasZones ? "combobox" : undefined}
        aria-expanded={hasZones ? showList : undefined}
        aria-controls={hasZones ? listId : undefined}
        aria-autocomplete={hasZones ? "list" : undefined}
        aria-activedescendant={showList ? `${listId}-${active}` : undefined}
        autoComplete="off"
        autoCapitalize="words"
        spellCheck={false}
        maxLength={80}
        placeholder="Ej: San Isidro"
        aria-invalid={problem}
        aria-describedby={`${id}-estado`}
        className={`${inputClass} ${problem ? "border-red-600" : "border-line"}`}
      />

      {hasZones && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Barrios con domicilio"
          hidden={!showList}
          className="mt-1.5 max-h-60 overflow-y-auto rounded-2xl border-2 border-line bg-white shadow-card"
        >
          {matches.map((zone, index) => (
            <li
              key={zone.id}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              // El ratón no debe sacar el foco del campo, o el clic se perdería al cerrarse la lista.
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActive(index)}
              onClick={() => choose(zone)}
              className={`flex cursor-pointer items-baseline justify-between gap-3 border-b border-line px-4 py-3 last:border-b-0 ${
                index === active ? "bg-brand-50" : ""
              }`}
            >
              <span className="font-semibold">{zone.name}</span>
              <span className="whitespace-nowrap font-display text-lg font-bold text-brand-700">
                {formatCOP(zone.fee)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div id={`${id}-estado`} aria-live="polite" className="mt-1.5 text-sm">
        {validated ? (
          <p className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2 font-semibold text-emerald-900">
            <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              {validated.name} · Domicilio {formatCOP(validated.fee)}
            </span>
          </p>
        ) : nothingFound || notFound ? (
          <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 font-semibold text-red-800 ring-1 ring-red-200">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            No encontramos ese barrio en nuestra zona de domicilios. Revisa cómo está escrito; si
            no aparece, escríbenos por WhatsApp.
          </p>
        ) : showError && hasZones ? (
          <p className="font-semibold text-red-700">
            Escribe tu barrio y tócalo en la lista para sumar el domicilio.
          </p>
        ) : (
          <p className="text-ink-soft">
            {hasZones
              ? "Escribe tu barrio y tócalo en la lista: así se suma el valor del domicilio."
              : "Escribe tu barrio. El valor del domicilio te lo confirmamos por WhatsApp."}
          </p>
        )}
      </div>
    </div>
  );
}
