export type CategoryIcon =
  | "egg"
  | "plate"
  | "flame"
  | "banana"
  | "fried"
  | "citrus"
  | "cup"
  | "water";

export type MenuItem = {
  id: string;
  name: string;
  /** Precio en pesos colombianos (COP). Si falta, se usa el precio de la categoría. */
  price?: number;
  description?: string;
  /** Ruta dentro de /public (ej. "/menu/lomo-asado.jpg") o URL de un dominio permitido en next.config.ts */
  image?: string;
  /** `false` muestra el plato como "Agotado" y no se puede pedir. */
  available?: boolean;
};

export type OptionChoice = {
  /** Identificador estable dentro del grupo (no lo cambies si ya hay pedidos guardados). */
  id: string;
  name: string;
  /** Recargo en COP por unidad. Sin precio = incluido. */
  price?: number;
};

/** Cosas que el cliente elige al pedir un plato: acompañante, adicionales, agua o leche, etc. */
export type OptionGroup = {
  id: string;
  title: string;
  /** `true`: hay que elegir algo para poder agregar el plato al pedido. */
  required?: boolean;
  /** `true`: se pueden marcar varias opciones; si no, solo una. */
  multiple?: boolean;
  /**
   * `true`: cada opción se pide con un contador, para poder repetirla
   * (ej. 2 adicionales de queso + 1 de chicharrón). Cada unidad suma su `price`.
   */
  counted?: boolean;
  /** `false`: no se muestra como recuadro en el menú, solo al momento de pedir. */
  showInMenu?: boolean;
  options: OptionChoice[];
};

/** Lista informativa de lo que ya incluye cada plato de la categoría. */
export type IncludedList = {
  title: string;
  note?: string;
  items: string[];
};

export type MenuCategory = {
  /** Se usa como ancla en la URL (#asados). Solo minúsculas, números y guiones. */
  id: string;
  name: string;
  /** Nombre corto para la barra de navegación. */
  navLabel?: string;
  icon: CategoryIcon;
  note?: string;
  /** Foto de la categoría (se muestra en escritorio). */
  image?: string;
  /** Precio único para toda la categoría (ej. todos los batidos a $7.000). */
  price?: number;
  /** "chips" muestra los items como etiquetas, sin precio individual. */
  layout?: "list" | "chips";
  /**
   * `true`: en la página de domicilios esta categoría cuesta lo mismo que en el local (sin el
   * recargo por producto). Por defecto el recargo se aplica.
   */
  noDeliverySurcharge?: boolean;
  items: MenuItem[];
  /** Opciones que se eligen al pedir cualquier plato de la categoría. */
  options?: OptionGroup[];
  includes?: IncludedList;
};

/** Ventana de promoción que se muestra al entrar al sitio (una vez por visitante). */
export type Promo = {
  active: boolean;
  /**
   * Identifica la promoción. Quien la cierra no la vuelve a ver hasta que cambie este valor
   * (o hasta que borre los datos del navegador).
   */
  id: string;
  /** Ruta en /public (ej. "/promo.jpg") o URL de un dominio permitido en next.config.ts */
  image: string;
  alt: string;
  /** Botón opcional bajo la imagen. `href` puede ser "#menu" o un enlace externo. */
  cta?: { label: string; href: string };
};

/** Barrio al que se hace domicilio y su valor fijo. Viene de la tabla `delivery_zones` de Supabase. */
export type DeliveryZone = {
  id: string;
  name: string;
  /** Valor del domicilio en COP. */
  fee: number;
};

/**
 * Qué se está viendo: "menu" es la carta del local (la del QR de las mesas, solo para ver);
 * "domicilio" es la página para pedir a domicilio, con carrito y precios de domicilio.
 */
export type SiteMode = "menu" | "domicilio";

export type SiteSettings = {
  name: string;
  fullName: string;
  description: string;
  logo: string;
  /** Foto principal opcional para la portada. */
  heroImage?: string;
  /** Usuario de Instagram, sin @. */
  instagram?: string;
  /** Número de WhatsApp con indicativo de país, solo dígitos (ej. "573001234567"). */
  whatsapp?: string;
  /** Mensaje que aparece escrito al abrir el chat directo (botón "Escribir por WhatsApp"). */
  chatMessage: string;
  phone?: string;
  address?: string;
  /** Enlace de Google Maps del local. */
  mapsUrl?: string;
  /** Horario en formato 24 h. Si `close` es menor que `open`, cierra al día siguiente. */
  hours: { open: string; close: string };
  timeZone: string;
  payments: string[];
  notAccepted?: string[];
  delivery: boolean;
  /**
   * Lo que cuesta de más cada producto en el menú de domicilios respecto al del local (COP).
   * 0 o vacío = mismos precios.
   */
  deliverySurcharge?: number;
  promo?: Promo;
};
