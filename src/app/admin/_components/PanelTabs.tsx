"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Menú" },
  { href: "/admin/ajustes", label: "Ajustes" },
  { href: "/admin/domicilios", label: "Domicilios" },
  { href: "/admin/qr", label: "Código QR" },
];

/**
 * Las secciones del panel, con la que se está viendo marcada.
 *
 * Sin esa marca lo único que resaltaba era el marco del foco, que queda puesto en el enlace que
 * se tocó: parecía señalar la sección actual y en realidad señalaba la última tocada.
 */
export function PanelTabs() {
  const path = usePathname();

  return (
    <nav
      aria-label="Secciones del panel"
      className="-mx-1 order-last flex w-full gap-1 sm:order-none sm:ml-2 sm:w-auto"
    >
      {TABS.map(({ href, label }) => {
        // "/admin" solo coincide consigo mismo; el resto admite lo que cuelgue debajo.
        const here = href === "/admin" ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={here ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              here ? "bg-ink text-white" : "text-ink hover:bg-sand"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
