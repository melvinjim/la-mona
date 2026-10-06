import type {
  CategoryIcon,
  IncludedList,
  MenuCategory,
  MenuItem,
  OptionChoice,
  OptionGroup,
  Promo,
  SiteSettings,
} from "./types";

/**
 * Validación de lo que viene de la base de datos o del panel. Lo que no tiene la forma esperada
 * se descarta o se corrige, para que un dato mal guardado nunca rompa el sitio público.
 */

const ICONS: readonly CategoryIcon[] = [
  "egg",
  "plate",
  "flame",
  "banana",
  "fried",
  "citrus",
  "cup",
  "water",
];

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const text = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

/** Texto sin espacios de sobra, o `undefined` si queda vacío. */
const filled = (value: unknown): string | undefined => text(value)?.trim() || undefined;

const money = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.round(value)
    : undefined;

const stringList = (value: unknown): string[] | undefined =>
  Array.isArray(value)
    ? value.flatMap((entry) => {
        const clean = filled(entry);
        return clean ? [clean] : [];
      })
    : undefined;

/** Si `id` ya se usó, agrega -2, -3... para que no se repita. */
function freeId(id: string, taken: Set<string>): string {
  let candidate = id;
  for (let n = 2; taken.has(candidate); n += 1) candidate = `${id}-${n}`;
  taken.add(candidate);
  return candidate;
}

/* ------------------------------------------------------------------ */
/* Opciones al pedir                                                   */
/* ------------------------------------------------------------------ */

function sanitizeChoice(raw: unknown, taken: Set<string>): OptionChoice | null {
  if (!isObject(raw)) return null;
  const id = filled(raw.id);
  const name = filled(raw.name);
  if (!id || !name) return null;
  return { id: freeId(id, taken), name, price: money(raw.price) || undefined };
}

function sanitizeGroup(raw: unknown, taken: Set<string>): OptionGroup | null {
  if (!isObject(raw) || !Array.isArray(raw.options)) return null;
  const id = filled(raw.id);
  const title = filled(raw.title);
  if (!id || !title) return null;

  const takenChoices = new Set<string>();
  const options = raw.options.flatMap((option) => sanitizeChoice(option, takenChoices) ?? []);
  if (options.length === 0) return null;

  // Un grupo con contador no puede ser a la vez "varias opciones": el contador manda.
  const counted = raw.counted === true;
  return {
    id: freeId(id, taken),
    title,
    required: raw.required === true ? true : undefined,
    multiple: !counted && raw.multiple === true ? true : undefined,
    counted: counted ? true : undefined,
    showInMenu: raw.showInMenu === false ? false : undefined,
    options,
  };
}

/** Grupos de opciones válidos; descarta los vacíos y arregla ids repetidos. */
export function sanitizeOptionGroups(raw: unknown): OptionGroup[] {
  if (!Array.isArray(raw)) return [];
  const taken = new Set<string>();
  return raw.flatMap((group) => sanitizeGroup(group, taken) ?? []);
}

export function sanitizeIncludes(raw: unknown): IncludedList | undefined {
  if (!isObject(raw)) return undefined;
  const items = stringList(raw.items) ?? [];
  if (items.length === 0) return undefined;
  return {
    title: filled(raw.title) ?? "Incluye",
    note: filled(raw.note),
    items,
  };
}

/* ------------------------------------------------------------------ */
/* Menú                                                                */
/* ------------------------------------------------------------------ */

function sanitizeItem(raw: unknown): MenuItem | null {
  if (!isObject(raw)) return null;
  const id = filled(raw.id);
  const name = filled(raw.name);
  if (!id || !name) return null;
  return {
    id,
    name,
    price: money(raw.price),
    description: filled(raw.description),
    image: filled(raw.image),
    available: raw.available === false ? false : undefined,
  };
}

function sanitizeCategory(raw: unknown): MenuCategory | null {
  if (!isObject(raw) || !Array.isArray(raw.items)) return null;
  const id = filled(raw.id);
  const name = filled(raw.name);
  if (!id || !name) return null;

  const options = sanitizeOptionGroups(raw.options);
  return {
    id,
    name,
    navLabel: filled(raw.navLabel),
    icon: ICONS.includes(raw.icon as CategoryIcon) ? (raw.icon as CategoryIcon) : "plate",
    note: filled(raw.note),
    image: filled(raw.image),
    price: money(raw.price),
    layout: raw.layout === "chips" ? "chips" : undefined,
    items: raw.items.flatMap((item) => sanitizeItem(item) ?? []),
    options: options.length > 0 ? options : undefined,
    includes: sanitizeIncludes(raw.includes),
  };
}

/** `null` si lo guardado no es un menú válido (se usa entonces el menú de src/data). */
export function sanitizeMenu(raw: unknown): MenuCategory[] | null {
  if (!Array.isArray(raw)) return null;
  const categories = raw.flatMap((category) => sanitizeCategory(category) ?? []);
  return categories.length > 0 || raw.length === 0 ? categories : null;
}

/* ------------------------------------------------------------------ */
/* Datos del sitio                                                     */
/* ------------------------------------------------------------------ */

const time = (value: unknown) =>
  typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : undefined;

/** Una zona horaria inventada haría fallar el cálculo de la hora en toda la página. */
function validTimeZone(value: unknown): string | undefined {
  const zone = filled(value);
  if (!zone) return undefined;
  try {
    new Intl.DateTimeFormat("en", { timeZone: zone });
    return zone;
  } catch {
    return undefined;
  }
}

function sanitizePromo(raw: unknown): Promo | undefined {
  if (!isObject(raw)) return undefined;
  const cta = isObject(raw.cta) ? raw.cta : null;
  const ctaLabel = cta && filled(cta.label);
  const ctaHref = cta && filled(cta.href);
  return {
    active: raw.active === true,
    id: filled(raw.id) ?? "promo-1",
    image: filled(raw.image) ?? "",
    alt: text(raw.alt) ?? "",
    cta: ctaLabel && ctaHref ? { label: ctaLabel, href: ctaHref } : undefined,
  };
}

/**
 * Datos del sitio guardados en la base de datos. Lo obligatorio que falte o esté mal toma el
 * valor de `fallback` (src/data/site.ts); lo opcional vacío queda vacío. `null` si no hay datos.
 */
export function sanitizeSite(raw: unknown, fallback: SiteSettings): SiteSettings | null {
  if (!isObject(raw)) return null;

  const open = isObject(raw.hours) ? time(raw.hours.open) : undefined;
  const close = isObject(raw.hours) ? time(raw.hours.close) : undefined;

  return {
    name: filled(raw.name) ?? fallback.name,
    fullName: filled(raw.fullName) ?? fallback.fullName,
    description: filled(raw.description) ?? fallback.description,
    logo: filled(raw.logo) ?? fallback.logo,
    heroImage: filled(raw.heroImage),
    instagram: filled(raw.instagram),
    whatsapp: filled(raw.whatsapp),
    chatMessage: filled(raw.chatMessage) ?? fallback.chatMessage,
    phone: filled(raw.phone),
    address: filled(raw.address),
    mapsUrl: filled(raw.mapsUrl),
    hours: open && close ? { open, close } : fallback.hours,
    timeZone: validTimeZone(raw.timeZone) ?? fallback.timeZone,
    payments: stringList(raw.payments) ?? fallback.payments,
    notAccepted: stringList(raw.notAccepted),
    delivery: typeof raw.delivery === "boolean" ? raw.delivery : fallback.delivery,
    promo: sanitizePromo(raw.promo),
  };
}
