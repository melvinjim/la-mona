"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useActionState } from "react";
import type { MenuCategory } from "@/lib/types";
import { saveCategory, type FormState } from "../actions";
import { ChoiceGrid } from "./ChoiceGrid";
import { IconPicker } from "./IconPicker";
import { ImageField } from "./ImageField";
import { OptionsEditor } from "./OptionsEditor";
import { PriceField } from "./PriceField";
import { SubmitButton } from "./SubmitButton";
import { Alert, Field, inputClass, labelClass, restore, Toggle } from "./ui";

type Props = {
  category: MenuCategory;
  index: number;
  total: number;
};

export function CategoryForm({ category, index, total }: Props) {
  const [state, action] = useActionState<FormState, FormData>(saveCategory, {});
  const old = restore(state.values);

  const advanced =
    category.options || category.includes
      ? JSON.stringify(
          { options: category.options, includes: category.includes },
          null,
          2,
        )
      : "";

  return (
    <details className="group overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 sm:px-5">
        <span className="font-display text-xl font-extrabold uppercase leading-none tracking-wide">
          {category.name}
        </span>
        <span className="rounded-full bg-sand px-2.5 py-0.5 text-xs font-bold text-ink-soft">
          {category.items.length}
        </span>
        <ChevronDown
          className="ml-auto size-5 shrink-0 text-ink-soft transition group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>

      <div className="border-t border-line px-4 pb-5 pt-4 sm:px-5">
        {/* La clave vuelve a dibujar el formulario con lo recién guardado. */}
        <form key={JSON.stringify(category)} action={action} className="space-y-5">
          {/*
            Botón por defecto: lo que dispara la tecla Enter dentro de un campo. Sin él, Enter
            pulsaría el primer botón del formulario, que es el de eliminar un plato.
          */}
          <button
            type="submit"
            name="intent"
            value="save"
            tabIndex={-1}
            aria-hidden="true"
            className="sr-only"
          >
            Guardar
          </button>
          <input type="hidden" name="categoryId" value={category.id} />
          <input type="hidden" name="itemCount" value={category.items.length} />

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nombre">
              <input
                name="name"
                defaultValue={old.text("name", category.name)}
                required
                className={inputClass}
              />
            </Field>
            <Field label="Nombre corto" hint="El que sale en la barra de categorías.">
              <input
                name="navLabel"
                defaultValue={old.text("navLabel", category.navLabel)}
                placeholder={category.name}
                className={inputClass}
              />
            </Field>
            <Field
              label="Precio único"
              hint="Si todos valen lo mismo (ej. batidos). Vacío = cada plato con su precio."
            >
              <input
                name="price"
                inputMode="numeric"
                defaultValue={old.text("price", category.price)}
                placeholder="7000"
                className={inputClass}
              />
            </Field>
            <Field label="Nota" hint="Frase corta bajo el título.">
              <input
                name="note"
                defaultValue={old.text("note", category.note)}
                className={inputClass}
              />
            </Field>
            <div className="sm:col-span-2">
              <IconPicker defaultValue={old.text("icon", category.icon) as string} />
            </div>
            <div className="sm:col-span-2">
              <ChoiceGrid
                name="layout"
                legend="Cómo se ven los platos"
                defaultValue={old.text("layout", category.layout ?? "list") as "list" | "chips"}
                choices={[
                  {
                    value: "list",
                    label: "Lista con precio",
                    hint: "Cada plato en su fila con su precio. Ej: desayunos, asados.",
                  },
                  {
                    value: "chips",
                    label: "Etiquetas",
                    hint: "Los platos como botones pequeños, todos al mismo precio. Ej: sabores de batido.",
                  },
                ]}
              />
            </div>
            <div className="sm:col-span-2">
              <ImageField
                name="image"
                label="Foto de la categoría"
                hint="Se ve al lado del listado en computador."
                defaultValue={category.image ?? ""}
              />
            </div>
          </div>

          <div>
            <h3 className={labelClass}>Platos</h3>
            <ul className="mt-2 space-y-3">
              {category.items.map((item, row) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-line bg-cream/60 p-3"
                >
                  <input type="hidden" name={`item-${row}-id`} value={item.id} />

                  <div className="grid gap-2.5 sm:grid-cols-[1fr_12.5rem]">
                    <Field label="Plato">
                      <input
                        name={`item-${row}-name`}
                        defaultValue={old.text(`item-${row}-name`, item.name)}
                        className={inputClass}
                      />
                    </Field>
                    <div className="min-w-0">
                      <span className={labelClass}>Precio</span>
                      <div className="mt-1.5">
                        <PriceField
                          name={`item-${row}-price`}
                          label={item.name}
                          defaultValue={old.text(`item-${row}-price`, item.price)}
                          placeholder={category.price ? String(category.price) : "0"}
                          startFrom={category.price}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5">
                    <Field label="Descripción">
                      <input
                        name={`item-${row}-description`}
                        defaultValue={old.text(`item-${row}-description`, item.description)}
                        placeholder="De carne, pollo o queso"
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <div className="mt-2.5">
                    <ImageField
                      name={`item-${row}-image`}
                      label="Foto del plato"
                      defaultValue={item.image ?? ""}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Toggle
                      name={`item-${row}-available`}
                      label="Disponible"
                      defaultChecked={old.flag(`item-${row}-available`, item.available !== false)}
                    />
                    {row > 0 && (
                      <SubmitButton intent={`item-up-${row}`} variant="ghost">
                        <ChevronUp className="size-4" aria-hidden="true" />
                        <span className="sr-only">Subir {item.name}</span>
                      </SubmitButton>
                    )}
                    {row < category.items.length - 1 && (
                      <SubmitButton intent={`item-down-${row}`} variant="ghost">
                        <ChevronDown className="size-4" aria-hidden="true" />
                        <span className="sr-only">Bajar {item.name}</span>
                      </SubmitButton>
                    )}
                    <SubmitButton
                      intent={`remove-item-${row}`}
                      variant="ghost"
                      confirm={`¿Eliminar "${item.name}" del menú?`}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Eliminar
                    </SubmitButton>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-3">
              <SubmitButton intent="add-item" variant="ghost">
                <Plus className="size-4" aria-hidden="true" />
                Agregar plato
              </SubmitButton>
            </div>
          </div>

          <details className="rounded-xl border border-line bg-cream/60 p-3">
            <summary className="cursor-pointer text-sm font-bold">
              Opciones al pedir: acompañante, adicionales…
              <span className="ml-2 rounded-full bg-sand px-2 py-0.5 text-xs font-bold text-ink-soft">
                {category.options?.length ?? 0}
              </span>
            </summary>
            <div className="mt-3">
              <OptionsEditor name="advanced" initial={advanced} />
            </div>
          </details>

          <Alert state={state} />

          <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
            <SubmitButton intent="save">Guardar y publicar</SubmitButton>
            {index > 0 && (
              <SubmitButton intent="move-up" variant="ghost">
                <ChevronUp className="size-4" aria-hidden="true" />
                Subir
              </SubmitButton>
            )}
            {index < total - 1 && (
              <SubmitButton intent="move-down" variant="ghost">
                <ChevronDown className="size-4" aria-hidden="true" />
                Bajar
              </SubmitButton>
            )}
            <SubmitButton
              intent="delete"
              variant="ghost"
              confirm={`¿Eliminar la categoría "${category.name}" y todos sus platos?`}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Eliminar categoría
            </SubmitButton>
          </div>
        </form>
      </div>
    </details>
  );
}
