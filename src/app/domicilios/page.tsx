import type { Metadata } from "next";
import { SiteView } from "@/components/SiteView";
import { getSite } from "@/lib/content";

// La página se regenera sola cada 10 minutos; al guardar en el panel se actualiza al instante.
export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  const where = site.city ? ` en ${site.city}` : "";

  return {
    title: "Pedir a domicilio",
    description: `Domicilios${where}: arma tu pedido, escribe tu barrio y envíalo por WhatsApp. También puedes recogerlo en el local.`,
    alternates: { canonical: "/domicilios" },
  };
}

export default function DeliveryPage() {
  return <SiteView mode="domicilio" />;
}
