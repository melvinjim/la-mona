import { SUPABASE_URL } from "@/lib/supabase/config";

/** Qué falta para que el panel funcione. Se muestra cuando no hay conexión a Supabase. */
export function SetupNotice() {
  const missing = [
    !SUPABASE_URL && "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-display text-4xl font-extrabold uppercase leading-none">
        Falta conectar Supabase
      </h1>
      <p className="mt-3 text-ink-soft">
        El panel administrativo necesita la base de datos. Mientras tanto el sitio sigue
        funcionando con el menú de los archivos del proyecto.
      </p>

      <ol className="mt-6 space-y-4 text-[0.95rem]">
        <li className="rounded-2xl border border-line bg-white p-4">
          <strong className="font-bold">1. Crea el proyecto en Supabase.</strong>
          <p className="mt-1 text-ink-soft">
            Entra a supabase.com, crea un proyecto y abre <em>SQL Editor</em>. Pega ahí el
            archivo <code className="font-mono text-sm">supabase/schema.sql</code> de este
            proyecto y pulsa <em>Run</em>.
          </p>
        </li>
        <li className="rounded-2xl border border-line bg-white p-4">
          <strong className="font-bold">2. Crea tu usuario.</strong>
          <p className="mt-1 text-ink-soft">
            En <em>Authentication → Users → Add user</em>, con tu correo y una contraseña,
            marcando <em>Auto Confirm User</em>.
          </p>
        </li>
        <li className="rounded-2xl border border-line bg-white p-4">
          <strong className="font-bold">3. Copia las llaves.</strong>
          <p className="mt-1 text-ink-soft">
            En <em>Project Settings → API</em>. Ponlas en un archivo{" "}
            <code className="font-mono text-sm">.env.local</code> (y en Vercel, en{" "}
            <em>Settings → Environment Variables</em>):
          </p>
          <ul className="mt-2 space-y-1 font-mono text-xs">
            {missing.map((name) => (
              <li key={String(name)} className="rounded-lg bg-sand px-2.5 py-1.5">
                {name}=…
              </li>
            ))}
          </ul>
        </li>
      </ol>

      <p className="mt-6 text-sm text-ink-soft">
        Después de guardarlas hay que reiniciar el servidor (o volver a desplegar en
        Vercel) para que las tome.
      </p>
    </div>
  );
}
