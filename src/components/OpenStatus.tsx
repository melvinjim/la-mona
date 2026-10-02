"use client";

import { formatTimeWithArticle } from "@/lib/format";
import type { SiteSettings } from "@/lib/types";
import { useOpenState } from "./use-open-state";

type Props = {
  hours: SiteSettings["hours"];
  timeZone: string;
  className?: string;
};

/** "Abierto ahora / Cerrado ahora", calculado en el navegador con la hora de Colombia. */
export function OpenStatus({ hours, timeZone, className = "" }: Props) {
  const state = useOpenState(hours, timeZone);

  return (
    <div className={`min-h-10 ${className}`}>
      {state !== "unknown" && (
        <p className="inline-flex items-center gap-2.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm">
          <span
            aria-hidden="true"
            className={`size-2.5 rounded-full ${state === "open" ? "bg-emerald-500" : "bg-red-500"}`}
          />
          {state === "open"
            ? `Abierto ahora · hasta ${formatTimeWithArticle(hours.close)}`
            : `Cerrado ahora · abrimos a ${formatTimeWithArticle(hours.open)}`}
        </p>
      )}
    </div>
  );
}
