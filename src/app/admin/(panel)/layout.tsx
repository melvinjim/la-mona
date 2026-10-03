import { ExternalLink, LogOut } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSite } from "@/lib/content";
import { supabaseReady } from "@/lib/supabase/config";
import { currentAdmin } from "@/lib/supabase/server-client";
import { signOut } from "../actions";
import { SetupNotice } from "../_components/SetupNotice";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// El panel nunca se cachea: depende de la sesión de quien entra.
export const dynamic = "force-dynamic";

const tabClass =
  "rounded-full px-4 py-2 text-sm font-bold transition hover:bg-sand";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  if (!supabaseReady) return <SetupNotice />;

  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");

  const site = await getSite();

  return (
    <div className="min-h-dvh bg-cream">
      <header className="sticky top-0 z-30 border-b border-line bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
          <p className="font-display text-xl font-extrabold uppercase leading-none tracking-wide">
            {site.name}
          </p>
          <span className="rounded-full bg-ink px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-white">
            Panel
          </span>

          <nav className="-mx-1 order-last flex w-full gap-1 sm:order-none sm:ml-2 sm:w-auto">
            <Link href="/admin" className={tabClass}>
              Menú
            </Link>
            <Link href="/admin/ajustes" className={tabClass}>
              Ajustes
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/"
              target="_blank"
              className={`${tabClass} inline-flex items-center gap-1.5 text-ink-soft`}
            >
              Ver sitio
              <ExternalLink className="size-4" aria-hidden="true" />
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className={`${tabClass} inline-flex items-center gap-1.5 text-ink-soft`}
              >
                Salir
                <LogOut className="size-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>

      <p className="pb-10 text-center text-xs text-ink-soft">
        Conectado como {admin.email}
      </p>
    </div>
  );
}
