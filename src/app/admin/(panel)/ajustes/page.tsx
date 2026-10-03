import type { Metadata } from "next";
import { getContentSources, getSite } from "@/lib/content";
import { ImportBanner } from "../../_components/ImportBanner";
import { SiteForm } from "../../_components/SiteForm";

export const metadata: Metadata = {
  title: "Ajustes",
  robots: { index: false, follow: false },
};

export default async function AjustesPage() {
  const [site, sources] = await Promise.all([getSite(), getContentSources()]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-4xl font-extrabold uppercase leading-none">
          Ajustes
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          Horario, contacto, medios de pago y la ventana de promoción.
        </p>
      </div>

      {sources.site === "archivos" && <ImportBanner />}

      <SiteForm site={site} />
    </div>
  );
}
