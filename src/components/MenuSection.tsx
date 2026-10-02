import { Check, Plus } from "lucide-react";
import Image from "next/image";
import type {
  IncludedList,
  MenuCategory,
  MenuItem,
  OptionGroup,
} from "@/lib/types";
import { AddButton, AddChip } from "./cart/AddButton";
import { categoryIcons } from "./category-icons";
import { Price } from "./Price";

function ItemRow({ item, fallbackPrice }: { item: MenuItem; fallbackPrice?: number }) {
  const price = item.price ?? fallbackPrice;
  const soldOut = item.available === false;

  return (
    <li className="flex gap-3.5 py-2.5">
      {item.image && (
        <div className="relative size-[4.5rem] shrink-0 self-center overflow-hidden rounded-2xl bg-sand">
          <Image
            src={item.image}
            alt=""
            fill
            sizes="72px"
            className={`object-cover ${soldOut ? "grayscale" : ""}`}
          />
        </div>
      )}
      <div className="min-w-0 flex-1 self-center">
        <div className="flex items-baseline gap-2">
          <p
            className={`text-[1.0625rem] font-semibold leading-snug ${soldOut ? "text-ink-soft line-through decoration-1" : ""}`}
          >
            {item.name}
          </p>
          <span
            aria-hidden="true"
            className="relative -top-[0.2em] min-w-3 flex-1 border-b-2 border-dotted border-ink/35"
          />
          {soldOut ? (
            <span className="rounded-full bg-sand px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-ink-soft">
              Agotado
            </span>
          ) : (
            price !== undefined && (
              <>
                <Price
                  value={price}
                  className="font-display text-[1.4rem] font-bold leading-none text-brand-700"
                />
                <AddButton itemId={item.id} />
              </>
            )
          )}
        </div>
        {item.description && (
          <p className="mt-0.5 text-sm leading-snug text-ink-soft">
            {item.description}
          </p>
        )}
      </div>
    </li>
  );
}

function Chips({ items }: { items: MenuItem[] }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item.id}>
          <AddChip itemId={item.id} name={item.name} />
        </li>
      ))}
    </ul>
  );
}

const panelClass =
  "mt-5 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-4 sm:px-5";
const panelTitleClass =
  "font-display text-xl font-bold uppercase tracking-wide text-brand-700";

/** Lo que ya incluye cada plato de la categoría (solo informativo). */
function IncludesPanel({ includes }: { includes: IncludedList }) {
  return (
    <div className={panelClass}>
      <h4 className={panelTitleClass}>{includes.title}</h4>
      {includes.note && <p className="text-sm text-ink-soft">{includes.note}</p>}
      <ul className="mt-3 flex flex-wrap gap-2">
        {includes.items.map((name) => (
          <li
            key={name}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[0.95rem] font-semibold shadow-sm"
          >
            <Check className="size-4 text-emerald-600" aria-hidden="true" />
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Opciones que se eligen al pedir. Las que van incluidas se juntan en una sola fila
 * ("Yuca / Patacones / Tajaditas"); las que tienen recargo van cada una en su fila.
 */
function OptionsPanel({ group }: { group: OptionGroup }) {
  const included = group.options.filter((option) => !option.price);
  const extra = group.options.filter((option) => option.price);
  const rows = [
    ...(included.length > 0
      ? [{ label: included.map((option) => option.name).join(" / "), price: undefined }]
      : []),
    ...extra.map((option) => ({ label: option.name, price: option.price })),
  ];

  return (
    <div className={panelClass}>
      <h4 className={panelTitleClass}>{group.title}</h4>
      <ul className="mt-2.5 space-y-1.5">
        {rows.map((row) => (
          <li key={row.label} className="flex items-baseline gap-2.5">
            {row.price === undefined ? (
              <Check
                className="size-4 shrink-0 self-center text-emerald-600"
                aria-hidden="true"
              />
            ) : (
              <Plus
                className="size-4 shrink-0 self-center text-brand-700"
                aria-hidden="true"
              />
            )}
            <span className="text-[0.95rem] font-semibold">{row.label}</span>
            <span
              aria-hidden="true"
              className="relative -top-[0.2em] hidden min-w-3 flex-1 border-b-2 border-dotted border-ink/35 sm:block"
            />
            <span className="ml-auto">
              {row.price === undefined ? (
                <span className="text-sm font-semibold text-emerald-700">
                  Incluido
                </span>
              ) : (
                <Price
                  value={row.price}
                  prefix="+"
                  className="font-display text-xl font-bold leading-none text-brand-700"
                />
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MenuSection({ category }: { category: MenuCategory }) {
  const Icon = categoryIcons[category.icon];
  const titleId = `${category.id}-titulo`;

  return (
    <section
      id={category.id}
      aria-labelledby={titleId}
      className="scroll-mt-[var(--menu-offset)] pt-8"
    >
      <div className="rounded-[1.75rem] border border-line bg-white shadow-card lg:grid lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="relative px-5 pb-6 pt-9 sm:px-8 sm:pb-8">
          <h3
            id={titleId}
            className="absolute -top-5 left-4 inline-flex items-center gap-2.5 rounded-xl bg-brand-500 px-4 py-1.5 font-display text-[1.75rem] font-extrabold uppercase leading-none tracking-wide text-white shadow-tag sm:left-6"
          >
            <Icon className="size-6" aria-hidden="true" />
            {category.name}
          </h3>

          {category.price !== undefined && (
            <p className="mb-3 flex items-baseline gap-2 sm:absolute sm:-top-5 sm:right-6 sm:mb-0 sm:rounded-xl sm:border sm:border-brand-200 sm:bg-white sm:px-4 sm:py-1.5 sm:shadow-card">
              <span className="text-sm font-bold uppercase tracking-wide text-ink-soft">
                Todos a
              </span>
              <Price
                value={category.price}
                className="font-display text-[1.75rem] font-extrabold leading-none text-brand-700"
              />
            </p>
          )}

          {category.note && (
            <p className="text-[0.95rem] font-medium text-ink-soft">
              {category.note}
            </p>
          )}

          {category.layout === "chips" ? (
            <Chips items={category.items} />
          ) : (
            <ul className={category.note ? "mt-1" : "-mt-1"}>
              {category.items.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  fallbackPrice={category.price}
                />
              ))}
            </ul>
          )}

          {category.includes && <IncludesPanel includes={category.includes} />}
          {category.options
            ?.filter((group) => group.showInMenu !== false)
            .map((group) => <OptionsPanel key={group.id} group={group} />)}
        </div>

        <div
          aria-hidden="true"
          className="relative hidden overflow-hidden rounded-r-[1.75rem] bg-brand-50 lg:block"
        >
          {category.image ? (
            <Image
              src={category.image}
              alt=""
              fill
              sizes="256px"
              className="object-cover"
            />
          ) : (
            <>
              <div className="bg-dots-brand absolute inset-0" />
              <div className="absolute inset-0 grid place-items-center">
                <div className="grid size-36 place-items-center rounded-full bg-brand-100 shadow-[inset_0_0_0_10px_rgb(255_255_255/0.55)]">
                  <Icon className="size-16 text-brand-500" strokeWidth={1.5} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
