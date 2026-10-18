import { ArrowRight, Bike, BookOpen, MapPin, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { InstagramIcon } from "@/components/brand-icons";
import { MadeBy } from "@/components/MadeBy";
import { OpenStatus } from "@/components/OpenStatus";
import { RestaurantSchema } from "@/components/RestaurantSchema";
import { getMenu, getSite } from "@/lib/content";

// La página se regenera sola cada 10 minutos; con el panel administrativo se actualiza al instante.
export const revalidate = 600;

type Choice = {
  href: string;
  icon: LucideIcon;
  title: string;
  text: string;
  /** Lleva fuera del sitio (el mapa): se abre en otra pestaña. */
  external?: boolean;
  /** Cuánto ocupa en la rejilla cuando son tres. */
  span?: string;
};

/*
 * En celular todo se mide contra la altura de la pantalla (svh, la altura con las barras
 * del navegador a la vista) para que la portada entera quepa sin tener que bajar, desde el
 * logo hasta el "Powered by". Desde sm vuelven los tamaños fijos de siempre.
 */
const cardClass =
  "group flex h-full items-center gap-3.5 rounded-[1.5rem] bg-cream p-[clamp(0.7rem,1.9svh,1.25rem)] text-left shadow-pop ring-2 ring-white/70 transition hover:-translate-y-0.5 hover:bg-white active:translate-y-px sm:flex-col sm:items-start sm:gap-5 sm:rounded-[1.75rem] sm:p-7";

function ChoiceCard({ href, icon: Icon, title, text, external = false }: Choice) {
  const inside = (
    <>
      <span className="grid size-[clamp(2.75rem,6.5svh,4rem)] shrink-0 place-items-center rounded-2xl bg-brand-500 text-ink shadow-[0_3px_0_var(--color-brand-800)] sm:size-[4.5rem]">
        <Icon className="size-[clamp(1.35rem,3.2svh,2rem)] sm:size-9" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[clamp(1.35rem,3.4svh,2.1rem)] font-extrabold uppercase leading-none sm:text-[2.6rem]">
          {title}
        </span>
        <span className="mt-1 block text-[clamp(0.78rem,1.7svh,0.95rem)] font-medium leading-snug text-ink-soft sm:mt-1.5 sm:text-base">
          {text}
          {external && <span className="sr-only"> (se abre en una pestaña nueva)</span>}
        </span>
      </span>
      <ArrowRight
        className="size-6 shrink-0 text-brand-700 transition group-hover:translate-x-1 sm:size-7 sm:self-end"
        aria-hidden="true"
      />
    </>
  );

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cardClass}>
      {inside}
    </a>
  ) : (
    <Link href={href} className={cardClass}>
      {inside}
    </Link>
  );
}

/** Primera pantalla del dominio: el cliente elige entre ver el menú o pedir a domicilio. */
export default async function Home() {
  const [site, menu] = await Promise.all([getSite(), getMenu()]);

  // Con menú, domicilios y mapa son tres: el mapa ocupa el ancho hasta que caben las tres.
  const three = Boolean(site.delivery && site.mapsUrl);
  const choices: Choice[] = [
    {
      href: "/menu",
      icon: BookOpen,
      title: "Ver el menú",
      text: "Mira los platos y los precios del local.",
    },
    ...(site.delivery
      ? [
          {
            href: "/domicilios",
            icon: Bike,
            title: "Pedir a domicilio",
            text: "Arma tu pedido: te lo llevamos o pasas a recogerlo.",
          },
        ]
      : []),
    ...(site.mapsUrl
      ? [
          {
            href: site.mapsUrl,
            icon: MapPin,
            title: "Cómo llegar",
            text: site.address ?? "Te abrimos el mapa hasta el restaurante.",
            external: true,
            span: three ? "sm:col-span-2 md:col-span-1" : undefined,
          },
        ]
      : []),
  ];

  return (
    <main className="relative isolate flex min-h-svh flex-col overflow-hidden bg-brand-500 text-ink">
      <RestaurantSchema site={site} menu={menu} />
      {/* Decoración: textura de puntos y círculos de color */}
      <div
        aria-hidden="true"
        className="bg-dots pointer-events-none absolute inset-0 -z-10 opacity-60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 -z-10 size-[28rem] rounded-full bg-brand-400/70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-44 -left-28 -z-10 size-[24rem] rounded-full border-[3.25rem] border-brand-600/35"
      />

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 py-[clamp(0.75rem,2.5svh,3rem)] text-center">
        <Image
          src={site.logo}
          alt=""
          width={112}
          height={112}
          priority
          className="size-[clamp(3.75rem,11svh,6rem)] rounded-full shadow-pop ring-4 ring-white sm:size-28"
        />
        <p className="mt-[clamp(0.5rem,1.4svh,1.25rem)] text-[clamp(0.6rem,1.3svh,0.75rem)] font-bold uppercase tracking-[0.28em]">
          Restaurante
        </p>
        <p className="font-display text-[clamp(2.25rem,7svh,4rem)] font-extrabold uppercase leading-[0.9] text-white sm:text-7xl">
          {site.name}
        </p>

        <h1 className="mt-[clamp(0.75rem,2.4svh,2.25rem)] font-display text-[clamp(1.5rem,4.4svh,3.75rem)] font-extrabold uppercase leading-[0.9] sm:text-[clamp(2.4rem,10vw,3.75rem)]">
          ¿Qué quieres hacer?
        </h1>

        <ul
          className={`mt-[clamp(0.65rem,2svh,1.75rem)] grid w-full gap-[clamp(0.5rem,1.4svh,1rem)] ${
            choices.length === 1
              ? "mx-auto max-w-sm"
              : three
                ? "sm:grid-cols-2 md:grid-cols-3"
                : "sm:grid-cols-2"
          }`}
        >
          {choices.map((choice) => (
            <li key={choice.href} className={choice.span}>
              <ChoiceCard {...choice} />
            </li>
          ))}
        </ul>

        <OpenStatus
          hours={site.hours}
          timeZone={site.timeZone}
          className="mt-[clamp(0.65rem,2svh,2rem)]"
        />

        {site.instagram && (
          <a
            href={`https://www.instagram.com/${site.instagram}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-[clamp(0.15rem,0.8svh,0.75rem)] inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[clamp(0.8rem,1.7svh,0.875rem)] font-bold transition hover:bg-white/30 sm:py-2"
          >
            <InstagramIcon className="size-[clamp(1rem,2.2svh,1.25rem)]" />@{site.instagram}
            <span className="sr-only">(se abre en una pestaña nueva)</span>
          </a>
        )}
      </div>

      <MadeBy className="pb-[clamp(0.6rem,1.8svh,1.75rem)] text-center text-[clamp(0.75rem,1.6svh,0.875rem)] font-medium text-ink/70" />
    </main>
  );
}
