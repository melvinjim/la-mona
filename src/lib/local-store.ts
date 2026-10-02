/**
 * Almacén mínimo sobre localStorage, pensado para useSyncExternalStore:
 * - en el servidor siempre devuelve null (así el HTML inicial es igual para todos);
 * - si el navegador no permite guardar, sigue funcionando en memoria mientras la página esté abierta;
 * - se sincroniza entre pestañas.
 */
export type LocalStore = {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => string | null;
  getServerSnapshot: () => string | null;
  set: (value: string | null) => void;
};

export function createLocalStore(key: string): LocalStore {
  const listeners = new Set<() => void>();
  let cache: string | null | undefined;

  const read = () => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  return {
    subscribe(onChange) {
      listeners.add(onChange);
      const onStorage = (event: StorageEvent) => {
        if (event.key === key || event.key === null) {
          cache = undefined;
          onChange();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(onChange);
        window.removeEventListener("storage", onStorage);
      };
    },

    getSnapshot() {
      if (cache === undefined) cache = read();
      return cache;
    },

    getServerSnapshot: () => null,

    set(value) {
      cache = value;
      try {
        if (value === null) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, value);
      } catch {
        // Sin almacenamiento disponible: se mantiene solo en memoria.
      }
      listeners.forEach((listener) => listener());
    },
  };
}

export const cartStore = createLocalStore("lamona:cart:v1");
export const customerStore = createLocalStore("lamona:customer:v1");
export const promoStore = createLocalStore("lamona:promo-dismissed");
