import { ArrowRight, Bike, BookOpen, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { InstagramIcon } from "@/components/brand-icons";
import { OpenStatus } from "@/components/OpenStatus";
import { getSite } from "@/lib/content";

// La página se regenera sola cada 10 minutos; con el panel administrativo se actualiza al instante.
export const revalidate = 600;

function ChoiceCard({
  href,
  icon: Icon,
  title,
  text,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full items-center gap-4 rounded-[1.75rem] bg-cream p-5 text-left shadow-pop ring-2 ring-white/70 transition hover:-translate-y-0.5 hover:bg-white active:translate-y-px sm:flex-col sm:items-start sm:gap-5 sm:p-7"
    >
      <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-brand-500 text-ink shadow-[0_3px_0_var(--color-brand-800)] sm:size-[4.5rem]">
        <Icon className="size-8 sm:size-9" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[2.1rem] font-extrabold uppercase leading-none sm:text-[2.6rem]">
          {title}
        </span>
        <span className="mt-1.5 block text-[0.95rem] font-medium leading-snug text-ink-soft sm:text-base">
          {text}
        </span>
      </span>
      <ArrowRight
        className="size-7 shrink-0 text-brand-700 transition group-hover:translate-x-1 sm:self-end"
        aria-hidden="true"
      />
    </Link>
  );
}

/** Primera pantalla del dominio: el cliente elige entre ver el menú o pedir a domicilio. */
export default async function Home() {
  const site = await getSite();

  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-brand-500 text-ink">
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

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 py-12 text-center">
        <Image
          src={site.logo}
          alt=""
          width={112}
          height={112}
          priority
          className="size-24 rounded-full shadow-pop ring-4 ring-white sm:size-28"
        />
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.28em]">Restaurante</p>
        <p className="font-display text-[4rem] font-extrabold uppercase leading-[0.9] text-white sm:text-7xl">
          {site.name}
        </p>

        <h1 className="mt-9 font-display text-[clamp(2.4rem,10vw,3.75rem)] font-extrabold uppercase leading-[0.9]">
          ¿Qué quieres hacer?
        </h1>

        <ul
          className={`mt-7 grid w-full gap-4 ${site.delivery ? "sm:grid-cols-2" : "mx-auto max-w-sm"}`}
        >
          <li>
            <ChoiceCard
              href="/menu"
              icon={BookOpen}
              title="Ver el menú"
              text="Mira los platos y los precios del local."
            />
          </li>
          {site.delivery && (
            <li>
              <ChoiceCard
                href="/domicilios"
                icon={Bike}
                title="Pedir a domicilio"
                text="Arma tu pedido: te lo llevamos o pasas a recogerlo."
              />
            </li>
          )}
        </ul>

        <OpenStatus hours={site.hours} timeZone={site.timeZone} className="mt-8" />

        {site.instagram && (
          <a
            href={`https://www.instagram.com/${site.instagram}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold transition hover:bg-white/30"
          >
            <InstagramIcon className="size-5" />@{site.instagram}
            <span className="sr-only">(se abre en una pestaña nueva)</span>
          </a>
        )}
      </div>
    </main>
  );
}
