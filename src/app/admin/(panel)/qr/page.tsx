import { Download, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import QRCode from "qrcode";
import { getSite } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";
import { PrintButton } from "../../_components/PrintButton";
import { Card } from "../../_components/ui";

export const metadata: Metadata = {
  title: "Código QR",
  robots: { index: false, follow: false },
};

const downloadClass =
  "inline-flex items-center gap-2 rounded-full border-2 border-line bg-white px-4 py-2.5 text-sm font-bold transition hover:border-brand-400";

export default async function QrPage() {
  const site = await getSite();
  const url = `${siteUrl.replace(/\/$/, "")}/menu`;

  const options = {
    margin: 1,
    errorCorrectionLevel: "M" as const,
    color: { dark: "#1a1a16", light: "#ffffff" },
  };
  const [svg, png] = await Promise.all([
    QRCode.toString(url, { ...options, type: "svg" }),
    QRCode.toDataURL(url, { ...options, width: 1200 }),
  ]);

  // Un QR impreso con una dirección de prueba deja de servir cuando se compra el dominio.
  const provisional = /localhost|vercel\.app/.test(url);

  return (
    <div className="space-y-5">
      <div className="print:hidden">
        <h1 className="font-display text-4xl font-extrabold uppercase leading-none">
          Código QR del menú
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          Para pegar en cada mesa: quien lo escanea ve el menú del local, sin carrito.
        </p>
      </div>

      {provisional && (
        <p className="flex items-start gap-2.5 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 ring-1 ring-amber-200 print:hidden">
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <span>
            Este QR apunta a una dirección de prueba ({url}). No lo imprimas todavía: cuando el
            dominio definitivo esté conectado y puesto en Vercel como{" "}
            <code className="font-mono text-xs">NEXT_PUBLIC_SITE_URL</code>, vuelve aquí y se
            generará con la dirección correcta.
          </span>
        </p>
      )}

      <section
        aria-label="Tarjeta para imprimir"
        className="mx-auto max-w-sm rounded-[2rem] border border-line bg-white p-7 text-center shadow-card print:max-w-none print:border-0 print:shadow-none"
      >
        <Image
          src={site.logo}
          alt=""
          width={72}
          height={72}
          className="mx-auto size-[4.5rem] rounded-full"
        />
        <p className="mt-3 text-xs font-bold uppercase tracking-[0.24em] text-ink-soft">
          Restaurante
        </p>
        <p className="font-display text-5xl font-extrabold uppercase leading-none">{site.name}</p>

        <p className="mt-5 font-display text-3xl font-bold uppercase leading-none text-brand-700">
          Escanea y mira nuestro menú
        </p>

        <Image
          src={png}
          alt={`Código QR que abre ${url}`}
          width={320}
          height={320}
          unoptimized
          loading="eager"
          className="mx-auto mt-4 size-72 max-w-full"
        />

        <p className="mt-3 break-all text-sm font-semibold">{url.replace(/^https?:\/\//, "")}</p>
      </section>

      <div className="flex flex-wrap justify-center gap-2 print:hidden">
        <PrintButton />
        <a href={png} download="qr-menu-la-mona.png" className={downloadClass}>
          <Download className="size-4" aria-hidden="true" />
          Descargar PNG
        </a>
        <a
          href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
          download="qr-menu-la-mona.svg"
          className={downloadClass}
        >
          <Download className="size-4" aria-hidden="true" />
          Descargar SVG
        </a>
      </div>

      <div className="print:hidden">
        <Card
          title="Cómo usarlo"
          description="El PNG sirve para pegarlo en un documento o mandarlo a imprimir; el SVG es para imprentas (se puede agrandar sin perder calidad)."
        >
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
            <li>
              Al escanearlo se abre <strong className="text-ink">{url}</strong>, que muestra solo el
              menú, con los precios del local.
            </li>
            <li>
              El QR no cambia aunque cambies precios o platos desde el panel: siempre abre el menú
              actualizado.
            </li>
            <li>
              Imprímelo de 5 cm de lado como mínimo y pruébalo con un celular antes de imprimir
              muchos.
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
