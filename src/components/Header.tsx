import Image from "next/image";
import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { InstagramIcon } from "./brand-icons";
import { CartButton } from "./cart/CartButton";

const links = [
  { href: "#menu", label: "Menú" },
  { href: "#horario", label: "Horario" },
  { href: "#contacto", label: "Contacto" },
];

export function Header({ site }: { site: SiteSettings }) {
  return (
    <header className="relative z-40 bg-cream lg:sticky lg:top-0 lg:border-b lg:border-line/80">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-4 px-4 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label={`${site.fullName}, inicio`}
        >
          <Image
            src={site.logo}
            alt=""
            width={48}
            height={48}
            priority
            className="size-12 rounded-full"
          />
          <span className="leading-none">
            <span className="block text-[0.6875rem] font-bold uppercase tracking-[0.24em] text-ink-soft">
              Restaurante
            </span>
            <span className="mt-0.5 block font-display text-[1.9rem] font-extrabold uppercase tracking-wide text-ink">
              {site.name}
            </span>
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-9 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[0.95rem] font-semibold text-ink transition hover:text-brand-700"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          {site.instagram && (
            <a
              href={`https://www.instagram.com/${site.instagram}/`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de La Mona (se abre en una pestaña nueva)"
              className="grid size-11 place-items-center rounded-full border border-line bg-white text-ink transition hover:border-brand-300 hover:text-brand-700"
            >
              <InstagramIcon className="size-5" />
            </a>
          )}
          <div className="hidden lg:block">
            <CartButton />
          </div>
        </div>
      </div>
    </header>
  );
}
