import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Figtree } from "next/font/google";
import type { ReactNode } from "react";
import { getSite } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-barlow-condensed",
});

const body = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  // La ciudad va en el título porque casi todas las búsquedas la llevan ("restaurante en X").
  const brand = site.city ? `${site.fullName} ${site.city}` : site.fullName;
  const title = `${brand} | Menú, domicilios y precios`;

  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s | ${brand}` },
    alternates: { canonical: "/" },
    description: site.description,
    applicationName: site.fullName,
    openGraph: {
      type: "website",
      locale: "es_CO",
      siteName: site.fullName,
      title,
      description: site.description,
    },
    twitter: { card: "summary_large_image", title, description: site.description },
  };
}

export const viewport: Viewport = {
  themeColor: "#fc6402",
  // Al abrir el teclado la página se encoge en vez de quedar tapada: así el botón de
  // enviar y el campo que se está llenando siguen dentro de lo que se ve.
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-CO" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
