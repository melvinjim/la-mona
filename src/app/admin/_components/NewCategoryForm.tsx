"use client";

import { Plus } from "lucide-react";
import { useActionState } from "react";
import { addCategory, type FormState } from "../actions";
import { SubmitButton } from "./SubmitButton";
import { Alert, Card, Field, inputClass, restore } from "./ui";

const ICON_LABELS: Record<string, string> = {
  plate: "Plato",
  egg: "Huevo",
  flame: "Llama",
  banana: "Banano",
  fried: "Frito",
  citrus: "Cítrico",
  cup: "Vaso",
  water: "Agua",
};

export function NewCategoryForm() {
  const [state, action] = useActionState<FormState, FormData>(addCategory, {});
  const old = restore(state.values);

  return (
    <Card title="Nueva categoría">
      <form action={action} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nombre">
            <input
              name="name"
              required
              placeholder="Sopas"
              defaultValue={old.text("name")}
              className={inputClass}
            />
          </Field>
          <Field label="Ícono">
            <select
              name="icon"
              defaultValue={old.text("icon", "plate")}
              className={inputClass}
            >
              {Object.entries(ICON_LABELS).map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Alert state={state} />

        <SubmitButton>
          <Plus className="size-4" aria-hidden="true" />
          Crear categoría
        </SubmitButton>
      </form>
    </Card>
  );
}
