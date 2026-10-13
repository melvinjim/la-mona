import type { Metadata } from "next";
import { SiteView } from "@/components/SiteView";

// La página se regenera sola cada 10 minutos; al guardar en el panel se actualiza al instante.
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Pedir a domicilio",
  description: "Arma tu pedido, escribe tu barrio y envíalo por WhatsApp. Te lo llevamos.",
};

export default function DeliveryPage() {
  return <SiteView mode="domicilio" />;
}
