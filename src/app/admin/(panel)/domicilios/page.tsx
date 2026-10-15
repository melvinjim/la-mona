import type { Metadata } from "next";
import { getAdminZones, getSite } from "@/lib/content";
import { SurchargeForm } from "../../_components/DeliveryForms";
import { ZonesImport } from "../../_components/ZonesImport";
import { ZonesManager } from "../../_components/ZonesManager";
import { ZonesSetupNotice, ZonesUpgradeNotice } from "../../_components/ZonesSetupNotice";

export const metadata: Metadata = {
  title: "Domicilios",
  robots: { index: false, follow: false },
};

export default async function DomiciliosPage() {
  const [site, zones] = await Promise.all([getSite(), getAdminZones()]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-4xl font-extrabold uppercase leading-none">
          Domicilios
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          Cuánto más cuestan los productos a domicilio y el valor de cada barrio.
        </p>
      </div>

      <SurchargeForm surcharge={site.deliverySurcharge ?? 0} />

      {zones.state !== "ok" ? (
        <ZonesSetupNotice state={zones.state} />
      ) : (
        <>
          {zones.needsUpgrade && <ZonesUpgradeNotice />}
          <ZonesManager zones={zones.zones} />
          <ZonesImport />
        </>
      )}
    </div>
  );
}
