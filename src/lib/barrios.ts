import { slug } from "./slug";
import type { DeliveryZone } from "./types";

/**
 * Reconocer el barrio que escribe el cliente aunque lo escriba "como sea": con o sin espacios,
 * en mayúsculas, sin tildes, con letras de más o de menos ("san isidro", "sanisidro",
 * "SANSISDRO", "SANISISdro"). Todo se compara por cómo suena en español, no por cómo se escribe.
 */

export type ZoneMatch =
  /** Todavía no hay nada que comparar (vacío o muy corto). */
  | { status: "empty" }
  /** Reconocido: se puede cobrar su domicilio. `exact` es falso si se corrigió algún error. */
  | { status: "ok"; zone: DeliveryZone; exact: boolean }
  /** Podría ser alguno de estos: el cliente debe tocar el suyo. */
  | { status: "suggest"; options: DeliveryZone[] }
  /** No se parece a ningún barrio con domicilio. */
  | { status: "none" };

/* ------------------------------------------------------------------ */
/* Normalización                                                       */
/* ------------------------------------------------------------------ */

const stripAccents = (text: string) =>
  text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** Palabras que solo acompañan al nombre cuando van al principio ("Barrio San Isidro"). */
const LEADING = new Set([
  "barrio",
  "br",
  "bo",
  "b",
  "urbanizacion",
  "urb",
  "sector",
  "sec",
  "conjunto",
  "cj",
  "residencial",
]);

const ARTICLES = new Set(["de", "del", "la", "las", "el", "los", "y"]);

const ROMAN: Record<string, string> = {
  i: "1",
  ii: "2",
  iii: "3",
  iv: "4",
  v: "5",
  vi: "6",
  vii: "7",
  viii: "8",
  ix: "9",
  x: "10",
};

function words(text: string): string[] {
  const list = stripAccents(text)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  while (list.length > 1 && LEADING.has(list[0])) list.shift();
  // "San Isidro II" y "San Isidro 2" son el mismo barrio.
  return list.map((word, index) => (index > 0 && ROMAN[word] ? ROMAN[word] : word));
}

/** Aproxima cómo suena una palabra en español: b/v, s/z/c, k/qu/c, h muda, ll/y, g/j... */
function sound(text: string): string {
  return text
    .replace(/ll/g, "y")
    .replace(/ch/g, "x")
    .replace(/qu/g, "k")
    .replace(/gu([ei])/g, "g$1")
    .replace(/g([ei])/g, "j$1")
    .replace(/c([ei])/g, "s$1")
    .replace(/c/g, "k")
    .replace(/z/g, "s")
    .replace(/v/g, "b")
    .replace(/w/g, "u")
    .replace(/h/g, "")
    .replace(/y(?![aeiou])/g, "i")
    .replace(/([a-z])\1+/g, "$1");
}

type Keys = {
  /** Lo escrito, sin tildes ni espacios (para saber si coincide al pie de la letra). */
  plain: string;
  /** Cómo suena, con todas las palabras. */
  full: string;
  /** Cómo suena, sin artículos ("la", "de"...). */
  core: string;
};

/** "sanisidroii" (todo junto) cuenta igual que "San Isidro 2". */
const joinWords = (list: string[]) =>
  list
    .join("")
    .replace(/^([a-z]{4,}?)(viii|vii|iii|ii|iv|vi|ix)$/, (_, base: string, roman: string) => base + ROMAN[roman]);

function keysOf(text: string): Keys {
  const list = words(text);
  const significant = list.filter((word) => !ARTICLES.has(word));
  return {
    plain: joinWords(list),
    full: sound(joinWords(list)),
    core: sound(joinWords(significant.length > 0 ? significant : list)),
  };
}

const keyCache = new WeakMap<DeliveryZone, Keys>();
function zoneKeys(zone: DeliveryZone): Keys {
  let keys = keyCache.get(zone);
  if (!keys) {
    keys = keysOf(zone.name);
    keyCache.set(zone, keys);
  }
  return keys;
}

/** Distancia de edición (inserciones, borrados, cambios y letras intercambiadas). */
function distance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const rows: number[][] = Array.from({ length: a.length + 1 }, (_, i) => {
    const row = new Array<number>(b.length + 1).fill(0);
    row[0] = i;
    return row;
  });
  for (let j = 0; j <= b.length; j += 1) rows[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1);
      }
    }
  }
  return rows[a.length][b.length];
}

/** Cuántos errores se perdonan según el largo: nada en nombres cortos, ~25 % en los largos. */
const tolerance = (length: number) => (length <= 4 ? 0 : Math.floor(length * 0.25));

/* ------------------------------------------------------------------ */
/* Búsqueda                                                            */
/* ------------------------------------------------------------------ */

type Scored = { zone: DeliveryZone; distance: number; eligible: boolean; relative: number };

function score(query: Keys, zone: DeliveryZone): Scored {
  const target = zoneKeys(zone);
  const pairs: [string, string][] = [
    [query.full, target.full],
    [query.core, target.core],
    [query.full, target.core],
    [query.core, target.full],
  ];

  let best = Number.POSITIVE_INFINITY;
  let eligible = false;
  let relative = Number.POSITIVE_INFINITY;
  for (const [a, b] of pairs) {
    const d = distance(a, b);
    const longest = Math.max(a.length, b.length);
    if (d <= tolerance(longest)) {
      eligible = true;
      best = Math.min(best, d);
    } else if (!eligible) {
      best = Math.min(best, d);
    }
    relative = Math.min(relative, d / longest);
  }
  return { zone, distance: best, eligible, relative };
}

const MAX_OPTIONS = 5;

export function matchZone(input: string, zones: readonly DeliveryZone[]): ZoneMatch {
  const query = keysOf(input);
  if (query.plain.length < 3 || zones.length === 0) return { status: "empty" };

  const scored = zones.map((zone) => score(query, zone));

  const eligible = scored
    .filter((entry) => entry.eligible)
    .sort((a, b) => a.distance - b.distance);

  if (eligible.length > 0) {
    const [best, second] = eligible;
    if (!second || best.distance < second.distance) {
      return {
        status: "ok",
        zone: best.zone,
        exact: zoneKeys(best.zone).plain === query.plain,
      };
    }
    // Dos barrios igual de parecidos: que el cliente elija.
    const tied = eligible.filter((entry) => entry.distance === best.distance);
    return { status: "suggest", options: tied.slice(0, MAX_OPTIONS).map((entry) => entry.zone) };
  }

  // Lo escrito está dentro del nombre de un barrio ("isidro" -> San Isidro), o al revés
  // ("San Isidro casa 5"): se ofrece, pero no se da por válido sin que el cliente lo confirme.
  if (query.core.length >= 4) {
    const contained = zones.filter((zone) => {
      const target = zoneKeys(zone);
      return (
        target.core.includes(query.core) ||
        (target.core.length >= 5 && query.core.includes(target.core))
      );
    });
    if (contained.length > 0) {
      return { status: "suggest", options: contained.slice(0, MAX_OPTIONS) };
    }
  }

  const near = scored
    .filter((entry) => entry.relative <= 0.4)
    .sort((a, b) => a.relative - b.relative)
    .slice(0, 3)
    .map((entry) => entry.zone);
  return near.length > 0 ? { status: "suggest", options: near } : { status: "none" };
}

/* ------------------------------------------------------------------ */
/* Lista que se filtra mientras el cliente escribe                     */
/* ------------------------------------------------------------------ */

type Ranked<T> = { zone: T; rank: number; extra: number };

/** Qué tanto se parece un barrio a lo escrito. `rank` 0 es lo más parecido; null es que no. */
function rankZone<T extends DeliveryZone>(query: Keys, zone: T): Ranked<T> | null {
  const target = zoneKeys(zone);
  const extra = Math.abs(target.plain.length - query.plain.length);

  /*
   * Comparar por cómo suena solo tiene sentido con tres sonidos o más. "zzz" suena "s", y con
   * un solo sonido entraría cualquier barrio que lleve una s. Con menos, se compara tal cual
   * se escribió: así "r" sigue mostrando los barrios con r y "zzz" no muestra ninguno.
   */
  const bySound = query.full.length >= 3;

  // Empieza igual: "reb" -> "Rebolo".
  if (target.plain.startsWith(query.plain) || (bySound && target.full.startsWith(query.full))) {
    return { zone, rank: 0, extra };
  }
  // Alguna de sus palabras empieza igual: "nieves" -> "Las Nieves".
  const startsWord = words(zone.name).some((word) =>
    bySound ? sound(word).startsWith(query.full) : word.startsWith(query.plain),
  );
  if (startsWord) return { zone, rank: 1, extra };

  // Lo escrito está en alguna parte del nombre.
  if (target.plain.includes(query.plain) || (bySound && target.full.includes(query.full))) {
    return { zone, rank: 2, extra };
  }
  if (!bySound) return null;

  // Escrito con errores: se compara por cómo suena ("rebollo" -> "Rebolo").
  const sounded = Math.min(
    distance(query.full, target.full),
    distance(query.core, target.core),
  );
  return sounded <= tolerance(Math.max(query.full.length, target.full.length))
    ? { zone, rank: 3, extra: sounded }
    : null;
}

/**
 * Barrios que se parecen a lo que el cliente lleva escrito, para la lista que se filtra sola
 * mientras escribe. Van primero los que empiezan igual, después los que lo contienen y de
 * últimos los que suenan parecido. Sin nada escrito no se muestra nada.
 */
export function searchZones<T extends DeliveryZone>(
  input: string,
  zones: readonly T[],
  limit = 8,
): T[] {
  const query = keysOf(input);
  if (query.plain.length === 0) return [];

  return zones
    .flatMap((zone) => rankZone(query, zone) ?? [])
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        a.extra - b.extra ||
        a.zone.name.localeCompare(b.zone.name, "es"),
    )
    .slice(0, limit)
    .map((entry) => entry.zone);
}

/* ------------------------------------------------------------------ */
/* Lista de barrios en texto (para el panel)                           */
/* ------------------------------------------------------------------ */

/** Una línea por barrio: "San Isidro - 5000". Es lo que se muestra y se edita en el panel. */
export const formatZoneLines = (zones: readonly DeliveryZone[]) =>
  zones.map((zone) => `${zone.name} - ${zone.fee}`).join("\n");

/** Valor en pesos de un texto como "5000", "5.000", "$ 5,000" o "5.000,00". */
function parseFee(raw: string): number {
  const withoutCents = raw.replace(/[.,]\d{1,2}$/, "");
  return Number(withoutCents.replace(/\D/g, ""));
}

export const MIN_FEE = 100;

/**
 * Lee una lista de barrios, una por línea, con el nombre y el valor separados por guion,
 * dos puntos, coma, punto y coma o tabulador (sirve pegar desde Excel):
 *   San Isidro - 5000
 *   Rebolo: $4.500
 * Devuelve los barrios leídos y un mensaje por cada línea que no se pudo usar.
 */
export function parseZoneLines(text: string): { zones: DeliveryZone[]; errors: string[] } {
  const zones: DeliveryZone[] = [];
  const errors: string[] = [];
  const seenNames = new Set<string>();
  const seenIds = new Set<string>();

  for (const line of text.split(/\r?\n/)) {
    const clean = line.trim();
    if (!clean) continue;

    const parts = clean.match(/^(.*?\S)[\s:;,=|\t\-–—]*\$?\s*(\d[\d.,]*)\s*$/);
    if (!parts) {
      errors.push(`"${clean}": falta el valor del domicilio.`);
      continue;
    }

    const name = parts[1].trim();
    const fee = parseFee(parts[2]);
    if (!Number.isFinite(fee) || fee < MIN_FEE) {
      errors.push(`"${clean}": el valor es muy bajo; escríbelo completo, por ejemplo 5000.`);
      continue;
    }

    const key = keysOf(name).plain;
    if (!key) {
      errors.push(`"${clean}": falta el nombre del barrio.`);
      continue;
    }
    if (seenNames.has(key)) {
      errors.push(`"${clean}": ese barrio está repetido.`);
      continue;
    }
    seenNames.add(key);

    const base = slug(name) || "barrio";
    let id = base;
    for (let n = 2; seenIds.has(id); n += 1) id = `${base}-${n}`;
    seenIds.add(id);

    zones.push({ id, name, fee });
  }

  return { zones, errors };
}

/* ------------------------------------------------------------------ */
/* Guardar la lista en la base de datos                                */
/* ------------------------------------------------------------------ */

export type StoredZone = { id: number | string; name: string; fee: number };
export type ZoneInput = { name: string; fee: number };

/** Igual que la columna `name_key` de la tabla: sin espacios de sobra y en minúsculas. */
const storedKey = (name: string) => name.trim().toLowerCase();

/**
 * Compara los barrios que ya hay en la tabla con la lista nueva y dice qué hacer para dejarla
 * igual: quitar los que ya no están, actualizar los que cambiaron de valor o de escritura, y
 * agregar los nuevos. Así no se borra y se vuelve a crear todo cada vez que se guarda.
 */
export function planZoneSync(current: readonly StoredZone[], desired: readonly ZoneInput[]) {
  const wanted = new Map(desired.map((zone) => [storedKey(zone.name), zone]));
  const existing = new Map(current.map((zone) => [storedKey(zone.name), zone]));

  const deleteIds = current.filter((zone) => !wanted.has(storedKey(zone.name))).map((zone) => zone.id);

  const updates = current.flatMap((zone) => {
    const next = wanted.get(storedKey(zone.name));
    return next && (next.name !== zone.name || next.fee !== zone.fee)
      ? [{ id: zone.id, name: next.name, fee: next.fee }]
      : [];
  });

  const inserts = desired
    .filter((zone) => !existing.has(storedKey(zone.name)))
    .map(({ name, fee }) => ({ name, fee }));

  return { deleteIds, updates, inserts };
}
