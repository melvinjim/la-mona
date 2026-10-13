import { menu as fileMenu } from "@/data/menu";
import { site as fileSite } from "@/data/site";
import { sanitizeMenu, sanitizeSite, sanitizeZones } from "@/lib/content-schema";
import { supabaseReady, type ContentKey } from "@/lib/supabase/config";
import { publicClient } from "@/lib/supabase/public-client";
import type { DeliveryZone, MenuCategory, SiteSettings } from "@/lib/types";

/**
 * Punto único de lectura del contenido.
 *
 * Si Supabase está configurado y tiene datos guardados, manda Supabase (lo que se edita
 * en el panel administrativo). Si no, se usan los archivos de `src/data`, que siguen
 * sirviendo de respaldo y de contenido inicial. Lo guardado se valida antes de usarlo:
 * un dato dañado se descarta en vez de romper la página.
 */

export type ContentSource = "supabase" | "archivos";

async function read(key: ContentKey): Promise<unknown> {
  if (!supabaseReady) return null;
  try {
    const { data, error } = await publicClient()
      .from("content")
      .select("data")
      .eq("key", key)
      .maybeSingle();
    if (error) throw error;
    return data?.data ?? null;
  } catch (error) {
    console.error(
      `[content] No se pudo leer "${key}" de Supabase; se usan los datos de src/data.`,
      error,
    );
    return null;
  }
}

export async function getMenu(): Promise<MenuCategory[]> {
  return sanitizeMenu(await read("menu")) ?? fileMenu;
}

export async function getSite(): Promise<SiteSettings> {
  return sanitizeSite(await read("site"), fileSite) ?? fileSite;
}

/**
 * Barrios con domicilio, de la tabla `delivery_zones` de Supabase (se editan en el panel, pestaña
 * Domicilios). `state` dice por qué puede estar vacía: sin Supabase, sin crear la tabla, error, o ok.
 */
export type ZonesState = "ok" | "sin-supabase" | "falta-tabla" | "error";

export async function getZoneList(): Promise<{ zones: DeliveryZone[]; state: ZonesState }> {
  if (!supabaseReady) return { zones: [], state: "sin-supabase" };
  try {
    const { data, error } = await publicClient()
      .from("delivery_zones")
      .select("id,name,fee")
      .order("name");
    if (error) {
      // PGRST205 / 42P01: la tabla todavía no existe (falta correr supabase/schema.sql).
      const missing = error.code === "PGRST205" || error.code === "42P01";
      if (!missing) console.error("[content] No se pudieron leer los barrios:", error);
      return { zones: [], state: missing ? "falta-tabla" : "error" };
    }
    const rows = (data ?? []) as { id: number | string; name: string; fee: number }[];
    return {
      zones: sanitizeZones(rows.map((row) => ({ ...row, id: String(row.id) }))),
      state: "ok",
    };
  } catch (error) {
    console.error("[content] No se pudieron leer los barrios:", error);
    return { zones: [], state: "error" };
  }
}

export const getZones = async () => (await getZoneList()).zones;

/** De dónde salió cada cosa. Lo usa el panel para avisar si todavía no hay nada guardado. */
export async function getContentSources(): Promise<
  Record<ContentKey, ContentSource>
> {
  const [menu, site] = await Promise.all([read("menu"), read("site")]);
  return {
    menu: sanitizeMenu(menu) ? "supabase" : "archivos",
    site: sanitizeSite(site, fileSite) ? "supabase" : "archivos",
  };
}

/** Contenido de respaldo, el de `src/data`. Sirve para cargarlo por primera vez en Supabase. */
export const fileContent = { menu: fileMenu, site: fileSite };
