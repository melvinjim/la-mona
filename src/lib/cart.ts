import { formatCOP } from "./format";
import type { MenuCategory, OptionChoice, OptionGroup } from "./types";

export const MAX_QTY = 99;
export const MAX_NOTE = 140;

/* ------------------------------------------------------------------ */
/* Catálogo: lo que se puede pedir, con su precio vigente              */
/* ------------------------------------------------------------------ */

export type CatalogItem = {
  id: string;
  name: string;
  /** Nombre que va en el pedido; si se repite en otra categoría se aclara, ej. "Mora (Jugos batidos)". */
  orderName: string;
  categoryName: string;
  price: number;
  description?: string;
  image?: string;
  available: boolean;
  options: OptionGroup[];
  includes: string[];
};

export type Catalog = Record<string, CatalogItem>;

const normalize = (text: string) => text.trim().toLowerCase();

/** Solo entran al catálogo los platos que tienen precio (propio o de la categoría). */
export function buildCatalog(menu: MenuCategory[]): Catalog {
  const counts = new Map<string, number>();
  for (const category of menu) {
    for (const item of category.items) {
      const key = normalize(item.name);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  const catalog: Catalog = {};
  for (const category of menu) {
    for (const item of category.items) {
      const price = item.price ?? category.price;
      if (price === undefined) continue;
      const repeated = (counts.get(normalize(item.name)) ?? 0) > 1;
      catalog[item.id] = {
        id: item.id,
        name: item.name,
        orderName: repeated ? `${item.name} (${category.name})` : item.name,
        categoryName: category.name,
        price,
        description: item.description,
        image: item.image,
        available: item.available !== false,
        options: category.options ?? [],
        includes: category.includes?.items ?? [],
      };
    }
  }
  return catalog;
}

/** Un plato abre la ventana de opciones si hay algo que elegir o aclarar. */
export const needsDialog = (item: CatalogItem) =>
  item.options.length > 0 || item.includes.length > 0;

/* ------------------------------------------------------------------ */
/* Opciones elegidas                                                   */
/* ------------------------------------------------------------------ */

export const optionKey = (groupId: string, optionId: string) =>
  `${groupId}:${optionId}`;

/** Texto de una opción con su recargo: "Papas fritas (+$3.000)". */
export function optionLabel(option: OptionChoice, suffix = ""): string {
  return option.price
    ? `${option.name} (+${formatCOP(option.price)}${suffix})`
    : option.name;
}

/** Selección en curso en la ventana de opciones: id del grupo -> ids de las opciones marcadas. */
export type Picked = Record<string, string[]>;

export const missingGroups = (item: CatalogItem, picked: Picked) =>
  item.options.filter((group) => group.required && !picked[group.id]?.length);

export const pickedOptionIds = (item: CatalogItem, picked: Picked) =>
  item.options.flatMap((group) =>
    (picked[group.id] ?? []).map((id) => optionKey(group.id, id)),
  );

export function pickedSurcharge(item: CatalogItem, picked: Picked): number {
  let sum = 0;
  for (const group of item.options) {
    for (const option of group.options) {
      if (picked[group.id]?.includes(option.id)) sum += option.price ?? 0;
    }
  }
  return sum;
}

/* ------------------------------------------------------------------ */
/* Líneas guardadas en el navegador (solo referencias, nunca precios)  */
/* ------------------------------------------------------------------ */

export type StoredLine = {
  key: string;
  itemId: string;
  optionIds: string[];
  note: string;
  qty: number;
};

export type NewLine = Omit<StoredLine, "key">;

const clampQty = (qty: number) =>
  Math.min(MAX_QTY, Math.max(1, Math.floor(Number.isFinite(qty) ? qty : 1)));

const cleanNote = (note: string) =>
  note.replace(/\s+/g, " ").trim().slice(0, MAX_NOTE);

/** Mismo plato + mismas opciones + misma nota = misma línea (se suma la cantidad). */
export const lineKey = (itemId: string, optionIds: string[], note: string) =>
  `${itemId}|${[...optionIds].sort().join(",")}|${cleanNote(note).toLowerCase()}`;

export function parseCart(raw: string | null): StoredLine[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];

  let lines: StoredLine[] = [];
  for (const entry of data) {
    if (typeof entry !== "object" || entry === null) continue;
    const { itemId, optionIds, note, qty } = entry as Record<string, unknown>;
    if (typeof itemId !== "string" || !Array.isArray(optionIds)) continue;
    lines = addLine(lines, {
      itemId,
      optionIds: optionIds.filter((id): id is string => typeof id === "string"),
      note: typeof note === "string" ? note : "",
      qty: Number(qty),
    });
  }
  return lines;
}

export function addLine(lines: StoredLine[], input: NewLine): StoredLine[] {
  const note = cleanNote(input.note);
  const key = lineKey(input.itemId, input.optionIds, note);
  const qty = clampQty(input.qty);

  if (lines.some((line) => line.key === key)) {
    return lines.map((line) =>
      line.key === key ? { ...line, qty: clampQty(line.qty + qty) } : line,
    );
  }
  return [
    ...lines,
    { key, itemId: input.itemId, optionIds: [...input.optionIds], note, qty },
  ];
}

export const setLineQty = (lines: StoredLine[], key: string, qty: number) =>
  qty < 1
    ? lines.filter((line) => line.key !== key)
    : lines.map((line) =>
        line.key === key ? { ...line, qty: clampQty(qty) } : line,
      );

export const removeLine = (lines: StoredLine[], key: string) =>
  lines.filter((line) => line.key !== key);

/* ------------------------------------------------------------------ */
/* Líneas con el precio y las opciones actuales del menú               */
/* ------------------------------------------------------------------ */

export type ResolvedLine = {
  key: string;
  item: CatalogItem;
  qty: number;
  note: string;
  choices: { group: OptionGroup; chosen: OptionChoice[] }[];
  unitPrice: number;
  total: number;
  /**
   * ok: cuenta en el total. unavailable: el plato está agotado.
   * outdated: el menú cambió y hay que volver a elegir las opciones.
   */
  status: "ok" | "unavailable" | "outdated";
};

export function resolveLine(line: StoredLine, item: CatalogItem): ResolvedLine {
  const picked = new Set(line.optionIds);
  const choices = item.options.map((group) => ({
    group,
    chosen: group.options.filter((option) =>
      picked.has(optionKey(group.id, option.id)),
    ),
  }));

  const surcharge = choices.reduce(
    (sum, { chosen }) => sum + chosen.reduce((s, o) => s + (o.price ?? 0), 0),
    0,
  );
  const invalid = choices.some(
    ({ group, chosen }) =>
      (group.required && chosen.length === 0) ||
      (!group.multiple && chosen.length > 1),
  );
  const unitPrice = item.price + surcharge;

  return {
    key: line.key,
    item,
    qty: line.qty,
    note: line.note,
    choices,
    unitPrice,
    total: unitPrice * line.qty,
    status: !item.available ? "unavailable" : invalid ? "outdated" : "ok",
  };
}

/** Los platos que ya no existen en el menú se descartan en silencio. */
export const resolveCart = (lines: StoredLine[], catalog: Catalog) =>
  lines.flatMap((line) => {
    const item = catalog[line.itemId];
    return item ? [resolveLine(line, item)] : [];
  });

export function cartSummary(lines: ResolvedLine[]) {
  let count = 0;
  let total = 0;
  for (const line of lines) {
    if (line.status !== "ok") continue;
    count += line.qty;
    total += line.total;
  }
  return { count, total };
}
