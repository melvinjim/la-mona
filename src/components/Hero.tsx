import { ArrowDown, Bike, ChefHat } from "lucide-react";
import Image from "next/image";
import { formatCOP } from "@/lib/format";
import { minPrice, type ChatLink } from "@/lib/order";
import type { MenuCategory, SiteSettings } from "@/lib/types";
import { buttonClass } from "./button-styles";
import { categoryIcons } from "./category-icons";
import { ChatButton } from "./ChatButton";
import { OpenStatus } from "./OpenStatus";

type Props = {
  site: SiteSettings;
  menu: MenuCategory[];
  chat: ChatLink | null;
};

function DeliverySticker({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute -right-6 -top-14 size-24 -rotate-12 place-items-center rounded-full bg-ink p-2 text-center text-white shadow-pop ${className}`}
    >
      <div>
        <Bike className="mx-auto size-6 text-brand-400" aria-hidden="true" />
        <p className="mt-0.5 font-display text-base font-bold uppercase leading-[0.95]">
          Servicio a domicilio
        </p>
      </div>
    </div>
  );
}

/** Resumen de precios con forma de tiquete: sirve mientras no haya foto de portada. */
function PriceTicket({ menu }: { menu: MenuCategory[] }) {
  const rows = menu.flatMap((category) => {
    const price = minPrice(category);
    return price === null
      ? []
      : [{ id: category.id, label: category.name, icon: category.icon, price }];
  });

  return (
    <div className="rotate-2 drop-shadow-[0_26px_24px_rgb(154_48_0/0.5)]">
      <div className="ticket-edge bg-cream px-6 pb-9 pt-6">
        <p className="font-display text-sm font-bold uppercase tracking-[0.22em] text-ink-soft">
          Precios desde
        </p>
        <ul className="mt-2 divide-y divide-dashed divide-line">
          {rows.map(({ id, label, icon, price }) => {
            const Icon = categoryIcons[icon];
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="flex items-center gap-2.5 py-2 transition hover:text-brand-700"
                >
                  <Icon
                    className="size-[1.05rem] shrink-0 text-brand-600"
                    aria-hidden="true"
                  />
                  <span className="text-[0.95rem] font-semibold">{label}</span>
                  <span
                    aria-hidden="true"
                    className="mt-2 min-w-3 flex-1 self-end border-b-2 border-dotted border-ink/35"
                  />
                  <span className="font-display text-xl font-bold text-brand-700">
                    {formatCOP(price)}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function Hero({ site, menu, chat }: Props) {
  return (
    <section
      aria-labelledby="titulo-principal"
      className="px-3 pt-1 sm:px-5 lg:px-8"
    >
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-brand-500 text-ink lg:rounded-[2.5rem]">
        {/* Decoración: textura de puntos y círculos de color */}
        <div
          aria-hidden="true"
          className="bg-dots pointer-events-none absolute inset-0 opacity-60"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 size-[28rem] rounded-full bg-brand-400/70"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-44 -left-28 size-[24rem] rounded-full border-[3.25rem] border-brand-600/35"
        />

        <div className="relative grid gap-10 px-5 pb-24 pt-9 sm:px-10 sm:pt-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-center lg:gap-8 lg:px-14 lg:pb-28 lg:pt-14">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-ink px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white">
              <ChefHat className="size-4 text-brand-400" aria-hidden="true" />
              {site.fullName}
            </p>

            <h1
              id="titulo-principal"
              className="mt-5 font-display text-[clamp(3rem,14vw,4.5rem)] font-extrabold uppercase leading-[0.86] tracking-tight sm:text-[5.75rem] lg:text-[6.75rem]"
            >
              <span className="block text-white">Menú disponible</span>
              <span className="block">para llevar</span>
            </h1>

            <p className="mt-5 max-w-md text-lg font-semibold leading-snug sm:text-xl">
              Desayunos, ejecutivos, asados y más. Arma tu pedido aquí y envíalo por
              WhatsApp{site.delivery ? ", a domicilio o para recoger." : "."}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a
                href="#menu"
                className={buttonClass("dark", "lg", "w-full sm:w-auto")}
              >
                Hacer mi pedido
                <ArrowDown className="size-5" aria-hidden="true" />
              </a>
              <ChatButton
                chat={chat}
                variant="light"
                size="lg"
                className="w-full sm:w-auto"
              />
            </div>

            <OpenStatus
              hours={site.hours}
              timeZone={site.timeZone}
              className="mt-6"
            />
          </div>

          {site.heroImage ? (
            <div className="relative mx-auto w-full max-w-lg lg:max-w-sm">
              <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border-4 border-white shadow-pop sm:aspect-[16/9] lg:aspect-[4/5] lg:rotate-2 lg:rounded-[2rem]">
                <Image
                  src={site.heroImage}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 1024px) 384px, (min-width: 640px) 512px, 90vw"
                  className="object-cover"
                />
              </div>
              {site.delivery && <DeliverySticker className="hidden lg:grid" />}
            </div>
          ) : (
            <div className="relative mx-auto hidden w-full max-w-sm lg:block">
              <PriceTicket menu={menu} />
              {site.delivery && <DeliverySticker className="grid" />}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
