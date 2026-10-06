"use client";

import { Plus } from "lucide-react";
import { useActionState } from "react";
import { addCategory, type FormState } from "../actions";
import { IconPicker } from "./IconPicker";
import { SubmitButton } from "./SubmitButton";
import { Alert, Card, Field, inputClass, restore } from "./ui";

export function NewCategoryForm() {
  const [state, action] = useActionState<FormState, FormData>(addCategory, {});
  const old = restore(state.values);

  return (
    <Card title="Nueva categoría">
      <form action={action} className="space-y-4">
        <Field label="Nombre">
          <input
            name="name"
            required
            placeholder="Sopas"
            defaultValue={old.text("name")}
            className={inputClass}
          />
        </Field>

        <IconPicker defaultValue={old.text("icon", "plate") as string} />

        <Alert state={state} />

        <SubmitButton>
          <Plus className="size-4" aria-hidden="true" />
          Crear categoría
        </SubmitButton>
      </form>
    </Card>
  );
}
