import { formatCOP } from "@/lib/format";
import { whatsappDigits } from "@/lib/order";
import { siteUrl } from "@/lib/site-url";
import type { MenuCategory, SiteSettings } from "@/lib/types";

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
export function RestaurantSchema({ site, menu }: { site: SiteSettings; menu: MenuCategory[] }) {
  const phone = site.phone || whatsappDigits(site);

  // De barato a caro, sacado del menú de verdad: no es una estimación.
  const prices = menu.flatMap((category) => [
    ...category.items.flatMap((item) => item.price ?? []),
    ...(category.price ? [category.price] : []),
  ]);

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
    currenciesAccepted: "COP",
    ...(prices.length > 0
      ? { priceRange: `${formatCOP(Math.min(...prices))}-${formatCOP(Math.max(...prices))}` }
      : {}),
    ...(site.payments.length > 0 ? { paymentAccepted: site.payments.join(", ") } : {}),
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
      /*
       * El "<" se escribe escapado porque JSON.stringify no lo toca: un nombre que llevara
       * "</script>" cerraría esta etiqueta antes de tiempo y lo que viniera detrás correría
       * como código en el navegador del cliente. Haría falta entrar al panel para lograrlo,
       * pero el arreglo es una línea.
       */
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
