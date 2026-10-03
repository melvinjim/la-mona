import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSite } from "@/lib/content";
import { supabaseReady } from "@/lib/supabase/config";
import { currentAdmin } from "@/lib/supabase/server-client";
import { LoginForm } from "../_components/LoginForm";
import { SetupNotice } from "../_components/SetupNotice";

export const metadata: Metadata = {
  title: "Entrar al panel",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (!supabaseReady) return <SetupNotice />;

  if (await currentAdmin()) redirect("/admin");

  const site = await getSite();

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-12">
      <div className="flex items-center gap-3">
        <Image
          src={site.logo}
          alt=""
          width={56}
          height={56}
          className="size-14 rounded-full"
        />
        <div>
          <p className="font-display text-2xl font-extrabold uppercase leading-none">
            {site.name}
          </p>
          <p className="text-sm font-semibold text-ink-soft">Panel administrativo</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-card">
        <LoginForm />
      </div>

      <Link
        href="/"
        className="mt-6 text-center text-sm font-semibold text-ink-soft underline underline-offset-4 hover:text-ink"
      >
        Volver al sitio
      </Link>
    </main>
  );
}
