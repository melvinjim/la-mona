import { useSyncExternalStore } from "react";
import { isOpenAt, minutesNow } from "@/lib/hours";
import type { SiteSettings } from "@/lib/types";

type OpenState = "open" | "closed" | "unknown";

const subscribe = (onChange: () => void) => {
  const id = setInterval(onChange, 30_000);
  return () => clearInterval(id);
};

/** Abierto/cerrado según la hora de Colombia. En el servidor es "unknown" para no desfasar el HTML. */
export function useOpenState(
  hours: SiteSettings["hours"],
  timeZone: string,
): OpenState {
  return useSyncExternalStore<OpenState>(
    subscribe,
    () => (isOpenAt(minutesNow(timeZone), hours) ? "open" : "closed"),
    () => "unknown",
  );
}
