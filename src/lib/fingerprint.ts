import type { SiteSettings } from "./types";

/**
 * Huella corta de un dato, para saber si cambió desde que se cargó la página.
 *
 * El panel la manda escondida en el formulario; al guardar se vuelve a calcular con lo que hay
 * en la base y, si no coincide, es que otra persona lo cambió mientras tanto. Así se avisa en
 * vez de pisar su trabajo sin que nadie se entere.
 */
export function fingerprint(value: unknown): string {
  const text = JSON.stringify(value) ?? "";
  let hash = 5381;
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash * 33) ^ text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(36);
}

/**
 * Huella de los ajustes, contando solo los campos que escribe ese formulario.
 *
 * El recargo de domicilios queda fuera a propósito: se edita en otra pestaña y al guardar se
 * conserva tal cual, así que incluirlo haría saltar un aviso de choque donde no lo hay.
 */
export const siteFingerprint = (site: SiteSettings) =>
  fingerprint([
    site.name,
    site.fullName,
    site.description,
    site.logo,
    site.instagram,
    site.whatsapp,
    site.chatMessage,
    site.phone,
    site.address,
    site.city,
    site.mapsUrl,
    site.hours.open,
    site.hours.close,
    site.timeZone,
    site.payments,
    site.notAccepted,
    site.delivery,
  ]);
