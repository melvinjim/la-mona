import type { Metadata } from "next";
import { SiteView } from "@/components/SiteView";
import { getSite } from "@/lib/content";

// Es la página del QR de las mesas: se regenera sola cada 10 minutos y al guardar en el panel.
export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  const where = site.city ? ` en ${site.city}` : "";

  return {
    title: "Menú y precios",
    description: `Carta completa de ${site.fullName}${where}: desayunos, ejecutivos, asados, fritos y bebidas, con sus precios.`,
    alternates: { canonical: "/menu" },
  };
}

export default function MenuPage() {
  return <SiteView mode="menu" />;
}
