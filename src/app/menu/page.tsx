import type { Metadata } from "next";
import { SiteView } from "@/components/SiteView";

// Es la página del QR de las mesas: se regenera sola cada 10 minutos y al guardar en el panel.
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Menú",
  description: "Mira el menú del restaurante con sus precios.",
};

export default function MenuPage() {
  return <SiteView mode="menu" />;
}
