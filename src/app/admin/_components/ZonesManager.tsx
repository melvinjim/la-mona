"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Coins,
  ListFilter,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { searchZones } from "@/lib/barrios";
import type { AdminZone } from "@/lib/content";
import { formatCOP } from "@/lib/format";
import { addZone, deleteZone, raiseZoneFees, saveZone, type FormState } from "../actions";
import { ConfirmAction } from "./ConfirmAction";
import { PriceField } from "./PriceField";
import { SubmitButton } from "./SubmitButton";
import { Alert, Card, inputClass, labelClass } from "./ui";

const PER_PAGE = 10;

type Sort = "nombre" | "barato" | "caro" | "reciente";

const SORTS: { value: Sort; label: string }[] = [
  { value: "nombre", label: "Nombre (A-Z)" },
  { value: "barato", label: "Domicilio: más barato" },
  { value: "caro", label: "Domicilio: más caro" },
  { value: "reciente", label: "Cambiado hace poco" },
];

const shortDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString("es-CO", { day: "numeric", month: "short" })
    : "—";

/** Botón que abre y cierra una parte de la pantalla. En computador no hace falta: cabe todo. */
function Fold({
  icon: Icon,
  label,
  open,
  onToggle,
}: {
  icon: typeof Coins;
  label: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="flex w-full items-center gap-2 rounded-xl px-1 py-2 text-left font-display text-lg font-bold uppercase tracking-wide lg:hidden"
    >
      <Icon className="size-5 shrink-0 text-brand-700" aria-hidden="true" />
      <span className="flex-1">{label}</span>
      <ChevronDown
        aria-hidden="true"
        className={`size-5 shrink-0 text-ink-soft transition ${open ? "rotate-180" : ""}`}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Una fila                                                            */
/* ------------------------------------------------------------------ */

const iconButton =
  "grid size-10 shrink-0 place-items-center rounded-full transition hover:bg-brand-50";

function ZoneRow({
  zone,
  checked,
  onCheck,
  editing,
  onEdit,
}: {
  zone: AdminZone;
  checked: boolean;
  onCheck: (on: boolean) => void;
  editing: boolean;
  onEdit: (on: boolean) => void;
}) {
  const [saved, save] = useActionState<FormState, FormData>(saveZone, {});
  const [removed, remove] = useActionState<FormState, FormData>(deleteZone, {});

  // Al guardar bien se cierra la edición sola.
  useEffect(() => {
    if (saved.ok) onEdit(false);
  }, [saved.ok, onEdit]);

  if (editing) {
    return (
      <li className="border-b border-line bg-brand-50/50 p-3 last:border-b-0">
        <form action={save} className="space-y-3">
          <input type="hidden" name="zoneId" value={zone.id} />
          <div className="grid gap-2.5 sm:grid-cols-[1fr_13rem]">
            <label className="block min-w-0">
              <span className={labelClass}>Barrio</span>
              <input name="name" defaultValue={zone.name} className={`${inputClass} mt-1.5`} />
            </label>
            <div className="min-w-0">
              <span className={labelClass}>Valor del domicilio</span>
              <div className="mt-1.5">
                <PriceField name="fee" label={zone.name} defaultValue={zone.fee} />
              </div>
            </div>
          </div>
          <Alert state={saved} />
          <div className="flex flex-wrap gap-2">
            <SubmitButton>Guardar</SubmitButton>
            <button
              type="button"
              onClick={() => onEdit(false)}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-line px-4 py-2 text-sm font-bold transition hover:border-brand-400"
            >
              <X className="size-4" aria-hidden="true" />
              Cancelar
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2.5 border-b border-line px-3 py-2 last:border-b-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheck(event.target.checked)}
        aria-label={`Marcar ${zone.name}`}
        className="size-5 shrink-0 accent-brand-500"
      />
      <span className="min-w-0 flex-1 truncate font-semibold">{zone.name}</span>
      <span className="shrink-0 font-display text-lg font-bold text-brand-700">
        {formatCOP(zone.fee)}
      </span>
      <span className="hidden w-16 shrink-0 text-right text-xs text-ink-soft sm:max-lg:block xl:block">
        {shortDate(zone.updatedAt)}
      </span>
      <button
        type="button"
        onClick={() => onEdit(true)}
        aria-label={`Editar ${zone.name}`}
        className={`${iconButton} text-ink-soft hover:text-brand-700`}
      >
        <Pencil className="size-4" aria-hidden="true" />
      </button>
      <form action={remove} className="shrink-0">
        <input type="hidden" name="zoneId" value={zone.id} />
        <input type="hidden" name="name" value={zone.name} />
        <ConfirmAction
          intent="delete"
          label={`Quitar ${zone.name}`}
          question={`¿Quitar "${zone.name}" de los barrios con domicilio?`}
          confirmLabel="Sí, quitarlo"
          className={`${iconButton} text-red-600 hover:bg-red-50`}
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </ConfirmAction>
      </form>
      {removed.error && (
        <span className="sr-only" role="status">
          {removed.error}
        </span>
      )}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Agregar uno                                                         */
/* ------------------------------------------------------------------ */

/**
 * Alta de un barrio. Después de agregar no se cierra: así se pueden meter varios seguidos, que
 * es justo lo que se hace al montar la lista por primera vez.
 */
function AddZone() {
  const [state, action] = useActionState<FormState, FormData>(addZone, {});
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border-2 border-line px-4 py-2.5 text-sm font-bold transition hover:border-brand-400"
        >
          <Plus className="size-4 text-brand-700" aria-hidden="true" />
          Agregar barrio
        </button>
        {state.ok && <Alert state={state} />}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3 rounded-xl border-2 border-brand-200 bg-brand-50/60 p-3">
      <div className="grid gap-2.5 sm:grid-cols-[1fr_13rem]">
        <label className="block min-w-0">
          <span className={labelClass}>Barrio</span>
          <input
            name="name"
            autoFocus
            placeholder="Ej: San Isidro"
            className={`${inputClass} mt-1.5`}
          />
        </label>
        <div className="min-w-0">
          <span className={labelClass}>Valor del domicilio</span>
          <div className="mt-1.5">
            <PriceField name="fee" label="del barrio nuevo" placeholder="5000" />
          </div>
        </div>
      </div>
      <Alert state={state} />
      <div className="flex flex-wrap gap-2">
        <SubmitButton>Agregar</SubmitButton>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-line px-4 py-2 text-sm font-bold transition hover:border-brand-400"
        >
          <X className="size-4" aria-hidden="true" />
          Cancelar
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* La sección completa                                                 */
/* ------------------------------------------------------------------ */

export function ZonesManager({ zones }: { zones: AdminZone[] }) {
  const [query, setQuery] = useState("");
  const [onlyFee, setOnlyFee] = useState("");
  const [sort, setSort] = useState<Sort>("nombre");
  const [page, setPage] = useState(1);
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set());
  const [editing, setEditing] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [preview, setPreview] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [openRaise, setOpenRaise] = useState(false);
  const [raised, raise] = useActionState<FormState, FormData>(raiseZoneFees, {});
  const lastOk = useRef<string | undefined>(undefined);

  // Tras un aumento bien hecho se limpia la selección, para no repetirlo sin querer.
  useEffect(() => {
    if (raised.ok && raised.ok !== lastOk.current) {
      lastOk.current = raised.ok;
      setPicked(new Set());
      setAmount("");
      setPreview(false);
    }
  }, [raised.ok]);

  const fees = useMemo(
    () => [...new Set(zones.map((zone) => zone.fee))].sort((a, b) => a - b),
    [zones],
  );

  /** Los barrios que pasan el buscador y el filtro, en todas las páginas. */
  const found = useMemo(() => {
    const byFee = onlyFee ? zones.filter((zone) => zone.fee === Number(onlyFee)) : zones;
    // Se busca con el mismo reconocimiento del carrito: tolera tildes y errores de escritura.
    const matched = query.trim() ? searchZones(query, byFee, byFee.length) : byFee;
    // Buscando, el orden por parecido manda sobre el resto.
    if (query.trim() && sort === "nombre") return matched;

    const order = [...matched];
    if (sort === "nombre") order.sort((a, b) => a.name.localeCompare(b.name, "es"));
    if (sort === "barato") order.sort((a, b) => a.fee - b.fee);
    if (sort === "caro") order.sort((a, b) => b.fee - a.fee);
    if (sort === "reciente") {
      order.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
    }
    return order;
  }, [zones, query, onlyFee, sort]);

  const pages = Math.max(1, Math.ceil(found.length / PER_PAGE));
  const current = Math.min(page, pages);
  const from = (current - 1) * PER_PAGE;
  const shown = found.slice(from, from + PER_PAGE);

  const pickedHere = found.filter((zone) => picked.has(zone.id));
  const allPicked = found.length > 0 && pickedHere.length === found.length;
  const somePicked = pickedHere.length > 0 && !allPicked;

  const toggle = (id: string, on: boolean) =>
    setPicked((before) => {
      const next = new Set(before);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  /** Marca o desmarca todo lo que coincide con la búsqueda, no solo la página que se ve. */
  const toggleAll = (on: boolean) =>
    setPicked((before) => {
      const next = new Set(before);
      for (const zone of found) {
        if (on) next.add(zone.id);
        else next.delete(zone.id);
      }
      return next;
    });

  const chosen = zones.filter((zone) => picked.has(zone.id));
  const extra = Number(amount.replace(/\D/g, "")) || 0;
  const canRaise = chosen.length > 0 && extra > 0;

  const headRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (headRef.current) headRef.current.indeterminate = somePicked;
  }, [somePicked]);

  // Hasta 5 números de página alrededor del actual.
  const numbers = useMemo(() => {
    const first = Math.max(1, Math.min(current - 2, pages - 4));
    return Array.from({ length: Math.min(5, pages) }, (_, i) => first + i);
  }, [current, pages]);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
      <Card
        title="Barrios con domicilio"
        description="Administra los barrios y el valor del domicilio."
      >
        <div className="space-y-3">
          <AddZone />

          <div className="border-t border-line pt-1 lg:border-0 lg:pt-0">
            <Fold
              icon={ListFilter}
              label="Filtros y búsqueda"
              open={openFilters}
              onToggle={() => setOpenFilters((on) => !on)}
            />
            <div
              className={`grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_auto] ${
                openFilters ? "mt-2" : "hidden"
              } lg:!grid`}
            >
              <label className="relative block min-w-0 sm:col-span-2 lg:col-span-1">
                <span className="sr-only">Buscar barrio</span>
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft"
                />
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Buscar barrio…"
                  className={`${inputClass} pl-9`}
                />
              </label>
              <select
                value={onlyFee}
                onChange={(event) => {
                  setOnlyFee(event.target.value);
                  setPage(1);
                }}
                aria-label="Filtrar por valor del domicilio"
                className={inputClass}
              >
                <option value="">Todos los valores</option>
                {fees.map((fee) => (
                  <option key={fee} value={fee}>
                    {formatCOP(fee)}
                  </option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as Sort)}
                aria-label="Ordenar por"
                className={inputClass}
              >
                {SORTS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-line">
            <div className="flex items-center gap-2.5 border-b border-line bg-cream/60 px-3 py-2.5">
              <input
                ref={headRef}
                type="checkbox"
                checked={allPicked}
                onChange={(event) => toggleAll(event.target.checked)}
                aria-label="Marcar todos los barrios de la búsqueda"
                className="size-5 shrink-0 accent-brand-500"
              />
              <span className="min-w-0 flex-1 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
                Barrio
              </span>
              <span className="shrink-0 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
                Domicilio
              </span>
              <span className="hidden w-16 shrink-0 text-right text-xs font-bold uppercase tracking-[0.12em] text-ink-soft sm:max-lg:block xl:block">
                Cambiado
              </span>
              <span className="w-20 shrink-0" />
            </div>

            {shown.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-ink-soft">
                {zones.length === 0
                  ? "Todavía no has agregado ningún barrio."
                  : "Ningún barrio coincide con la búsqueda."}
              </p>
            ) : (
              <ul>
                {shown.map((zone) => (
                  <ZoneRow
                    key={zone.id}
                    zone={zone}
                    checked={picked.has(zone.id)}
                    onCheck={(on) => toggle(zone.id, on)}
                    editing={editing === zone.id}
                    onEdit={(on) => setEditing(on ? zone.id : null)}
                  />
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-ink-soft">
              {found.length === 0
                ? "Sin barrios"
                : `Mostrando ${from + 1}-${from + shown.length} de ${found.length}`}
              {pickedHere.length > 0 && ` · ${pickedHere.length} marcados`}
            </p>
            {pages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage(current - 1)}
                  disabled={current <= 1}
                  aria-label="Página anterior"
                  className="grid size-9 place-items-center rounded-full border-2 border-line transition hover:border-brand-400 disabled:opacity-35"
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                </button>
                {numbers.map((number) => (
                  <button
                    key={number}
                    type="button"
                    onClick={() => setPage(number)}
                    aria-label={`Página ${number}`}
                    aria-current={number === current ? "page" : undefined}
                    className={`grid size-9 place-items-center rounded-full text-sm font-bold transition ${
                      number === current
                        ? "bg-brand-500 text-ink"
                        : "border-2 border-line hover:border-brand-400"
                    }`}
                  >
                    {number}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage(current + 1)}
                  disabled={current >= pages}
                  aria-label="Página siguiente"
                  className="grid size-9 place-items-center rounded-full border-2 border-line transition hover:border-brand-400 disabled:opacity-35"
                >
                  <ChevronRight className="size-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* ------------------------------- Aumento de varios a la vez */}
      <Card>
        <Fold
          icon={Coins}
          label="Actualización masiva de tarifas"
          open={openRaise}
          onToggle={() => setOpenRaise((on) => !on)}
        />
        <h2 className="hidden font-display text-2xl font-extrabold uppercase leading-none tracking-wide lg:flex lg:items-center lg:gap-2">
          <Coins className="size-5 text-brand-700" aria-hidden="true" />
          Subir varios
        </h2>

        <form action={raise} className={`space-y-4 ${openRaise ? "mt-3" : "hidden"} lg:!block lg:mt-4`}>
          <input type="hidden" name="ids" value={chosen.map((zone) => zone.id).join(",")} />

          <p className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2.5 text-sm font-bold text-brand-800 lg:mb-4">
            <span className="flex-1">
              {chosen.length === 0
                ? "Ningún barrio seleccionado"
                : `${chosen.length} ${chosen.length === 1 ? "barrio seleccionado" : "barrios seleccionados"}`}
            </span>
            {chosen.length > 0 && (
              <button
                type="button"
                onClick={() => setPicked(new Set())}
                aria-label="Quitar la selección"
                className="grid size-7 shrink-0 place-items-center rounded-full transition hover:bg-brand-100"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </p>

          <div>
            <span className={labelClass}>Valor a sumar (COP)</span>
            <span className="mt-0.5 block text-xs text-ink-soft">
              Se suma al valor actual: con 1000, un barrio de {formatCOP(4000)} pasa a{" "}
              {formatCOP(5000)}.
            </span>
            <div className="mt-1.5">
              <PriceField
                name="amount"
                label="valor a sumar"
                defaultValue={amount}
                placeholder="1000"
                onValueChange={setAmount}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPreview((on) => !on)}
            disabled={!canRaise}
            className="inline-flex items-center justify-center rounded-full border-2 border-line px-4 py-2 text-sm font-bold transition hover:border-brand-400 disabled:opacity-50"
          >
            {preview ? "Ocultar la vista previa" : "Vista previa de cambios"}
          </button>

          {preview && canRaise && (
            <ul className="max-h-64 overflow-y-auto rounded-xl border border-line text-sm">
              {chosen.map((zone) => (
                <li
                  key={zone.id}
                  className="flex items-baseline justify-between gap-2 border-b border-line px-3 py-2 last:border-b-0"
                >
                  <span className="min-w-0 truncate font-semibold">{zone.name}</span>
                  <span className="shrink-0 whitespace-nowrap text-ink-soft">
                    {formatCOP(zone.fee)} →{" "}
                    <strong className="font-display text-base font-bold text-brand-700">
                      {formatCOP(zone.fee + extra)}
                    </strong>
                  </span>
                </li>
              ))}
            </ul>
          )}

          <Alert state={raised} />

          <SubmitButton>
            {canRaise
              ? `Subir ${formatCOP(extra)} en ${chosen.length} ${chosen.length === 1 ? "barrio" : "barrios"}`
              : "Aplicar incremento"}
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}
