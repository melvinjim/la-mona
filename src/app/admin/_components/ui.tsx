import type { ReactNode } from "react";

/* Estilos compartidos del panel. Mismos colores del sitio, pero más sobrio y compacto. */

export const inputClass =
  "w-full rounded-xl border-2 border-line bg-white px-3 py-2.5 text-base outline-none transition placeholder:text-ink-soft/50 focus:border-ink";

export const labelClass =
  "block text-xs font-bold uppercase tracking-[0.12em] text-ink-soft";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className={labelClass}>{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-ink-soft">{hint}</span>}
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

export function Toggle({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border-2 border-line bg-white px-3 py-2.5 has-[:checked]:border-ink has-[:checked]:bg-brand-50">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="size-5 shrink-0 accent-ink"
      />
      <span className="text-[0.95rem] font-semibold">{label}</span>
    </label>
  );
}

export function Card({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-6">
      {title && (
        <h2 className="font-display text-2xl font-extrabold uppercase leading-none tracking-wide">
          {title}
        </h2>
      )}
      {description && <p className="mt-1.5 text-sm text-ink-soft">{description}</p>}
      <div className={title ? "mt-5" : ""}>{children}</div>
    </section>
  );
}

/**
 * React vacía el formulario cuando termina una acción. Si el guardado falló, el
 * servidor devuelve lo que se había escrito y esto lo vuelve a poner en los campos.
 */
export function restore(values?: Record<string, string>) {
  return {
    text: (key: string, saved: string | number | undefined = "") =>
      values ? (values[key] ?? "") : (saved ?? ""),
    flag: (key: string, saved: boolean) => (values ? values[key] != null : saved),
  };
}

export function Alert({ state }: { state: { error?: string; ok?: string } }) {
  if (!state.error && !state.ok) return null;
  const bad = Boolean(state.error);
  return (
    <p
      role="status"
      className={`rounded-xl px-3.5 py-2.5 text-sm font-semibold ${
        bad
          ? "bg-red-50 text-red-800 ring-1 ring-red-200"
          : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
      }`}
    >
      {state.error ?? state.ok}
    </p>
  );
}
