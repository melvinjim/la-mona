import { Bike, Clock, MapPin, Wallet, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { formatTime } from "@/lib/format";
import type { SiteSettings } from "@/lib/types";

type Item = {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  note?: string;
};

export function InfoStrip({ site }: { site: SiteSettings }) {
  const items: Item[] = [
    {
      icon: Clock,
      label: "Horario",
      value: `${formatTime(site.hours.open)} a ${formatTime(site.hours.close)}`,
    },
    ...(site.delivery
      ? [
          {
            icon: Bike,
            label: "Domicilio",
            value: "Servicio a domicilio disponible",
          },
        ]
      : []),
    ...(site.address
      ? [
          {
            icon: MapPin,
            label: "Dónde estamos",
            value: site.mapsUrl ? (
              <a
                href={site.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-brand-300 decoration-2 underline-offset-4 transition hover:text-brand-700"
              >
                {site.address}
              </a>
            ) : (
              site.address
            ),
          },
        ]
      : []),
    {
      icon: Wallet,
      label: "Medios de pago",
      value: site.payments.join(" · "),
      note: site.notAccepted?.length
        ? `No manejamos ${site.notAccepted.join(", ")}`
        : undefined,
    },
  ];

  return (
    <section
      id="horario"
      aria-label="Horario, domicilio, ubicación y medios de pago"
      className="relative z-10 mx-auto -mt-12 max-w-5xl scroll-mt-24 px-3 sm:px-8"
    >
      <ul className="flex flex-col divide-y divide-line rounded-3xl border border-line bg-white shadow-card lg:flex-row lg:divide-x lg:divide-y-0">
        {items.map(({ icon: Icon, label, value, note }) => (
          <li
            key={label}
            className="flex items-start gap-4 p-5 lg:flex-1 lg:p-6"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <Icon className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-soft">
                {label}
              </p>
              <p className="mt-1 text-base font-semibold leading-snug">
                {value}
              </p>
              {note && <p className="mt-0.5 text-sm text-ink-soft">{note}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
