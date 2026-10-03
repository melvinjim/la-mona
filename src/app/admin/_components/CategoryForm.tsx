"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useActionState } from "react";
import type { MenuCategory } from "@/lib/types";
import { saveCategory, type FormState } from "../actions";
import { ImageField } from "./ImageField";
import { SubmitButton } from "./SubmitButton";
import { Alert, Field, inputClass, labelClass, restore, Toggle } from "./ui";

const ICON_LABELS: Record<string, string> = {
  egg: "Huevo (desayunos)",
  plate: "Plato (ejecutivos)",
  flame: "Llama (asados)",
  banana: "Banano (cayeye)",
  fried: "Frito",
  citrus: "Cítrico (jugos)",
  cup: "Vaso (batidos)",
  water: "Agua (gaseosas)",
};

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
            <Field label="Ícono">
              <select
                name="icon"
                defaultValue={old.text("icon", category.icon)}
                className={inputClass}
              >
                {Object.entries(ICON_LABELS).map(([value, text]) => (
                  <option key={value} value={value}>
                    {text}
                  </option>
                ))}
              </select>
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
            <Field label="Cómo se ven los platos">
              <select
                name="layout"
                defaultValue={old.text("layout", category.layout ?? "list")}
                className={inputClass}
              >
                <option value="list">Lista con precio</option>
                <option value="chips">Etiquetas (sabores)</option>
              </select>
            </Field>
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

                  <div className="grid gap-2.5 sm:grid-cols-[1fr_8rem]">
                    <Field label="Plato">
                      <input
                        name={`item-${row}-name`}
                        defaultValue={old.text(`item-${row}-name`, item.name)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Precio">
                      <input
                        name={`item-${row}-price`}
                        inputMode="numeric"
                        defaultValue={old.text(`item-${row}-price`, item.price)}
                        placeholder={category.price ? String(category.price) : "0"}
                        className={inputClass}
                      />
                    </Field>
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
            <summary className="cursor-pointer text-sm font-bold text-ink-soft">
              Avanzado: opciones al pedir e incluidos
            </summary>
            <p className="mt-2 text-xs text-ink-soft">
              JSON con <code>options</code> (lo que el cliente elige: acompañantes,
              adicionales, agua o leche) e <code>includes</code> (lo que ya viene con el
              plato). Déjalo vacío si la categoría no lleva nada de eso.
            </p>
            <textarea
              name="advanced"
              defaultValue={old.text("advanced", advanced)}
              rows={8}
              spellCheck={false}
              className={`${inputClass} mt-2 font-mono text-xs`}
            />
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
