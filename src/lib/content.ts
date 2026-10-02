import { menu } from "@/data/menu";
import { site } from "@/data/site";
import type { MenuCategory, SiteSettings } from "@/lib/types";

/**
 * Punto único de lectura del contenido.
 *
 * Hoy lee los archivos de src/data. Cuando exista el panel administrativo, basta con
 * reemplazar el cuerpo de estas dos funciones para leer de la base de datos
 * (Supabase, Neon, Vercel Postgres, etc.); la página y los componentes no cambian.
 */
export async function getMenu(): Promise<MenuCategory[]> {
  return menu;
}

export async function getSite(): Promise<SiteSettings> {
  return site;
}
