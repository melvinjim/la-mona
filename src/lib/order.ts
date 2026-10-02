import type { SiteSettings } from "@/lib/types";

export type ChatLink = {
  href: string;
  channel: "whatsapp" | "instagram";
};

/** Solo los dígitos del número de WhatsApp configurado ("" si no hay). */
export function whatsappDigits(site: Pick<SiteSettings, "whatsapp">): string {
  return (site.whatsapp ?? "").replace(/\D/g, "");
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
