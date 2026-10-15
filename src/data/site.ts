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

  instagram: "restlamona22",
  // WhatsApp donde llegan los pedidos del carrito: indicativo + número, solo dígitos.
  // Si lo dejas vacío, el carrito solo permite copiar el pedido, y "Escribir por WhatsApp"
  // abre el chat de Instagram.
  whatsapp: "573019629614",
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
  // Menú de domicilios: cada producto cuesta esto más que en el menú del local.
  deliverySurcharge: 1000,
  // Los barrios con domicilio y su valor NO van aquí: viven en la tabla delivery_zones de
  // Supabase y se editan desde el panel (pestaña Domicilios).
};
