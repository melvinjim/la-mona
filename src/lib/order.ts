import type { SiteSettings } from "@/lib/types";

export type ChatLink = {
  href: string;
  channel: "whatsapp" | "instagram";
};

/**
 * Solo los dígitos de un número de WhatsApp. Un celular colombiano escrito sin indicativo
 * (10 dígitos, ej. 3019629614) se completa con el 57.
 */
export function normalizeWhatsapp(value: string | undefined): string {
  const digits = (value ?? "").replace(/\D/g, "");
  return /^3\d{9}$/.test(digits) ? `57${digits}` : digits;
}

/** Número de WhatsApp configurado, listo para wa.me ("" si no hay). */
export function whatsappDigits(site: Pick<SiteSettings, "whatsapp">): string {
  return normalizeWhatsapp(site.whatsapp);
}

/** Chat directo (sin pedido): WhatsApp si hay número configurado; si no, el chat de Instagram. */
export function getChatLink(site: SiteSettings): ChatLink | null {
  const digits = whatsappDigits(site);
  if (digits) {
    return {
      href: `https://wa.me/${digits}?text=${encodeURIComponent(site.chatMessage)}`,
      channel: "whatsapp",
    };
  }
  if (site.instagram) {
    return { href: `https://ig.me/m/${site.instagram}`, channel: "instagram" };
  }
  return null;
}

/** Precio más bajo de una categoría (para el resumen "desde $X"). */
export function minPrice(category: {
  price?: number;
  items: { price?: number }[];
}): number | null {
  const prices = category.items
    .map((item) => item.price ?? category.price)
    .filter((price): price is number => typeof price === "number");
  return prices.length ? Math.min(...prices) : (category.price ?? null);
}
