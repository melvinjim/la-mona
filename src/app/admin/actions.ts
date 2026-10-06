"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fileContent, getMenu, getSite } from "@/lib/content";
import { sanitizeIncludes, sanitizeOptionGroups } from "@/lib/content-schema";
import { normalizeWhatsapp } from "@/lib/order";
import { slug, uniqueId } from "@/lib/slug";
import type { ContentKey } from "@/lib/supabase/config";
import { serverClient } from "@/lib/supabase/server-client";
import type {
  CategoryIcon,
  IncludedList,
  MenuCategory,
  MenuItem,
  OptionGroup,
  Promo,
  SiteSettings,
} from "@/lib/types";

/**
 * Resultado de un formulario. Cuando algo falla viajan también los valores escritos:
 * React vacía el formulario al terminar la acción y así no se pierde lo tecleado.
 */
export type FormState = {
  error?: string;
  ok?: string;
  values?: Record<string, string>;
};

/** Devuelve el error junto con lo que el usuario había escrito. */
function fail(form: FormData, error: string): FormState {
  const values: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string" && key !== "password") values[key] = value;
  }
  return { error, values };
}

const ICONS: CategoryIcon[] = [
  "egg",
  "plate",
  "flame",
  "banana",
  "fried",
  "citrus",
  "cup",
  "water",
];

/* ------------------------------------------------------------------ */
/* Lectura del formulario                                              */
/* ------------------------------------------------------------------ */

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

/** Campo de texto opcional: vacío se guarda como "sin dato". */
const optional = (form: FormData, key: string) => text(form, key) || undefined;

const checked = (form: FormData, key: string) => form.get(key) != null;

/** "12.000" o "12000 " -> 12000. Vacío -> undefined. */
function money(form: FormData, key: string): number | undefined {
  const raw = text(form, key).replace(/[^\d]/g, "");
  if (!raw) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}

/** "Bancolombia, Davivienda" -> ["Bancolombia", "Davivienda"] */
const commaList = (form: FormData, key: string) =>
  text(form, key)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

const isTime = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

/* ------------------------------------------------------------------ */
/* Guardado en Supabase                                                */
/* ------------------------------------------------------------------ */

async function save(key: ContentKey, data: unknown): Promise<string | null> {
  const supabase = await serverClient();

  const { data: session } = await supabase.auth.getUser();
  if (!session.user) return "Tu sesión se cerró. Vuelve a entrar.";

  const { error } = await supabase
    .from("content")
    .upsert({ key, data, updated_at: new Date().toISOString() });

  if (error) {
    return error.message.includes("row-level security")
      ? "Supabase rechazó el cambio. Revisa que hayas ejecutado supabase/schema.sql."
      : `No se pudo guardar: ${error.message}`;
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/ajustes");
  return null;
}

/* ------------------------------------------------------------------ */
/* Entrar y salir                                                      */
/* ------------------------------------------------------------------ */

export async function signIn(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const email = text(form, "email");
  const password = String(form.get("password") ?? "");

  if (!email || !password) return fail(form, "Escribe el correo y la contraseña.");

  const supabase = await serverClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return fail(
      form,
      error.message === "Invalid login credentials"
        ? "Correo o contraseña incorrectos."
        : error.message,
    );
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await serverClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/* ------------------------------------------------------------------ */
/* Primera carga: pasar src/data a Supabase                            */
/* ------------------------------------------------------------------ */

export async function importFromFiles(): Promise<FormState> {
  const menuError = await save("menu", fileContent.menu);
  if (menuError) return { error: menuError };

  const siteError = await save("site", fileContent.site);
  if (siteError) return { error: siteError };

  return { ok: "Listo: el menú y los datos del sitio quedaron guardados en Supabase." };
}

/* ------------------------------------------------------------------ */
/* Ajustes del sitio                                                   */
/* ------------------------------------------------------------------ */

export async function saveSite(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const current = await getSite();

  const name = text(form, "name");
  const fullName = text(form, "fullName");
  if (!name || !fullName) return fail(form, "El nombre del restaurante es obligatorio.");

  const open = text(form, "hoursOpen");
  const close = text(form, "hoursClose");
  if (!isTime(open) || !isTime(close)) {
    return fail(form, "El horario va en formato de 24 horas, por ejemplo 05:00 y 22:30.");
  }

  // Un celular colombiano escrito sin indicativo (3019629614) se guarda con el 57 delante.
  const whatsapp = normalizeWhatsapp(text(form, "whatsapp"));
  if (whatsapp && whatsapp.length < 10) {
    return fail(
      form,
      "El WhatsApp debe tener al menos 10 dígitos, por ejemplo 3019629614 o 573019629614.",
    );
  }

  const promoImage = text(form, "promoImage");
  const promoActive = checked(form, "promoActive");
  if (promoActive && !promoImage) {
    return fail(form, "Para activar la promoción primero sube su imagen.");
  }

  const ctaLabel = text(form, "promoCtaLabel");
  const ctaHref = text(form, "promoCtaHref");

  const promo: Promo = {
    active: promoActive,
    id: text(form, "promoId") || "promo-1",
    image: promoImage,
    alt: text(form, "promoAlt") || `Promoción de ${fullName}`,
    ...(ctaLabel && ctaHref ? { cta: { label: ctaLabel, href: ctaHref } } : {}),
  };

  const site: SiteSettings = {
    name,
    fullName,
    description: text(form, "description") || current.description,
    logo: text(form, "logo") || current.logo,
    heroImage: optional(form, "heroImage"),
    instagram: optional(form, "instagram")?.replace(/^@/, ""),
    whatsapp,
    chatMessage: text(form, "chatMessage") || current.chatMessage,
    phone: optional(form, "phone"),
    address: optional(form, "address"),
    mapsUrl: optional(form, "mapsUrl"),
    hours: { open, close },
    timeZone: text(form, "timeZone") || current.timeZone,
    payments: commaList(form, "payments"),
    notAccepted: commaList(form, "notAccepted"),
    delivery: checked(form, "delivery"),
    promo,
  };

  const error = await save("site", site);
  return error ? fail(form, error) : { ok: "Ajustes guardados y publicados." };
}

/* ------------------------------------------------------------------ */
/* Menú                                                                */
/* ------------------------------------------------------------------ */

/**
 * Lee `options` e `includes` que manda el editor de opciones (un solo campo con JSON).
 * Todo se valida: lo que no tenga la forma correcta se descarta en vez de romper el sitio.
 */
function readAdvanced(
  raw: string,
): { options?: OptionGroup[]; includes?: IncludedList } | string {
  const trimmed = raw.trim();
  if (!trimmed) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return "No se pudieron leer las opciones al pedir. Recarga la página e inténtalo de nuevo.";
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return "No se pudieron leer las opciones al pedir. Recarga la página e inténtalo de nuevo.";
  }

  const { options, includes } = parsed as Record<string, unknown>;
  const groups = sanitizeOptionGroups(options);
  return {
    options: groups.length > 0 ? groups : undefined,
    includes: sanitizeIncludes(includes),
  };
}

/** Mover un plato una posición: `row` es su fila en el formulario. */
type ItemMove = { row: number; delta: -1 | 1 };

/**
 * Arma una categoría con lo que venga del formulario. Devuelve un texto si algo está mal.
 * `skipRow` descarta esa fila de platos (así se elimina uno) y `move` sube o baja un plato.
 */
function readCategory(
  form: FormData,
  takenCategoryIds: Set<string>,
  takenItemIds: Set<string>,
  skipRow = -1,
  move?: ItemMove,
): MenuCategory | string {
  const name = text(form, "name");
  if (!name) return "La categoría necesita un nombre.";

  const wantedId = slug(text(form, "id") || name);
  if (!wantedId) return "El identificador de la categoría no puede quedar vacío.";
  if (takenCategoryIds.has(wantedId)) {
    return `Ya hay otra categoría con el identificador "${wantedId}".`;
  }

  const icon = text(form, "icon") as CategoryIcon;
  if (!ICONS.includes(icon)) return "Elige un ícono de la lista.";

  const advanced = readAdvanced(String(form.get("advanced") ?? ""));
  if (typeof advanced === "string") return advanced;

  const layout = text(form, "layout") === "chips" ? "chips" : "list";
  const count = Number(text(form, "itemCount")) || 0;
  const items: MenuItem[] = [];
  const rows: number[] = []; // fila del formulario de cada plato de `items`

  for (let index = 0; index < count; index += 1) {
    if (index === skipRow) continue;
    const itemName = text(form, `item-${index}-name`);
    if (!itemName) continue; // una fila sin nombre se descarta: así se borra un plato

    const kept = text(form, `item-${index}-id`);
    const id =
      kept && !takenItemIds.has(kept)
        ? kept
        : uniqueId(`${wantedId}-${slug(itemName)}`, takenItemIds);
    takenItemIds.add(id);

    const available = checked(form, `item-${index}-available`);
    items.push({
      id,
      name: itemName,
      price: money(form, `item-${index}-price`),
      description: optional(form, `item-${index}-description`),
      image: optional(form, `item-${index}-image`),
      ...(available ? {} : { available: false }),
    });
    rows.push(index);
  }

  if (move) {
    const from = rows.indexOf(move.row);
    const to = from + move.delta;
    if (from !== -1 && to >= 0 && to < items.length) {
      [items[from], items[to]] = [items[to], items[from]];
    }
  }

  return {
    id: wantedId,
    name,
    navLabel: optional(form, "navLabel"),
    icon,
    note: optional(form, "note"),
    image: optional(form, "image"),
    price: money(form, "price"),
    layout,
    items,
    options: advanced.options,
    includes: advanced.includes,
  };
}

/**
 * Guarda una categoría. El botón que se pulse define qué hacer además de guardar:
 * agregar un plato, quitar uno, mover la categoría o borrarla.
 */
export async function saveCategory(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const intent = text(form, "intent") || "save";
  const original = text(form, "categoryId");

  const menu = await getMenu();
  const position = menu.findIndex((category) => category.id === original);
  if (position === -1) return fail(form, "Esa categoría ya no existe. Recarga la página.");

  if (intent === "delete") {
    const error = await save(
      "menu",
      menu.filter((_, index) => index !== position),
    );
    return error ? fail(form, error) : { ok: `"${menu[position].name}" se eliminó del menú.` };
  }

  const takenCategoryIds = new Set(
    menu.filter((_, index) => index !== position).map((category) => category.id),
  );
  const takenItemIds = new Set(
    menu
      .filter((_, index) => index !== position)
      .flatMap((category) => category.items.map((item) => item.id)),
  );

  const removal = intent.startsWith("remove-item-")
    ? Number(intent.slice("remove-item-".length))
    : -1;

  const itemMove = /^item-(up|down)-(\d+)$/.exec(intent);
  const move: ItemMove | undefined = itemMove
    ? { row: Number(itemMove[2]), delta: itemMove[1] === "up" ? -1 : 1 }
    : undefined;

  const category = readCategory(form, takenCategoryIds, takenItemIds, removal, move);
  if (typeof category === "string") return fail(form, category);

  if (intent === "add-item") {
    category.items.push({
      id: uniqueId(`${category.id}-nuevo`, takenItemIds),
      name: "Plato nuevo",
    });
  }

  const next = [...menu];
  next[position] = category;

  if (intent === "move-up" && position > 0) {
    [next[position - 1], next[position]] = [next[position], next[position - 1]];
  } else if (intent === "move-down" && position < next.length - 1) {
    [next[position], next[position + 1]] = [next[position + 1], next[position]];
  }

  const error = await save("menu", next);
  if (error) return fail(form, error);

  if (intent === "add-item") return { ok: "Plato agregado. Ponle nombre y precio." };
  if (removal >= 0) return { ok: "Plato eliminado." };
  if (move || intent === "move-up" || intent === "move-down") return { ok: "Orden actualizado." };
  return { ok: `"${category.name}" se guardó y ya está publicado.` };
}

export async function addCategory(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const name = text(form, "name");
  if (!name) return fail(form, "Escribe el nombre de la categoría nueva.");

  const icon = text(form, "icon") as CategoryIcon;
  if (!ICONS.includes(icon)) return fail(form, "Elige un ícono de la lista.");

  const menu = await getMenu();
  const id = uniqueId(
    slug(name),
    menu.map((category) => category.id),
  );

  const error = await save("menu", [...menu, { id, name, icon, items: [] }]);
  return error ? fail(form, error) : { ok: `Categoría "${name}" creada. Agrégale platos.` };
}
