"use client";

import { useActionState } from "react";
import { formatZoneLines } from "@/lib/barrios";
import type { DeliveryZone } from "@/lib/types";
import { saveSurcharge, saveZones, type FormState } from "../actions";
import { PriceField } from "./PriceField";
import { SubmitButton } from "./SubmitButton";
import { Alert, Card, Field, inputClass, labelClass, restore } from "./ui";

/** Cuánto cuesta de más cada producto en el menú de domicilios. */
export function SurchargeForm({ surcharge }: { surcharge: number }) {
  const [state, action] = useActionState<FormState, FormData>(saveSurcharge, {});
  const old = restore(state.values);

  return (
    <form action={action} key={surcharge}>
      <Card
        title="Precios de domicilio"
        description="El menú de domicilios cuesta un poco más que el del local. En /menu siempre se ven los precios del local."
      >
        <div className="space-y-4">
          <div>
            <span className={labelClass}>Recargo por producto</span>
            <span className="mt-0.5 block text-xs text-ink-soft">
              Cada producto cuesta esto más a domicilio. Con $1.000, un desayuno de $8.000 vale
              $9.000. En $0, los precios son iguales. Los adicionales (papas, cayeye…) no cambian.
            </span>
            <div className="mt-1.5">
              <PriceField
                name="deliverySurcharge"
                label="recargo por producto"
                defaultValue={old.text("deliverySurcharge", surcharge)}
              />
            </div>
          </div>
          <Alert state={state} />
          <SubmitButton>Guardar recargo</SubmitButton>
        </div>
      </Card>
    </form>
  );
}

/** Lista de barrios con su valor: se guarda en la tabla `delivery_zones` de Supabase. */
export function ZonesForm({ zones }: { zones: DeliveryZone[] }) {
  const [state, action] = useActionState<FormState, FormData>(saveZones, {});
  const old = restore(state.values);
  const text = formatZoneLines(zones);

  return (
    // La clave vuelve a dibujar el formulario con lo recién guardado.
    <form action={action} key={text}>
      <Card
        title="Barrios con domicilio"
        description={`${zones.length} ${zones.length === 1 ? "barrio guardado" : "barrios guardados"} en la base de datos.`}
      >
        <div className="space-y-4">
          <Field
            label="Lista de barrios"
            hint="Uno por línea: el barrio, un guion y el valor del domicilio. Puedes pegar la lista completa. Lo que quites de aquí se quita del sitio."
          >
            <textarea
              name="zones"
              rows={14}
              spellCheck={false}
              defaultValue={old.text("zones", text)}
              placeholder={"San Isidro - 5000\nRebolo - 4500\nLas Nieves - 6000"}
              className={`${inputClass} font-mono text-sm`}
            />
          </Field>
          <p className="text-xs text-ink-soft">
            El cliente puede escribir su barrio con errores (&quot;sanisidro&quot;, &quot;SANSISDRO&quot;) y se reconoce
            igual. Si la lista queda vacía, el carrito no pide el barrio ni cobra domicilio.
          </p>
          <Alert state={state} />
          <SubmitButton>Guardar barrios</SubmitButton>
        </div>
      </Card>
    </form>
  );
}
