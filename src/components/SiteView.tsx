import { redirect } from "next/navigation";
import { buildCatalog } from "@/lib/cart";
import { getMenu, getSite, getZones } from "@/lib/content";
import { withDeliveryPrices } from "@/lib/delivery";
import { getChatLink, whatsappDigits } from "@/lib/order";
import type { SiteMode } from "@/lib/types";
import { CartBar } from "./cart/CartBar";
import { CartProvider } from "./cart/CartProvider";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { InfoStrip } from "./InfoStrip";
import { MenuSection } from "./MenuSection";
import { MenuShell } from "./MenuShell";
import { PromoModal } from "./PromoModal";

/**
 * Las dos caras del sitio:
 * - "menu": la carta del local (la del QR de las mesas). Solo para ver, con los precios del local.
 * - "domicilio": para pedir. Precios de domicilio, carrito, barrio y envío por WhatsApp.
 */
export async function SiteView({ mode }: { mode: SiteMode }) {
  const ordering = mode === "domicilio";
  const [localMenu, site, zones] = await Promise.all([
    getMenu(),
    getSite(),
    ordering ? getZones() : Promise.resolve([]),
  ]);

  // Si el restaurante apagó los domicilios, esta página no existe: se va a la carta.
  if (ordering && !site.delivery) redirect("/menu");

  const menu = ordering ? withDeliveryPrices(localMenu, site.deliverySurcharge) : localMenu;
  const chat = getChatLink(site);
  const nav = menu.map(({ id, name, navLabel, icon, items }) => ({
    id,
    label: navLabel ?? name,
    icon,
    count: items.length,
  }));

  const page = (
    <>
      <a
        href="#menu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:font-bold focus:text-white"
      >
        Saltar al menú
      </a>

      <Header site={site} mode={mode} />

      <main>
        <Hero site={site} menu={menu} chat={chat} mode={mode} />
        <InfoStrip site={site} mode={mode} />

        <div className="mx-auto mt-16 max-w-6xl px-4 sm:px-8">
          <p className="font-display text-base font-bold uppercase tracking-[0.22em] text-brand-700">
            {ordering ? "Pide a domicilio" : "Carta"}
          </p>
          <h2 className="font-display text-5xl font-extrabold uppercase leading-none sm:text-6xl">
            Nuestro menú
          </h2>
          <p className="mt-3 max-w-xl text-lg text-ink-soft">
            {ordering
              ? "Toca el botón + para agregar a tu pedido; el total se suma solo y lo envías por WhatsApp. Precios de domicilio, en pesos colombianos."
              : "Precios del menú en el local, en pesos colombianos."}
          </p>
        </div>

        <MenuShell categories={nav}>
          {menu.map((category) => (
            <MenuSection key={category.id} category={category} ordering={ordering} />
          ))}
        </MenuShell>

        {!ordering && (
          <p className="mx-auto mt-8 max-w-6xl px-4 text-sm text-ink-soft sm:px-8">
            Se sugiere un servicio voluntario del 10%. El cliente podrá aceptar, modificar o
            rechazar este valor.
          </p>
        )}
      </main>

      <Footer site={site} chat={chat} mode={mode} />
      <PromoModal promo={site.promo} />
    </>
  );

  if (!ordering) return page;

  return (
    <CartProvider
      catalog={buildCatalog(menu)}
      checkout={{
        whatsapp: whatsappDigits(site),
        instagramUrl: site.instagram ? `https://ig.me/m/${site.instagram}` : undefined,
        delivery: site.delivery,
        zones,
        payments: site.payments,
        hours: site.hours,
        timeZone: site.timeZone,
      }}
    >
      {page}
      <CartBar />
    </CartProvider>
  );
}
