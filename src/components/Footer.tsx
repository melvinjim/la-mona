import { Clock, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatTime } from "@/lib/format";
import type { ChatLink } from "@/lib/order";
import type { SiteSettings } from "@/lib/types";
import { InstagramIcon } from "./brand-icons";
import { buttonClass } from "./button-styles";
import { ChatButton } from "./ChatButton";

const year = new Date().getFullYear();

type Props = {
  site: SiteSettings;
  chat: ChatLink | null;
};

export function Footer({ site, chat }: Props) {
  return (
    <footer
      id="contacto"
      className="on-dark mt-20 scroll-mt-20 bg-ink text-white"
    >
      <div className="mx-auto max-w-6xl px-4 pb-28 pt-14 sm:px-8 lg:pb-12">
        <div className="flex flex-col gap-7 border-b border-white/15 pb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-base font-bold uppercase tracking-[0.22em] text-brand-400">
              ¿Se te antojó algo?
            </p>
            <p className="mt-2 font-display text-[3.25rem] font-extrabold uppercase leading-[0.92] sm:text-6xl">
              Haz tu pedido aquí
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="#menu" className={buttonClass("primary", "lg")}>
              Hacer mi pedido
            </a>
            <ChatButton chat={chat} variant="light" size="lg" />
          </div>
        </div>

        <div className="grid gap-10 pt-12 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              {/* Entrada discreta al panel administrativo. */}
              <Link
                href="/admin"
                prefetch={false}
                aria-label="Panel administrativo"
                title="Panel administrativo"
                className="shrink-0 rounded-full"
              >
                <Image
                  src={site.logo}
                  alt=""
                  width={56}
                  height={56}
                  className="size-14 rounded-full"
                />
              </Link>
              <p className="font-display text-3xl font-extrabold uppercase leading-none tracking-wide">
                {site.fullName}
              </p>
            </div>
            <p className="mt-4 max-w-xs text-[0.95rem] leading-relaxed text-white/70">
              Desayunos, ejecutivos, asados y más para llevar.
            </p>
          </div>

          <div>
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.22em] text-brand-400">
              Horario
            </h2>
            <p className="mt-3 flex items-start gap-2.5 text-[0.95rem] font-semibold">
              <Clock className="mt-0.5 size-5 shrink-0 text-white/60" aria-hidden="true" />
              {formatTime(site.hours.open)} a {formatTime(site.hours.close)}
            </p>
            <h2 className="mt-7 font-display text-sm font-bold uppercase tracking-[0.22em] text-brand-400">
              Medios de pago
            </h2>
            <p className="mt-3 text-[0.95rem] font-semibold">
              {site.payments.join(" · ")}
            </p>
            {site.notAccepted?.length ? (
              <p className="mt-1 text-sm text-white/60">
                No manejamos {site.notAccepted.join(", ")}
              </p>
            ) : null}
          </div>

          <div>
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.22em] text-brand-400">
              Contacto
            </h2>
            <ul className="mt-3 space-y-3 text-[0.95rem] font-semibold">
              {site.instagram && (
                <li>
                  <a
                    href={`https://www.instagram.com/${site.instagram}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 transition hover:text-brand-400"
                  >
                    <InstagramIcon className="size-5 text-white/60" />@
                    {site.instagram}
                  </a>
                </li>
              )}
              {site.phone && (
                <li>
                  <a
                    href={`tel:${site.phone.replace(/[^\d+]/g, "")}`}
                    className="inline-flex items-center gap-2.5 transition hover:text-brand-400"
                  >
                    <Phone className="size-5 text-white/60" aria-hidden="true" />
                    {site.phone}
                  </a>
                </li>
              )}
              {site.address && (
                <li className="flex items-start gap-2.5">
                  <MapPin
                    className="mt-0.5 size-5 shrink-0 text-white/60"
                    aria-hidden="true"
                  />
                  {site.mapsUrl ? (
                    <a
                      href={site.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition hover:text-brand-400"
                    >
                      {site.address}
                    </a>
                  ) : (
                    site.address
                  )}
                </li>
              )}
            </ul>
          </div>
        </div>

        <p className="mt-12 border-t border-white/15 pt-6 text-sm text-white/60">
          © {year} {site.fullName}. Precios en pesos colombianos (COP).
        </p>
      </div>
    </footer>
  );
}
