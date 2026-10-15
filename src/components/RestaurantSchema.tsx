import { whatsappDigits } from "@/lib/order";
import { siteUrl } from "@/lib/site-url";
import type { SiteSettings } from "@/lib/types";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/**
 * Ficha del negocio en el formato que leen los buscadores (schema.org).
 *
 * No se ve en la página: es lo que le dice a Google que esto es un restaurante y no un blog, y
 * de dónde saca la dirección, el horario, el teléfono y el enlace al menú para mostrarlos en los
 * resultados. Sale de los mismos datos del panel, así que no hay nada que repetir a mano.
 */
export function RestaurantSchema({ site }: { site: SiteSettings }) {
  const phone = site.phone || whatsappDigits(site);

  const data = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${siteUrl}/#restaurante`,
    name: site.fullName,
    description: site.description,
    url: siteUrl,
    image: `${siteUrl}/opengraph-image`,
    servesCuisine: "Colombiana",
    menu: `${siteUrl}/menu`,
    acceptsReservations: false,
    ...(phone ? { telephone: `+${phone.replace(/^\+/, "")}` } : {}),
    ...(site.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: site.address.split(",")[0].trim(),
            ...(site.city ? { addressLocality: site.city } : {}),
            addressCountry: "CO",
          },
        }
      : {}),
    ...(site.mapsUrl ? { hasMap: site.mapsUrl } : {}),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAYS,
        opens: site.hours.open,
        closes: site.hours.close,
      },
    ],
    ...(site.delivery ? { potentialAction: { "@type": "OrderAction", target: `${siteUrl}/domicilios` } } : {}),
    ...(site.instagram
      ? { sameAs: [`https://www.instagram.com/${site.instagram}/`] }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      // El contenido lo arma el servidor con los datos del panel, no viene de nadie de fuera.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
