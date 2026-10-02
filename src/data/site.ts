import type { SiteSettings } from "@/lib/types";

/**
 * Datos generales del restaurante. Todo lo que está vacío ("") simplemente no se muestra en la página.
 */
export const site: SiteSettings = {
  name: "La Mona",
  fullName: "Restaurante La Mona",
  description:
    "Desayunos, ejecutivos, asados, cayeye, fritos y bebidas. Arma tu pedido y envíalo por WhatsApp, a domicilio o para recoger.",
  logo: "/logo.png",
  heroImage: undefined, // ej. "/portada.jpg"

  instagram: "restlamona22",
  // PENDIENTE: número de WhatsApp con indicativo, solo dígitos. Ej: "573001234567".
  // Es donde llegan los pedidos del carrito. Mientras esté vacío, el carrito solo permite
  // copiar el pedido, y "Escribir por WhatsApp" abre el chat de Instagram.
  whatsapp: "",
  chatMessage: "Hola, quisiera hacer una consulta.",
  phone: "",
  address: "",
  mapsUrl: "",

  // Horario tal como aparece en el menú publicado. Verificar (¿cierra a la 1:00 a.m. o a la 1:00 p.m.?).
  hours: { open: "05:00", close: "01:00" },
  timeZone: "America/Bogota",

  payments: ["Bancolombia", "Davivienda", "Llave"],
  notAccepted: ["Nequi"],
  delivery: true,

  // Ventana de promoción al entrar al sitio. Para usarla: pon la imagen en /public, escribe su ruta
  // en `image`, cambia `active` a true y, con cada promoción nueva, cambia el `id`.
  promo: {
    active: false,
    id: "promo-1",
    image: "", // ej. "/promo.jpg"
    alt: "Promoción de Restaurante La Mona",
    // cta: { label: "Ver el menú", href: "#menu" },
  },
};
