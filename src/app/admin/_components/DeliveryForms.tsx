"use client";

import { useActionState } from "react";
import { saveSurcharge, type FormState } from "../actions";
import { PriceField } from "./PriceField";
import { SubmitButton } from "./SubmitButton";
import { Alert, Card, labelClass, restore } from "./ui";

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
