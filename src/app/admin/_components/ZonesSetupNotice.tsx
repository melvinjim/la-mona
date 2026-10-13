import type { ZonesState } from "@/lib/content";
import { ZONES_SQL } from "@/lib/zones-sql";
import { Card } from "./ui";

/** Se muestra en lugar de la lista de barrios cuando la tabla no existe o no se pudo leer. */
export function ZonesSetupNotice({ state }: { state: ZonesState }) {
  if (state !== "falta-tabla") {
    return (
      <Card title="Barrios con domicilio">
        <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-800 ring-1 ring-red-200">
          No se pudieron leer los barrios desde Supabase. Revisa que el proyecto esté activo y vuelve a
          cargar la página.
        </p>
      </Card>
    );
  }

  return (
    <Card
      title="Falta crear la tabla de barrios"
      description="Los barrios se guardan en una tabla de la base de datos. Se crea una sola vez."
    >
      <ol className="list-decimal space-y-2 pl-5 text-sm text-ink-soft">
        <li>
          En Supabase abre <strong className="text-ink">SQL Editor → New query</strong>.
        </li>
        <li>Pega este código (también está en supabase/schema.sql) y pulsa <strong className="text-ink">Run</strong>.</li>
        <li>Vuelve aquí y recarga la página: aparecerá la lista para llenar.</li>
      </ol>
      <pre className="mt-3 max-h-80 overflow-auto rounded-xl bg-ink p-3.5 text-xs leading-relaxed text-white">
        <code>{ZONES_SQL}</code>
      </pre>
    </Card>
  );
}
