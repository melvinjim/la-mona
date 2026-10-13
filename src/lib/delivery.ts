import type { MenuCategory } from "./types";

/**
 * Menú de domicilios: cada producto cuesta `surcharge` pesos más que en el menú del local.
 * Se aplica al precio de cada plato y al precio único de la categoría (ej. los batidos).
 * Lo que no tiene precio se queda sin precio. Los adicionales no cambian.
 */
export function withDeliveryPrices(
  menu: MenuCategory[],
  surcharge: number | undefined,
): MenuCategory[] {
  const extra = Math.round(surcharge ?? 0);
  if (!Number.isFinite(extra) || extra <= 0) return menu;

  const raise = (price: number | undefined) => (price === undefined ? undefined : price + extra);

  return menu.map((category) => ({
    ...category,
    price: raise(category.price),
    items: category.items.map((item) => ({ ...item, price: raise(item.price) })),
  }));
}
