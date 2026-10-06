"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { slug } from "@/lib/slug";
import type { IncludedList, OptionChoice, OptionGroup } from "@/lib/types";
import { ChoiceGrid } from "./ChoiceGrid";
import { labelClass } from "./ui";

/**
 * Editor de "Opciones al pedir" de una categoría: lo que el cliente elige al pedir un plato
 * (acompañante, adicionales, agua o leche) y lo que el plato ya incluye.
 *
 * Todo vive en el estado de este componente y viaja al servidor en un solo campo oculto
 * (`name`) como JSON; el servidor lo vuelve a validar.
 */

type Kind = "single" | "multiple" | "counted";

const kindOf = (group: OptionGroup): Kind =>
  group.counted ? "counted" : group.multiple ? "multiple" : "single";

const kindFlags = (kind: Kind): Pick<OptionGroup, "multiple" | "counted"> => ({
  multiple: kind === "multiple" ? true : undefined,
  counted: kind === "counted" ? true : undefined,
});

const KIND_CHOICES: { value: Kind; label: string; hint: string }[] = [
  { value: "single", label: "Elige una sola", hint: "Ej: yuca, patacones o tajaditas." },
  { value: "multiple", label: "Puede marcar varias", hint: "Ej: salsas." },
  {
    value: "counted",
    label: "Con cantidad (+ y −)",
    hint: "Para pedir 2, 3 o 10 de cada una. Ej: adicionales.",
  },
];

type Draft = {
  groups: OptionGroup[];
  includeTitle: string;
  includeNote: string;
  includeItems: string;
};

const randomSuffix = () => Math.random().toString(36).slice(2, 6);
const newId = (name: string, fallback: string) => `${slug(name) || fallback}-${randomSuffix()}`;

const replaceAt = <T,>(list: T[], index: number, value: T) =>
  list.map((entry, i) => (i === index ? value : entry));
const removeAt = <T,>(list: T[], index: number) => list.filter((_, i) => i !== index);

function parseInitial(json: string): Draft {
  const empty: Draft = { groups: [], includeTitle: "", includeNote: "", includeItems: "" };
  if (!json.trim()) return empty;
  try {
    const data = JSON.parse(json) as { options?: OptionGroup[]; includes?: IncludedList };
    return {
      groups: Array.isArray(data.options) ? data.options : [],
      includeTitle: data.includes?.title ?? "",
      includeNote: data.includes?.note ?? "",
      includeItems: data.includes?.items?.join("\n") ?? "",
    };
  } catch {
    return empty;
  }
}

/** Lo que se envía al servidor: sin filas vacías. */
function serialize({ groups, includeTitle, includeNote, includeItems }: Draft): string {
  const cleanGroups = groups
    .map((group) => ({
      ...group,
      title: group.title.trim(),
      options: group.options
        .map((option) => ({ ...option, name: option.name.trim() }))
        .filter((option) => option.name),
    }))
    .filter((group) => group.title && group.options.length > 0);

  const items = includeItems
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (cleanGroups.length === 0 && items.length === 0) return "";
  return JSON.stringify({
    options: cleanGroups.length > 0 ? cleanGroups : undefined,
    includes:
      items.length > 0
        ? {
            title: includeTitle.trim() || "Incluye",
            note: includeNote.trim() || undefined,
            items,
          }
        : undefined,
  });
}

const field =
  "rounded-xl border-2 border-line bg-white px-3 py-2 text-base outline-none transition placeholder:text-ink-soft/50 focus:border-ink";
const small = `w-full ${field}`;

/** Enter dentro de estos campos no debe enviar el formulario. */
const ignoreEnter = (event: React.KeyboardEvent) => {
  if (event.key === "Enter") event.preventDefault();
};

export function OptionsEditor({ name, initial }: { name: string; initial: string }) {
  const [draft, setDraft] = useState<Draft>(() => parseInitial(initial));
  const patch = (changes: Partial<Draft>) => setDraft((current) => ({ ...current, ...changes }));

  const setGroup = (index: number, group: OptionGroup) =>
    patch({ groups: replaceAt(draft.groups, index, group) });

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={serialize(draft)} />

      <div>
        <h3 className={labelClass}>Opciones al pedir</h3>
        <p className="mt-0.5 text-xs text-ink-soft">
          Lo que el cliente elige al pedir un plato de esta categoría: acompañante, adicionales,
          agua o leche… Si no hay nada que elegir, déjalo vacío.
        </p>
      </div>

      {draft.groups.map((group, gi) => {
        const kind = kindOf(group);
        const pricedButNotCounted = kind !== "counted" && group.options.some((o) => o.price);
        return (
          <fieldset
            key={group.id}
            className="min-w-0 space-y-3 rounded-xl border border-line bg-cream/60 p-3"
          >
            <legend className="sr-only">Grupo {group.title || gi + 1}</legend>

            <div className="flex items-end gap-2">
              <label className="block min-w-0 flex-1">
                <span className={labelClass}>Nombre del grupo</span>
                <input
                  value={group.title}
                  placeholder="Ej: Acompañante, Adicionales"
                  onKeyDown={ignoreEnter}
                  onChange={(event) => setGroup(gi, { ...group, title: event.target.value })}
                  className={`${small} mt-1.5`}
                />
              </label>
              <button
                type="button"
                aria-label={`Quitar el grupo ${group.title || gi + 1}`}
                onClick={() => {
                  if (window.confirm(`¿Quitar el grupo "${group.title || "sin nombre"}"?`)) {
                    patch({ groups: removeAt(draft.groups, gi) });
                  }
                }}
                className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-red-200 text-red-700 transition hover:bg-red-50"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>

            <ChoiceGrid
              name={`kind-${group.id}`}
              legend="¿Cómo se elige?"
              choices={KIND_CHOICES}
              value={kind}
              onChange={(next) => setGroup(gi, { ...group, ...kindFlags(next) })}
            />

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={group.required === true}
                  onChange={(event) =>
                    setGroup(gi, { ...group, required: event.target.checked ? true : undefined })
                  }
                  className="size-5 accent-ink"
                />
                Es obligatorio elegir
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={group.showInMenu !== false}
                  onChange={(event) =>
                    setGroup(gi, { ...group, showInMenu: event.target.checked ? undefined : false })
                  }
                  className="size-5 accent-ink"
                />
                Mostrarlo en el menú
              </label>
            </div>

            <div>
              <p className={labelClass}>Opciones</p>
              <p className="mt-0.5 text-xs text-ink-soft">
                Con precio, suma ese valor al pedido; en blanco, va incluida.
              </p>
              <ul className="mt-2 space-y-2">
                {group.options.map((option, oi) => (
                  <li key={option.id} className="flex items-center gap-2">
                    <input
                      aria-label="Nombre de la opción"
                      value={option.name}
                      placeholder="Ej: Queso"
                      onKeyDown={ignoreEnter}
                      onChange={(event) =>
                        setGroup(gi, {
                          ...group,
                          options: replaceAt(group.options, oi, { ...option, name: event.target.value }),
                        })
                      }
                      className={`${small} min-w-0 flex-1`}
                    />
                    <input
                      aria-label={`Precio extra de ${option.name || "la opción"}`}
                      inputMode="numeric"
                      value={option.price ? String(option.price) : ""}
                      placeholder="Incluido"
                      onKeyDown={ignoreEnter}
                      onFocus={(event) => event.target.select()}
                      onChange={(event) => {
                        const price = Number(event.target.value.replace(/\D/g, "").slice(0, 6)) || undefined;
                        setGroup(gi, {
                          ...group,
                          options: replaceAt(group.options, oi, { ...option, price } as OptionChoice),
                        });
                      }}
                      className={`${field} w-28 shrink-0 text-right font-bold tabular-nums`}
                    />
                    <button
                      type="button"
                      aria-label={`Quitar la opción ${option.name || oi + 1}`}
                      onClick={() => setGroup(gi, { ...group, options: removeAt(group.options, oi) })}
                      className="grid size-10 shrink-0 place-items-center rounded-full text-red-700 transition hover:bg-red-50"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() =>
                  setGroup(gi, {
                    ...group,
                    options: [...group.options, { id: newId("opcion", "opcion"), name: "" }],
                  })
                }
                className="mt-2 inline-flex items-center gap-1.5 rounded-full border-2 border-line px-3.5 py-2 text-sm font-bold transition hover:border-ink"
              >
                <Plus className="size-4" aria-hidden="true" />
                Agregar opción
              </button>
            </div>

            {pricedButNotCounted && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">
                Esta lista tiene opciones con precio extra. Si el cliente puede querer más de una
                (2 de queso, 10 de papas), elige &quot;Con cantidad&quot; arriba.
              </p>
            )}
          </fieldset>
        );
      })}

      <button
        type="button"
        onClick={() =>
          patch({
            groups: [
              ...draft.groups,
              { id: newId("grupo", "grupo"), title: "", counted: true, options: [] },
            ],
          })
        }
        className="inline-flex items-center gap-1.5 rounded-full border-2 border-line px-4 py-2 text-sm font-bold transition hover:border-ink"
      >
        <Plus className="size-4" aria-hidden="true" />
        Agregar grupo de opciones
      </button>

      <div className="space-y-2.5 rounded-xl border border-line bg-cream/60 p-3">
        <div>
          <h3 className={labelClass}>Lo que ya incluye cada plato</h3>
          <p className="mt-0.5 text-xs text-ink-soft">
            Solo informativo (ej. en los ejecutivos: arroz, sopa, bebida). Déjalo vacío si no aplica.
          </p>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Título</span>
            <input
              value={draft.includeTitle}
              placeholder="Acompañamientos"
              onKeyDown={ignoreEnter}
              onChange={(event) => patch({ includeTitle: event.target.value })}
              className={`${small} mt-1.5`}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Nota</span>
            <input
              value={draft.includeNote}
              placeholder="Incluidos con cada ejecutivo"
              onKeyDown={ignoreEnter}
              onChange={(event) => patch({ includeNote: event.target.value })}
              className={`${small} mt-1.5`}
            />
          </label>
        </div>
        <label className="block">
          <span className={labelClass}>Lista (uno por línea)</span>
          <textarea
            value={draft.includeItems}
            rows={4}
            placeholder={"Arroz blanco\nSopa\nBebida"}
            onChange={(event) => patch({ includeItems: event.target.value })}
            className={`${small} mt-1.5 resize-y`}
          />
        </label>
      </div>
    </div>
  );
}
